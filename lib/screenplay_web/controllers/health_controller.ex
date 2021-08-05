defmodule ScreenplayWeb.HealthController do
  use ScreenplayWeb, :controller

  def index(conn, _params) do
    send_resp(conn, 200, "")
  end
end
