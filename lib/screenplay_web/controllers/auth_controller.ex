defmodule ScreenplayWeb.AuthController do
  use ScreenplayWeb, :controller

  require Logger

  plug Ueberauth

  @spec request(Plug.Conn.t(), any) :: Plug.Conn.t()
  def request(conn, %{"provider" => provider}) when provider != "cognito" do
    send_resp(conn, 404, "Not Found")
  end

  @spec callback(Plug.Conn.t(), any) :: Plug.Conn.t()
  def callback(conn, %{"provider" => provider}) when provider != "cognito" do
    send_resp(conn, 404, "Not Found")
  end

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

  def callback(
        conn = %{assigns: %{ueberauth_failure: %Ueberauth.Failure{errors: errors}}},
        _params
      ) do
    error_messages =
      errors
      |> Enum.flat_map(fn
        %Ueberauth.Failure.Error{message: message} when is_binary(message) -> [message]
        _ -> []
      end)
      |> Enum.join(", ")

    _ = Logger.info("[ueberauth_failure] messages=\"#{error_messages}\"")

    send_resp(conn, 401, "unauthenticated")
  end

  # Need more investigation to set up logout function
  # @spec logout(Plug.Conn.t(), map()) :: Plug.Conn.t()
  # def logout(conn, params) do
  #   redirect_url = logout_redirect_url(conn, params["provider"])

  #   conn
  #   # we don't specify AuthManager :think:
  #   |> Guardian.Plug.sign_out(AuthManager)
  #   |> clear_session()

  #   case redirect_url do
  #     nil -> redirect(conn, to: "/dashboard")
  #     _ -> redirect(conn, external: redirect_url)
  #   end
  # end

  # @spec logout_redirect_url(Plug.Conn.t(), String.t()) :: String.t()
  # defp logout_redirect_url(conn, "cognito") do
  #   auth_domain =
  #     :ueberauth
  #     |> Application.get_env(Ueberauth.Strategy.Cognito)
  #     |> Keyword.get(:auth_domain)
  #     |> IO.inspect(label: "auth domain")

  #   redirect_params =
  #     URI.encode_query(%{
  #       "client_id" =>
  #         :ueberauth
  #         |> Application.get_env(Ueberauth.Strategy.Cognito)
  #         |> Keyword.get(:client_id),
  #       "logout_uri" => ScreenplayWeb.Router.Helpers.dashboard_url(conn, :index)
  #     })

  #   case auth_domain do
  #     nil -> nil
  #     _ -> "https://#{auth_domain}/logout?" <> redirect_params
  #   end
  # end
end
