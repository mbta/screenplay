defmodule Screenplay.Config.S3Fetch do
  @moduledoc false

  require Logger

  @behaviour Screenplay.Config.Fetch

  def get_config do
    with {:ok, config_contents} <- do_get(:config),
         {:ok, location_contents} <- do_get(:screen_locations),
         {:ok, place_description_contents} <- do_get(:place_descriptions),
         {:ok, config_json} <- Jason.decode(config_contents),
         {:ok, location_json} <- Jason.decode(location_contents),
         {:ok, place_description_json} <- Jason.decode(place_description_contents) do
      {:ok, config_json, location_json, place_description_json}
    else
      _ -> :error
    end
  end

  defp do_get(file_spec) do
    bucket = Application.get_env(:screenplay, :config_s3_bucket)
    path = config_path_for_environment(file_spec)

    get_operation = ExAws.S3.get_object(bucket, path)

    case ExAws.request(get_operation) do
      {:ok, %{body: body, status_code: 200}} ->
        {:ok, body}

      {:error, err} ->
        Logger.error(err)
        :error
    end
  end

  defp config_path_for_environment(file_spec) do
    base_path = "screenplay/#{Application.get_env(:screenplay, :environment_name, "dev")}"

    case file_spec do
      :config -> "#{base_path}/places_and_screens.json"
      :screen_locations -> "#{base_path}/screen_locations.json"
      :place_descriptions -> "#{base_path}/place_descriptions.json"
    end
  end
end
