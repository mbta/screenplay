defmodule ScreenplayWeb.DashboardController do
  use ScreenplayWeb, :controller

  alias Screenplay.Util

  plug(:username)
  plug(:sentry_dsn)
  plug(:screens_url)
  plug(:signs_ui_url)

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

  defp sentry_dsn(conn, _) do
    dsn =
      if Application.get_env(:screenplay, :record_sentry, false) do
        Application.get_env(:screenplay, :sentry_frontend_dsn)
      else
        ""
      end

    assign(conn, :sentry_frontend_dsn, dsn)
  end

  defp screens_url(conn, _) do
    assign(conn, :screens_url, Application.get_env(:screenplay, :screens_url))
  end

  defp signs_ui_url(conn, _) do
    assign(conn, :signs_ui_url, Application.get_env(:screenplay, :signs_ui_url))
  end
end
