defmodule ScreenplayWeb.EnsureScreenplayGroup do
  @moduledoc """
  Verify that the user is in our Cognito group.
  """

  import Plug.Conn

  def init(options), do: options

  def call(conn, _opts) do
    with %{"groups" => groups} <- Guardian.Plug.current_claims(conn),
         true <- is_list(groups),
         screenplay_group <- Application.get_env(:screenplay, :cognito_group),
         true <- screenplay_group in groups do
      conn
    else
      _ ->
        conn
        |> Phoenix.Controller.redirect(
          to: ScreenplayWeb.Router.Helpers.unauthorized_path(conn, :index)
        )
        |> halt()
    end
  end
end
