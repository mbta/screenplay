defmodule ScreenplayWeb.AuthController do
  use ScreenplayWeb, :controller

  plug Ueberauth

  @spec callback(Plug.Conn.t(), any) :: Plug.Conn.t()
  def request(conn, %{"provider" => provider}) when provider != "cognito" do
    send_resp(conn, 404, "Not Found")
  end

  @spec callback(Plug.Conn.t(), any) :: Plug.Conn.t()
  def callback(conn, %{"provider" => provider}) when provider != "cognito" do
    send_resp(conn, 404, "Not Found")
  end

  @spec callback(Plug.Conn.t(), any) :: Plug.Conn.t()
  def callback(conn = %{assigns: %{ueberauth_auth: auth}}, _params) do
    username = auth.uid
    name = auth.info.name
    expiration = auth.credentials.expires_at
    credentials = auth.credentials

    current_time = System.system_time(:second)

    previous_path = Plug.Conn.get_session(conn, :previous_path)
    Plug.Conn.delete_session(conn, :previous_path)

    conn
    |> Guardian.Plug.sign_in(
      ScreenplayWeb.AuthManager,
      username,
      %{groups: credentials.other.groups},
      ttl: {expiration - current_time, :seconds}
    )
    |> Plug.Conn.put_session(:username, name || username)
    # Redirect to whatever page they came from
    |> redirect(to: previous_path)
  end

  @spec callback(Plug.Conn.t(), any) :: Plug.Conn.t()
  def callback(
        conn = %{assigns: %{ueberauth_failure: %Ueberauth.Failure{}}},
        _params
      ) do
    send_resp(conn, 401, "unauthenticated")
  end

  @spec logout(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def logout(conn, _params) do
    conn
    |> Guardian.Plug.sign_out(AuthManager)
    |> clear_session()
    |> redirect(to: "/dashboard")
  end
end
