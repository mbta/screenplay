defmodule ScreenplayWeb.EnsureScreenplayAdminGroup do
  @moduledoc """
  Verify that the user has permission to access the Outfront Takeover Tool.
  """

  import Plug.Conn

  alias ScreenplayWeb.Router.Helpers

  def init(options), do: options

  def call(conn, _opts) do
    with claims <- Guardian.Plug.current_claims(conn),
         true <- ScreenplayWeb.AuthManager.claims_access_level(claims) == :emergency_admin do
      conn
    else
      _ ->
        conn
        |> Phoenix.Controller.redirect(to: Helpers.unauthorized_path(conn, :index))
        |> halt()
    end
  end
end
