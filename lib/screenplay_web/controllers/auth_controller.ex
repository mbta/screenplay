defmodule ScreenplayWeb.AuthController do
  use ScreenplayWeb, :controller

  plug Ueberauth

  def request(conn, %{"provider" => provider}) when provider != "cognito" do
    send_resp(conn, 404, "Not Found")
  end

  def callback(conn, %{"provider" => provider}) when provider != "cognito" do
    send_resp(conn, 404, "Not Found")
  end

  def callback(conn = %{assigns: %{ueberauth_auth: auth}}, _params) do
    username = auth.uid
    name = auth.info.name
    expiration = auth.credentials.expires_at
    credentials = auth.credentials

    current_time = System.system_time(:second)

    previous_path = conn.private[:plug_session]["previous_path"]

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

  def callback(
        conn = %{assigns: %{ueberauth_failure: %Ueberauth.Failure{}}},
        _params
      ) do
    send_resp(conn, 401, "unauthenticated")
  end
end
