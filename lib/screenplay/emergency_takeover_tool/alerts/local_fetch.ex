defmodule Screenplay.EmergencyTakeoverTool.Alerts.LocalFetch do
  @moduledoc false

  # sobelow_skip ["Traversal.FileModule"]
  @spec get_state!() :: binary()
  def get_state! do
    file_path() |> File.read!()
  end

  # sobelow_skip ["Traversal.FileModule"]
  @spec put_state!(binary()) :: :ok
  def put_state!(state) do
    file_path() |> File.write!(state)
    :ok
  end

  @spec upload_takeover_image(String.t(), binary(), String.t()) :: :ok
  def upload_takeover_image(alert_id, image_data, image_type) do
    image_dir = emergency_asset_path() |> Path.join(alert_id)
    File.mkdir_p!(image_dir)

    image_path = Path.join(image_dir, "#{image_type}.png")
    File.write!(image_path, image_data)
    :ok
  end

  @spec delete_takeover_images(String.t()) :: :ok
  def delete_takeover_images(alert_id) do
    image_dir = emergency_asset_path() |> Path.join(alert_id)

    if File.exists?(image_dir) do
      File.rm_rf!(image_dir)
    end

    :ok
  end

  # TODO: What if I wrote this to the Screens directory?
  # "../screens/priv/static/images/emergency-takeovers"
  def emergency_asset_path do
    Path.join([:code.priv_dir(:screenplay), "local", "emergency-takeovers"])
  end

  defp file_path, do: Path.join([:code.priv_dir(:screenplay), "local", "alerts.json"])
end
