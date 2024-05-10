defmodule ScreenplayWeb.EnsurePaMessageAdmin do
  @moduledoc """
  Verify that the user has permission to access the PA Message Creation feature.
  """

  import Plug.Conn, only: [halt: 1]
  import Phoenix.Controller, only: [redirect: 2]

  def init(options), do: options

  def call(conn = %{assigns: %{roles: roles}}, _opts) do
    if :pa_message_admin in roles do
      conn
    else
      conn
      |> redirect(to: "/dashboard")
      |> halt()
    end
  end
end
