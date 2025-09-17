defmodule ScreenplayWeb.AuthController do
  use ScreenplayWeb, :controller

  plug Ueberauth

  def callback(conn = %{assigns: %{ueberauth_auth: auth}}, _params) do
    username = auth.uid
    name = auth.info.name

    auth_time =
      Map.get(
        auth.extra.raw_info.claims,
        "auth_time",
        auth.extra.raw_info.claims["iat"]
      )

    keycloak_client_id =
      get_in(Application.get_env(:ueberauth_oidcc, :providers), [:keycloak, :client_id])

    roles =
      get_in(auth.extra.raw_info.userinfo, ["resource_access", keycloak_client_id, "roles"]) || []

    previous_path = Plug.Conn.get_session(conn, :previous_path_from_auth)
    Plug.Conn.delete_session(conn, :previous_path_from_auth)

    conn
    |> configure_session(drop: true)
    |> Guardian.Plug.sign_in(
      ScreenplayWeb.AuthManager,
      username,
      %{auth_time: auth_time, roles: roles},
      ttl: {1, :minute}
    )
    |> Plug.Conn.put_session(:username, name || username)
    # Redirect to whatever page they came from
    |> redirect(to: previous_path)
  end

  def callback(
        conn = %{assigns: %{ueberauth_failure: %Ueberauth.Failure{}}},
        _params
      ) do
    send_resp(conn, 401, "unauthenticated")
  end

  ## Fallback handlers for unknown/unconfigured "providers"

  def callback(conn, _) do
    send_resp(conn, 404, "Not Found")
  end

  def request(conn, _) do
    send_resp(conn, 404, "Not Found")
  end
end
