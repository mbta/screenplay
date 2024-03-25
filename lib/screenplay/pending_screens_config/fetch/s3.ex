defmodule Screenplay.PendingScreensConfig.Fetch.S3 do
  @moduledoc """
  Functions to work with an S3-hosted copy of the pending screens config.
  """

  require Logger

  alias Screenplay.PendingScreensConfig.Fetch
  alias ScreensConfig.PendingConfig

  @behaviour Fetch

  @impl true
  def fetch_config do
    bucket = Application.get_env(:screenplay, :config_s3_bucket)
    path = config_path_for_environment()

    get_operation = ExAws.S3.get_object(bucket, path)

    case ExAws.request(get_operation) do
      {:ok, %{body: body, headers: headers, status_code: 200}} ->
        metadata = get_metadata(headers)
        {:ok, body, metadata}

      {:error, err} ->
        _ = Logger.info("s3_pending_screens_config_fetch_error #{inspect(err)}")
        :error
    end
  end

  @impl true
  def commit, do: :ok

  @impl true
  def revert(version) do
    bucket = Application.get_env(:screenplay, :config_s3_bucket)
    path = config_path_for_environment()

    get_operation = ExAws.S3.get_object(bucket, path, version_id: version)
    %{body: body, status_code: 200} = ExAws.request!(get_operation)

    put_operation = ExAws.S3.put_object(bucket, path, body)
    ExAws.request!(put_operation)
  end

  @impl true
  def put_config(config) do
    json = config |> PendingConfig.to_json() |> Jason.encode!(pretty: true)
    bucket = Application.get_env(:screenplay, :config_s3_bucket)
    path = config_path_for_environment()
    put_operation = ExAws.S3.put_object(bucket, path, json)

    case ExAws.request(put_operation) do
      {:ok, %{status_code: 200}} -> :ok
      _ -> :error
    end
  end

  defp get_metadata(headers) do
    headers = Map.new(headers)

    etag = Map.get(headers, "ETag")
    version_id = Map.get(headers, "x-amz-version-id")

    last_modified =
      headers
      |> Map.get("Last-Modified")
      |> Timex.parse("{RFC1123}")
      |> case do
        {:ok, dt} -> dt
        {:error, _} -> nil
      end

    %Fetch.Metadata{etag: etag, version_id: version_id, last_modified: last_modified}
  end

  defp config_path_for_environment do
    "screens/pending-screens-#{Application.get_env(:screenplay, :environment_name)}.json"
  end
end
