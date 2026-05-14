defmodule Screenplay.EmergencyTakeoverTool.Alerts.TestFetch do
  @moduledoc false

  @spec get_state!() :: binary()
  def get_state! do
    File.read!("test/fixtures/alerts.json")
  end

  @spec put_state!(binary()) :: :ok
  def put_state!(_state) do
    :ok
  end

  @spec upload_takeover_image(String.t(), binary(), String.t()) :: :ok
  def upload_takeover_image(_alert_id, _image_data, _image_type) do
    :ok
  end

  @spec delete_takeover_images(String.t()) :: :ok
  def delete_takeover_images(_alert_id) do
    :ok
  end

  def emergency_asset_path do
    "test/fixtures/emergency_takeover_images/"
  end
end
