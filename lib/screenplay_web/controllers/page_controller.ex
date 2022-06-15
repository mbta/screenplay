defmodule ScreenplayWeb.PageController do
  use ScreenplayWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end

  def takeover_redirect(conn, _params) do
    redirect(conn, to: Routes.page_path(conn, :index))
  end
end
