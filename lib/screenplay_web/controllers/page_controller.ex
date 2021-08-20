defmodule ScreenplayWeb.PageController do
  use ScreenplayWeb, :controller

  # alias Screenplay.Outfront.SFTP

  # @local_path Application.compile_env(:screenplay, :sftp_local_path)

  def index(conn, _params) do
    # SFTP.set_takeover_image(["Station 2", "Station 1"], File.stream!("#{@local_path}/phoenix.png", [], 32_768), File.stream!("#{@local_path}/phoenix.png", [], 32_768))
    # SFTP.clear_images(["Station 2", "Station 1", "Station 3"])

    render(conn, "index.html")
  end
end
