defmodule ScreenplayWeb.AuthController do
  use ScreenplayWeb, :controller

  plug Ueberauth

  def request(conn, %{"provider" => provider}) when provider != "keycloak" do
    send_resp(conn, 404, "Not Found")
  end

  def callback(conn = %{assigns: %{ueberauth_auth: auth}}, _params) do
    username = auth.uid
    name = auth.info.name

    keycloak_client_id =
      get_in(Application.get_env(:ueberauth_oidcc, :providers), [:keycloak, :client_id])

    roles =
      get_in(auth.extra.raw_info.userinfo, ["resource_access", keycloak_client_id, "roles"]) || []

    previous_path = Plug.Conn.get_session(conn, :previous_path)
    conn = delete_session(conn, :previous_path)

    auth_time =
      Map.get(
        auth.extra.raw_info.claims,
        "auth_time",
        auth.extra.raw_info.claims["iat"]
      )

    logout_url =
      case UeberauthOidcc.initiate_logout_url(auth, %{
             post_logout_redirect_uri: "https://www.mbta.com/"
           }) do
        {:ok, url} ->
          url

        _ ->
          nil
      end

    conn
    |> configure_session(drop: true)
    |> put_session(:logout_url, logout_url)
    |> Guardian.Plug.sign_in(
      ScreenplayWeb.AuthManager,
      username,
      %{auth_time: auth_time, roles: roles}
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
end
