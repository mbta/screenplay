defmodule ScreenplayWeb.Plugs.Metadata do
  @moduledoc false

  import Plug.Conn

  alias Screenplay.Util

  def init(default), do: default

  def call(conn, _default) do
    env_vars(conn)
  end

  defp env_vars(conn) do
    username =
      conn
      |> Plug.Conn.fetch_session()
      |> Plug.Conn.get_session("username")
      |> Util.trim_username()

    dsn =
      if Application.get_env(:screenplay, :record_sentry, false) do
        Application.get_env(:screenplay, :sentry_frontend_dsn)
      else
        ""
      end

    claims = Guardian.Plug.current_claims(conn)

    conn
    |> assign(:username, username)
    |> assign(:environment_name, Application.get_env(:screenplay, :environment_name, "dev"))
    |> assign(:sentry_frontend_dsn, dsn)
    |> assign(:alerts_ui_url, Application.get_env(:screenplay, :alerts_ui_url))
    |> assign(:screens_url, Application.get_env(:screenplay, :screens_url))
    |> assign(:signs_ui_url, Application.get_env(:screenplay, :signs_ui_url))
    |> assign(:roles, ScreenplayWeb.AuthManager.claims_access_level(claims))
    |> assign(:fullstory_org_id, Application.get_env(:screenplay, :fullstory_org_id))
  end
end
