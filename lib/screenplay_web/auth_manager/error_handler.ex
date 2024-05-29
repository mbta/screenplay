defmodule ScreenplayWeb.AuthManager.ErrorHandler do
  @moduledoc """
  Custom Guardian error handler.
  """

  use ScreenplayWeb, :plug

  @behaviour Guardian.Plug.ErrorHandler

  @impl Guardian.Plug.ErrorHandler
  def auth_error(conn, {_type, _reason}, _opts) do
    Phoenix.Controller.redirect(conn, to: ~p"/auth/keycloak")
  end
end
