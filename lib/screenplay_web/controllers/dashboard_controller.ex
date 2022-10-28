defmodule ScreenplayWeb.DashboardController do
  use ScreenplayWeb, :controller

  alias Screenplay.Util

  plug(:env_vars)

  def index(conn, _params) do
    render(conn, "index.html", clarity_tag: System.get_env("CLARITY_TAG"))
  end

  defp env_vars(conn, _) do
    username =
      conn
      |> get_session("username")
      |> Util.trim_username()

    dsn =
      if Application.get_env(:screenplay, :record_sentry, false) do
        Application.get_env(:screenplay, :sentry_frontend_dsn)
      else
        ""
      end

    conn
    |> assign(:username, username)
    |> assign(:environment_name, Application.get_env(:screenplay, :environment_name, "dev"))
    |> assign(:sentry_frontend_dsn, dsn)
    |> assign(:alerts_ui_url, Application.get_env(:screenplay, :alerts_ui_url))
    |> assign(:screens_url, Application.get_env(:screenplay, :screens_url))
    |> assign(:signs_ui_url, Application.get_env(:screenplay, :signs_ui_url))
  end
end
