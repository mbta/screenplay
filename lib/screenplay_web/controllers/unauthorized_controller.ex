defmodule ScreenplayWeb.UnauthorizedController do
  use ScreenplayWeb, :controller

  def index(conn, _params) do
    conn
    |> put_status(403)
    |> put_layout("error.html")
    |> render("index.html")
  end
end