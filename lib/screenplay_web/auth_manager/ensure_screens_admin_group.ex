defmodule ScreenplayWeb.EnsureScreensAdminGroup do
  @moduledoc """
  Verify that the user has permission to access Permanent Configuration.
  """

  import Plug.Conn

  alias ScreenplayWeb.Router.Helpers

  def init(options), do: options

  def call(conn, _opts) do
    with claims <- Guardian.Plug.current_claims(conn),
         true <- :screens_admin in ScreenplayWeb.AuthManager.claims_access_level(claims) do
      conn
    else
      _ ->
        conn
        |> Phoenix.Controller.redirect(to: Helpers.unauthorized_path(conn, :index))
        |> halt()
    end
  end
end
