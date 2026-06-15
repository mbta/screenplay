defmodule Screenplay.EmergencyTakeoverTool.Alerts.TestFetch do
  @moduledoc false

  @spec upload_takeover_image(String.t(), binary(), String.t()) :: :ok
  def upload_takeover_image(_alert_id, _image_data, _image_type) do
    :ok
  end

  @spec with_asset_path(String.t()) :: String.t()
  def with_asset_path(path_suffix) do
    "test/fixtures/emergency_takeover_images/#{path_suffix}"
  end
end
