defmodule ScreenplayWeb.EnsurePaMessageAdmin do
  @moduledoc """
  Verify that the user has permission to access the PA Message Creation feature.
  """

  import Plug.Conn, only: [halt: 1]
  import Phoenix.Controller, only: [redirect: 2]

  def init(options), do: options

  def call(conn, _opts) do
    with claims <- Guardian.Plug.current_claims(conn),
         true <- :pa_message_admin in ScreenplayWeb.AuthManager.claims_access_level(claims) do
      conn
    else
      _ ->
        conn
        |> redirect(to: "/dashboard")
        |> halt()
    end
  end
end
