defmodule Screenplay.PendingScreensConfig.Fetch.S3 do
  @moduledoc """
  Functions to work with an S3-hosted copy of the pending screens config.
  """

  alias ScreensConfig.PendingConfig

  require Logger

  alias ScreensConfig.PendingConfig

  @behaviour Screenplay.PendingScreensConfig.Fetch

  @impl true
  def fetch_config(current_version \\ nil) do
    bucket = Application.get_env(:screenplay, :config_s3_bucket)
    path = config_path_for_environment()

    opts =
      case current_version do
        nil -> []
        _ -> [if_none_match: current_version]
      end

    get_operation = ExAws.S3.get_object(bucket, path, opts)

    case ExAws.request(get_operation) do
      {:ok, %{status_code: 304}} ->
        :unchanged

      {:ok, %{body: body, headers: headers, status_code: 200}} ->
        version_id =
          headers
          |> Enum.into(%{})
          |> Map.get("x-amz-version-id")

        {:ok, body, version_id}

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

  defp config_path_for_environment do
    "screens/pending-screens-#{Application.get_env(:screenplay, :environment_name)}.json"
  end
end
