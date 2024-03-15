defmodule ScreenplayWeb.EnsureScreensAdminGroup do
  @moduledoc """
  Verify that the user has permission to access Permanent Configuration.
  """

  import Plug.Conn, only: [halt: 1]
  import Phoenix.Controller, only: [redirect: 2]

  def init(options), do: options

  def call(conn, _opts) do
    with claims <- Guardian.Plug.current_claims(conn),
         true <- :screens_admin in ScreenplayWeb.AuthManager.claims_access_level(claims) do
      conn
    else
      _ ->
        conn
        |> redirect(to: "/dashboard")
        |> halt()
    end
  end
end
