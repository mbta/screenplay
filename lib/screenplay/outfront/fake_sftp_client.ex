defmodule Screenplay.Outfront.FakeSFTPClient do
  @moduledoc """
  This module has the same interace as SFTPClient for the functions which are called by
  Screenplay.Outfront.SFTP, but rather than actually modifying files on Outfront's SFTP server,
  it logs the action which it would take if it were connected. We'll use this on dev, since
  there's no dev version of that server.
  """

  require Logger

  def connect(_opts) do
    _ = Logger.info("Connecting to fake SFTP server")

    {:ok, nil}
  end

  def disconnect(_conn) do
    _ = Logger.info("Disconnecting from fake SFTP server")

    :ok
  end

  def write_file(_conn, path, _data) do
    _ = Logger.info("Writing to fake #{path}")

    :ok
  end

  def delete_file(_conn, path) do
    _ = Logger.info("Deleting file at fake #{path}")

    :ok
  end

  def list_dir(_conn, path) do
    _ = Logger.info("Listing directories at fake #{path}")

    {:ok, []}
  end
end
