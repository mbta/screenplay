defmodule Screenplay.EmergencyTakeoverTool.Alerts.S3Fetch do
  @moduledoc false
  require Logger

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

  @spec with_asset_path(String.t()) :: String.t()
  def with_asset_path(path_suffix) do
    "https://#{bucket()}.s3.amazonaws.com/#{asset_directory()}#{path_suffix}"
  end

  defp asset_directory, do: "screenplay/#{env_name()}/emergency-takeovers/"
  defp bucket, do: Application.get_env(:screenplay, :alerts_s3_bucket)
  defp env_name, do: Application.get_env(:screenplay, :environment_name)
end
