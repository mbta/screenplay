defmodule ScreenplayWeb.PageController do
  use ScreenplayWeb, :controller

  alias Screenplay.Outfront.SFTP

  def index(conn, _params) do
    # SFTP.set_takeover_image(["Station 2", "Station 1"])
    # SFTP.get_outfront_image("STATION-1", "Landscape")
    SFTP.clear_images(["Station 2", "Station 1", "Station 3"])
  
    render(conn, "index.html")
  end
end
