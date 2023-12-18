defmodule ScreenplayWeb.UnauthorizedController do
  use ScreenplayWeb, :controller

  def index(conn, _params) do
    conn
    |> put_status(403)
    |> render("index.html", layout: {ScreenplayWeb.LayoutView, "error.html"})
  end
end
