defmodule ScreenplayWeb.Plugs.EnsureApiAuth do
  @moduledoc """
  Plug used to verify a request contains a valid API key in the x-api-key request header.
  """

  import Plug.Conn

  def init(default), do: default

  def call(conn, _default) do
    api_key = Plug.Conn.get_req_header(conn, "x-api-key")

    if api_key != Application.get_env(:screenplay, :api_key) do
      conn |> send_resp(403, "Invalid API key") |> halt()
    else
      conn
    end
  end
end
