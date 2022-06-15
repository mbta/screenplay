defmodule ScreenplayWeb.DashboardController do
  use ScreenplayWeb, :controller

  alias Screenplay.Util

  plug(:username)

  def index(conn, _params) do
    render(conn, "index.html")
  end

  defp username(conn, _) do
    username =
      conn
      |> get_session("username")
      |> Util.trim_username()

    assign(conn, :username, username)
  end
end
