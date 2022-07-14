defmodule ScreenplayWeb.DashboardController do
  use ScreenplayWeb, :controller

  alias Screenplay.Util

  plug(:username)
  plug(:environment_name)

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

  defp environment_name(conn, _) do
    assign(conn, :environment_name, Application.get_env(:screenplay, :environment_name, "dev"))
  end
end
