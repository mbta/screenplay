defmodule ScreenplayWeb.AuthManager.Pipeline do
  @moduledoc false

  use Guardian.Plug.Pipeline,
    otp_app: :screenplay,
    error_handler: ScreenplayWeb.AuthManager.ErrorHandler,
    module: ScreenplayWeb.AuthManager

  plug :fetch_session
  plug :save_previous_path
  plug(Guardian.Plug.VerifySession, claims: %{"typ" => "access"})
  plug(Guardian.Plug.VerifyHeader, claims: %{"typ" => "access"})
  plug(Guardian.Plug.LoadResource, allow_blank: true)
  plug :refresh_idle_token

  @doc """
  Refreshes the token with each request.
  This allows us to use the `iat` time in the token as an idle timeout.
  """
  def refresh_idle_token(conn, _opts) do
    old_token = Guardian.Plug.current_token(conn)

    case ScreenplayWeb.AuthManager.refresh(old_token) do
      {:ok, _old, {new_token, _new_claims}} ->
        Guardian.Plug.put_session_token(conn, new_token)

      _ ->
        conn
    end
  end

  # A plug to save the current path before the auth process loses it through several
  # redirects. We use this path in auth_controller to send us back to the original url
  def save_previous_path(conn, _opts) do
    Plug.Conn.put_session(conn, :previous_path, conn.request_path)
  end
end
