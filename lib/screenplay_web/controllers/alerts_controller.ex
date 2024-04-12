defmodule ScreenplayWeb.AlertsController do
  use ScreenplayWeb, :controller

  require Logger

  def index(conn, _params) do
    Logger.error("Testing for Sentry")
    render(conn, "index.html")
  end
end
