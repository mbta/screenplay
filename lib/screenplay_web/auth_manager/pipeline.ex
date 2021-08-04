defmodule ScreenplayWeb.AuthManager.Pipeline do
  @moduledoc false

  use Guardian.Plug.Pipeline,
    otp_app: :screenplay,
    error_handler: ScreenplayWeb.AuthManager.ErrorHandler,
    module: ScreenplayWeb.AuthManager

  plug(Guardian.Plug.VerifySession, claims: %{"typ" => "access"})
  plug(Guardian.Plug.VerifyHeader, claims: %{"typ" => "access"})
  plug(Guardian.Plug.LoadResource, allow_blank: true)
end
