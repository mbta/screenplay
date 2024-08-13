defmodule Screenplay.Config.S3Fetch do
  @moduledoc false

  require Logger

  @behaviour Screenplay.Config.Fetch

  @impl true
  def get_places_and_screens do
    with {:ok, config_contents, version_id} <- do_get(:config),
         {:ok, config_json} <- Jason.decode(config_contents) do
      {:ok, add_labels_to_config(config_json), version_id}
    else
      _ -> :error
    end
  end

  @impl true
  def get_locations do
    with {:ok, location_contents, version_id} <- do_get(:screen_locations),
         {:ok, location_json} <- Jason.decode(location_contents) do
      {:ok, location_json, version_id}
    else
      _ -> :error
    end
  end

  @impl true
  def get_place_descriptions do
    with {:ok, place_description_contents, version_id} <- do_get(:place_descriptions),
         {:ok, place_description_json} <- Jason.decode(place_description_contents) do
      {:ok, place_description_json, version_id}
    else
      _ -> :error
    end
  end

  @impl true
  def put_config(file_contents) do
    encoded_contents =
      case Jason.encode(file_contents, pretty: true) do
        {:ok, contents} -> contents
        {:error, _} -> :error
      end

    bucket = Application.get_env(:screenplay, :config_s3_bucket)
    path = config_path_for_environment(:config)
    put_operation = ExAws.S3.put_object(bucket, path, encoded_contents)

    case ExAws.request(put_operation) do
      {:ok, %{status_code: 200}} -> :ok
      _ -> :error
    end
  end

  @impl true
  def commit, do: :ok

  @impl true
  def revert(version) do
    bucket = Application.get_env(:screenplay, :config_s3_bucket)
    path = config_path_for_environment(:config)

    get_operation = ExAws.S3.get_object(bucket, path, version_id: version)
    %{body: body, status_code: 200} = ExAws.request!(get_operation)

    put_operation = ExAws.S3.put_object(bucket, path, body)
    ExAws.request!(put_operation)
  end

  defp do_get(file_spec) do
    bucket = Application.get_env(:screenplay, :config_s3_bucket)
    path = config_path_for_environment(file_spec)

    get_operation = ExAws.S3.get_object(bucket, path)

    case ExAws.request(get_operation) do
      {:ok, %{body: body, headers: headers, status_code: 200}} ->
        version_id =
          headers
          |> Enum.into(%{})
          |> Map.get("x-amz-version-id")

        {:ok, body, version_id}

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

      :paess_labels ->
        "#{base_path}/paess_labels.json"
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

  defp add_labels_to_config(config) do
    with {:ok, paess_labels_content, _} <- do_get(:paess_labels),
         {:ok, paess_labels_json} <- Jason.decode(paess_labels_content) do
      Enum.reduce(
        config,
        [],
        fn place, acc ->
          new_screens =
            Enum.reduce(
              place["screens"],
              [],
              fn screen, acc ->
                [Map.put(screen, "label", Map.get(paess_labels_json, screen["id"])) | acc]
              end
            )

          [Map.put(place, "screens", new_screens) | acc]
        end
      )
    else
      _ -> config
    end
  end
end
