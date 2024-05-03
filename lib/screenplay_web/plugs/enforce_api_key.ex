defmodule ScreenplayWeb.Plugs.EnforceApiKey do
  @moduledoc """
  Plug used to verify a request contains a valid API key in the x-api-key request header.
  """

  import Plug.Conn

  @api_key Application.compile_env!(:screenplay, :api_key)

  def init(default), do: default

  def call(conn, _default) do
    api_key =
      Enum.find_value(conn.req_headers, fn {key, value} -> if(key == "x-api-key", do: value) end)

    if api_key != @api_key do
      conn |> send_resp(403, "Invalid API key") |> halt()
    else
      conn
    end
  end
end
