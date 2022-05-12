defmodule ScreenplayWeb.DashboardController do
  use ScreenplayWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
