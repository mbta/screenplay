defmodule ScreenplayWeb.PageController do
  use ScreenplayWeb, :controller

  alias Screenplay.Outfront.SFTP

  def index(conn, _params) do
    # SFTP.set_takeover_image(["Station 2", "Station 1"])
    # SFTP.get_outfront_image("STATION-3", "Landscape")
    # SFTP.get_outfront_image("STATION-2", "Landscape")
    # SFTP.get_outfront_image("STATION-2", "Portrait")
    SFTP.clear_images(["Station 2", "Station 1", "Station 3"])

    render(conn, "index.html")
  end
end
