defmodule Screenplay.Outfront.SFTPTest do
  @moduledoc """
  This module handles the CRUD functions to the SFTP server
  """

  require Logger

  @retries 3

  def test_connection do
    start_connection()
  end

  defp sftp_client_module do
    SFTPClient
  end

  defp start_connection(retry \\ @retries)

  defp start_connection(_retry = 0),
    do: {:error, "Could not establish SFTP connection after #{@retries} attempts!"}

  defp start_connection(retry) do
    host = "em-api.outfrontmediadigital.com"
    user = "MBTA_EMessaging"
    key = Application.get_env(:screenplay, :outfront_ssh_key)

    if is_binary(key) and String.length(key) > 0 do
      Logger.info("Outfront SSH key is a valid string")
    else
      Logger.info("Outfront SSH key is not a string as expected: #{key}")
    end

    case sftp_client_module().connect(
           host: host,
           user: user,
           key_cb: {Screenplay.Outfront.SSHKeyProvider, private_key: key}
         ) do
      {:ok, sftp_conn} ->
        sftp_client_module().disconnect(sftp_conn)
        :ok

      {:error, error} ->
        Logger.error("[sftp_connection_error] #{inspect(error)}")
        start_connection(retry - 1)
    end
  end
end
