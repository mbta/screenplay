defmodule ScreenplayWeb.AuthManager.ErrorHandler do
  @moduledoc """
  Custom Guardian error handler.
  """

  @behaviour Guardian.Plug.ErrorHandler

  alias ScreenplayWeb.Router.Helpers

  @impl Guardian.Plug.ErrorHandler
  def auth_error(conn, {_type, _reason}, _opts) do
    Phoenix.Controller.redirect(conn, to: Helpers.auth_path(conn, :request, "cognito"))
  end
end