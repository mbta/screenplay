defmodule Screenplay.Places.S3Fetch do
  @moduledoc false

  require Logger

  @behaviour Screenplay.Places.Fetch

  @impl true
  def get_paess_labels do
    with {:ok, paess_labels_contents, _} <- do_get(:paess_labels),
         {:ok, paess_labels_json} <- Jason.decode(paess_labels_contents) do
      {:ok, paess_labels_json}
    else
      _ -> :error
    end
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
    path_env = Application.get_env(:screenplay, :environment_name)

    case file_spec do
      :screens ->
        "screens/screens-#{path_env}.json"

      :paess_labels ->
        "screenplay/#{path_env}/paess_labels.json"
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
