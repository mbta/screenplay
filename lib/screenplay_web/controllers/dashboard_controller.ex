defmodule ScreenplayWeb.DashboardController do
  use ScreenplayWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end

  def root_redirect(conn, _params) do
    redirect(conn, to: ~p"/dashboard")
  end
end
