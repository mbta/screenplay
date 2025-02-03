defmodule ScreenplayWeb.AuthManager.EnsureRole do
  @moduledoc "Ensure the authenticated user has the specified role."

  alias Phoenix.Controller
  alias Plug.Conn
  alias ScreenplayWeb.Router.Helpers, as: Routes

  def init(role), do: role

  def call(conn = %{assigns: %{roles: roles}}, role) do
    if role in roles do
      conn
    else
      case Controller.get_format(conn) do
        "html" ->
          conn
          |> Controller.redirect(to: Routes.unauthorized_path(conn, :index))
          |> Conn.halt()

        _ ->
          conn |> Conn.send_resp(:unauthorized, "Unauthorized") |> Conn.halt()
      end
    end
  end
end
