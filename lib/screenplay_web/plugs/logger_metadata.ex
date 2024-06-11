defmodule ScreenplayWeb.Plugs.LoggerMetadata do
  @moduledoc """
  Adds `conn` data to Logger metadata
  """
  @behaviour Plug

  @impl true
  def init(opts), do: opts

  @impl true
  def call(conn, _opts) do
    conn
    |> client_ip()
  end

  defp client_ip(conn) do
    remote_ip =
      conn.remote_ip
      |> :inet_parse.ntoa()
      |> to_string()

    forwarded_ip =
      conn
      |> Plug.Conn.get_req_header("x-forwarded-for")
      |> List.first()

    client_ip = forwarded_ip || remote_ip

    Logger.metadata(client_ip: client_ip)

    conn
  end
end
