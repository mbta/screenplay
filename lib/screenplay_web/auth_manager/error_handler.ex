defmodule ScreenplayWeb.AuthManager.ErrorHandler do
  @moduledoc """
  Custom Guardian error handler.
  """

  use ScreenplayWeb, :plug

  @behaviour Guardian.Plug.ErrorHandler

  @impl Guardian.Plug.ErrorHandler
  def auth_error(conn, error, _opts) do
    auth_params = auth_params_for_error(error)
    Phoenix.Controller.redirect(conn, to: ~p"/auth/keycloak?#{auth_params}")
  end

  def auth_params_for_error({:invalid_token, {:auth_expired, sub}}) do
    # if we know the user who was logged in before, provide that upstream to simplify
    # logging in
    "prompt=login&login_hint=#{sub}"
  end

  def auth_params_for_error({:unauthenticated, _}) do
    ""
  end

  def auth_params_for_error(_) do
    "prompt=login"
  end
end
