defmodule Screenplay.Config.S3Fetch do
  @moduledoc false

  require Logger

  @behaviour Screenplay.Config.Fetch

  @impl true
  def get_config do
    with {:ok, config_contents, _} <- do_get(:config),
         {:ok, location_contents, _} <- do_get(:screen_locations),
         {:ok, place_description_contents, _} <- do_get(:place_descriptions),
         {:ok, config_json} <- Jason.decode(config_contents),
         {:ok, location_json} <- Jason.decode(location_contents),
         {:ok, place_description_json} <- Jason.decode(place_description_contents) do
      {:ok, config_json, location_json, place_description_json}
    else
      _ -> :error
    end
  end

  def get_screens_config do
    with {:ok, screens_contents, etag} <- do_get(:screens),
         {:ok, screens_json} <- Jason.decode(screens_contents) do
      {:ok, screens_json, etag}
    else
      _ -> :error
    end
  end

  @impl true
  def put_config(file_contents) do
    bucket = Application.get_env(:screenplay, :config_s3_bucket)
    path = config_path_for_environment(:config)
    put_operation = ExAws.S3.put_object(bucket, path, file_contents)

    case ExAws.request(put_operation) do
      {:ok, %{status_code: 200}} -> :ok
      _ -> :error
    end
  end

  defp do_get(file_spec) do
    bucket = Application.get_env(:screenplay, :config_s3_bucket)
    path = config_path_for_environment(file_spec)

    get_operation = ExAws.S3.get_object(bucket, path)

    case ExAws.request(get_operation) do
      {:ok, %{body: body, headers: headers, status_code: 200}} ->
        etag =
          headers
          |> Enum.into(%{})
          |> Map.get("ETag")

        {:ok, body, etag}

      {:error, err} ->
        Logger.error(err)
        :error
    end
  end

  defp config_path_for_environment(file_spec) do
    base_path = "screenplay/#{Application.get_env(:screenplay, :environment_name)}"

    case file_spec do
      :config ->
        "#{base_path}/places_and_screens.json"

      :screen_locations ->
        "#{base_path}/screen_locations.json"

      :place_descriptions ->
        "#{base_path}/place_descriptions.json"

      :screens ->
        "screens/screens-#{Application.get_env(:screenplay, :environment_name)}.json"
    end
  end

  def put_screens_config(config) do
    bucket = Application.get_env(:screenplay, :config_s3_bucket)
    path = config_path_for_environment(:screens)

    put_operation = ExAws.S3.put_object(bucket, path, Jason.encode!(config, pretty: true))

    case ExAws.request(put_operation) do
      {:ok, %{status_code: 200}} ->
        :ok

      _ ->
        {:error, :config_not_written}
    end
  end
end
