defmodule ScreenplayWeb.Screenplay.DashboardController do
  use ScreenplayWeb, :controller

  alias Screenplay.Util

  plug(:username)
  plug(:environment_name)
  plug(:sentry_dsn)

  def index(conn, _params) do
    render(conn, "index.html", clarity_tag: System.get_env("CLARITY_TAG"))
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

  defp sentry_dsn(conn, _) do
    dsn =
      if Application.get_env(:screenplay, :record_sentry, false) do
        Application.get_env(:screenplay, :sentry_frontend_dsn)
      else
        ""
      end

    assign(conn, :sentry_frontend_dsn, dsn)
  end
end
