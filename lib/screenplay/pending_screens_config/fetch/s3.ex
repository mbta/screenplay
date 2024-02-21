defmodule Screenplay.PendingScreensConfig.Fetch.S3 do
  @moduledoc """
  Functions to work with an S3-hosted copy of the pending screens config.
  """

  require Logger

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
  def put_config(file_contents) do
    bucket = Application.get_env(:screenplay, :config_s3_bucket)
    path = config_path_for_environment()
    put_operation = ExAws.S3.put_object(bucket, path, file_contents)

    case ExAws.request(put_operation) do
      {:ok, %{status_code: 200}} -> :ok
      _ -> :error
    end
  end

  defp config_path_for_environment do
    "screens/pending-screens-#{Application.get_env(:screenplay, :environment_name)}.json"
  end
end
