defmodule Screenplay.EmergencyTakeoverTool.Alerts.S3Fetch do
  @moduledoc false
  require Logger

  @spec get_state!() :: binary()
  def get_state! do
    %{body: body, status_code: 200} = ExAws.S3.get_object(bucket(), path()) |> ExAws.request!()
    body
  end

  @spec put_state!(binary()) :: :ok
  def put_state!(state) do
    %{status_code: 200} = ExAws.S3.put_object(bucket(), path(), state) |> ExAws.request!()
    :ok
  end

  @spec upload_takeover_image(String.t(), binary(), String.t()) :: :ok
  def upload_takeover_image(alert_id, image_data, image_type) do
    image_path = "#{asset_directory()}#{alert_id}/#{image_type}.png"

    case ExAws.S3.put_object(bucket(), image_path, image_data,
           content_type: "image/png",
           acl: :public_read
         )
         |> ExAws.request() do
      {:ok, %{status_code: 200}} ->
        :ok

      {:ok, response} ->
        Logger.error("Error uploading takeover image to S3: #{inspect(response)}")
        :error

      {:error, reason} ->
        Logger.error("Error uploading takeover image to S3: #{inspect(reason)}")
        :error
    end
  end

  @spec delete_takeover_images(String.t()) :: :ok
  def delete_takeover_images(alert_id) do
    image_path_prefix = "#{asset_directory()}#{alert_id}/"

    image_paths =
      ["indoor_portrait", "outdoor_portrait", "indoor_landscape", "outdoor_landscape"]
      |> Enum.map(&"#{image_path_prefix}#{&1}.png")

    case ExAws.S3.delete_multiple_objects(bucket(), image_paths) |> ExAws.request() do
      {:ok, %{deleted: _, errors: []}} ->
        :ok

      # Even on errors, we don't want to crash the process since deletion isn't essential.
      {:ok, %{deleted: _, errors: errors}} ->
        Logger.error("Error deleting images from S3: #{inspect(errors)}")
        :ok

      {:error, reason} ->
        Logger.error("Error deleting images from S3: #{inspect(reason)}")
        :ok
    end
  end

  @spec with_asset_path(String.t()) :: String.t()
  def with_asset_path(path_suffix) do
    "https://#{bucket()}.s3.amazonaws.com/#{asset_directory()}#{path_suffix}"
  end

  defp asset_directory, do: "screenplay/#{env_name()}/emergency-takeovers/"
  defp bucket, do: Application.get_env(:screenplay, :alerts_s3_bucket)
  defp path, do: Application.get_env(:screenplay, :alerts_s3_path)
  defp env_name, do: Application.get_env(:screenplay, :environment_name)
end
