defmodule ScreenplayWeb.EnsureScreenplayEmergencyAdminGroup do
  @moduledoc """
  Verify that the user has permission to access the Outfront Takeover Tool.
  """

  import Plug.Conn

  alias ScreenplayWeb.Router.Helpers

  def init(options), do: options

  def call(conn = %{assigns: %{roles: roles}}, _opts) do
    if :emergency_admin in roles do
      conn
    else
      conn
      |> Phoenix.Controller.redirect(to: Helpers.unauthorized_path(conn, :index))
      |> halt()
    end
  end
end
