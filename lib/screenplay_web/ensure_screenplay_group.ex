defmodule ScreenplayWeb.EnsureScreenplayGroup do
  @moduledoc """
  Verify that the user is in our Cognito group.
  """

  import Plug.Conn

  def init(opts) do
    Keyword.put_new(
      opts,
      :screenplay_group,
      Application.get_env(:screenplay, :cognito_group)
    )
  end

  def call(conn, opts) do
    with %{"groups" => groups} <- Guardian.Plug.current_claims(conn),
          true <- is_list(groups),
          screenplay_group = Keyword.fetch!(opts, :screenplay_group),
          true <- screenplay_group in groups do
      conn
    else
      _ ->
        conn
        |> Phoenix.Controller.redirect(external: "https://www.mbta.com")
        |> halt()
    end
  end
end