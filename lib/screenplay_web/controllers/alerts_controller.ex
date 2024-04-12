defmodule ScreenplayWeb.AlertsController do
  use ScreenplayWeb, :controller

  require Logger

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
