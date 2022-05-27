defmodule ScreenplayWeb.AuthManager.Pipeline do
  @moduledoc false

  use Guardian.Plug.Pipeline,
    otp_app: :screenplay,
    error_handler: ScreenplayWeb.AuthManager.ErrorHandler,
    module: ScreenplayWeb.AuthManager

  plug :save_previous_path
  plug(Guardian.Plug.VerifySession, claims: %{"typ" => "access"})
  plug(Guardian.Plug.VerifyHeader, claims: %{"typ" => "access"})
  plug(Guardian.Plug.LoadResource, allow_blank: true)

  # A plug to save the current path before the auth process loses it through several
  # redirects. We use this path in auth_controller to send us back to the original url
  def save_previous_path(conn, _opts) do
    Plug.Conn.put_session(conn, :previous_path, conn.request_path)
  end
end
