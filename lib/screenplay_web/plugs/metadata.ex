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

    conn
    |> assign(:username, username)
    |> assign(:environment_name, Application.get_env(:screenplay, :environment_name, "dev"))
    |> assign(:sentry_frontend_dsn, dsn)
    |> assign(:alerts_ui_url, Application.get_env(:screenplay, :alerts_ui_url))
    |> assign(:screens_url, Application.get_env(:screenplay, :screens_url))
    |> assign(:signs_ui_url, Application.get_env(:screenplay, :signs_ui_url))
    |> assign(:is_emergency_admin, emergency_admin?(conn))
    |> assign(:is_pa_message_admin, pa_message_admin?(conn))
    |> assign(:fullstory_org_id, Application.get_env(:screenplay, :fullstory_org_id))
  end

  defp emergency_admin?(conn) do
    claims = Guardian.Plug.current_claims(conn)

    :emergency_admin in ScreenplayWeb.AuthManager.claims_access_level(claims)
  end

  defp pa_message_admin?(conn) do
    claims = Guardian.Plug.current_claims(conn)

    :pa_message_admin in ScreenplayWeb.AuthManager.claims_access_level(claims)
  end
end
