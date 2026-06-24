defmodule Screenplay.EmergencyTakeoverTool.Images.LocalFetch do
  @moduledoc false

  # sobelow_skip ["Traversal.FileModule"]
  @spec upload_takeover_image(String.t(), binary(), String.t()) :: :ok
  def upload_takeover_image(alert_id, image_data, image_type) do
    image_dir = asset_directory() |> Path.join(alert_id)
    File.mkdir_p!(image_dir)

    image_path = Path.join(image_dir, "#{image_type}.png")
    File.write!(image_path, image_data)
    :ok
  end

  @spec with_asset_path(String.t()) :: String.t()
  def with_asset_path(path_suffix) do
    "#{asset_directory()}#{path_suffix}"
  end

  defp asset_directory,
    do: Path.join([:code.priv_dir(:screenplay), "local", "emergency-takeovers"])
end
