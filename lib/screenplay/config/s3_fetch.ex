defmodule Screenplay.Config.S3Fetch do
  @moduledoc false

  require Logger

  @behaviour Screenplay.Config.Fetch

  def get_config do
    case do_get() do
      {:ok, file_contents} -> Jason.decode(file_contents)
      _ -> :error
    end
  end

  defp do_get do
    bucket = Application.get_env(:screenplay, :config_s3_bucket)
    path = config_path_for_environment()

    get_operation = ExAws.S3.get_object(bucket, path)

    case ExAws.request(get_operation) do
      {:ok, %{body: body, status_code: 200}} ->
        {:ok, body}

      {:error, err} ->
        Logger.error(err)
        :error
    end
  end

  defp config_path_for_environment do
    "screenplay/#{Application.get_env(:screenplay, :environment_name, "dev")}/places_and_screens.json"
  end
end
