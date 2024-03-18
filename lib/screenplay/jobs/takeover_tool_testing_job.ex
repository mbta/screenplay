defmodule Screenplay.Jobs.TakeoverToolTestingJob do
  @moduledoc false

  require Logger

  @test_sftp_directory_name "ZZZ-MBTA-TEST"

  def run do
    conn = start_connection()

    try do
      test_creating_and_removing_images(conn)
    rescue
      e ->
        Sentry.capture_message(
          "[takeover_tool_testing sftp_connection_error] #{inspect(e)}",
          level: "error"
        )
    after
      sftp_client_module().disconnect(conn)
    end
  end

  defp test_creating_and_removing_images(conn) do
    Enum.each(["Portrait", "Landscape"], fn orientation ->
      upload_image(conn, orientation)
      delete_image(conn, orientation)
    end)
  end

  defp start_connection() do
    host = Application.get_env(:screenplay, :outfront_sftp_domain)
    user = Application.get_env(:screenplay, :outfront_sftp_user)
    key = Application.get_env(:screenplay, :outfront_ssh_key)

    case sftp_client_module().connect(
           host: host,
           user: user,
           key_cb: {Screenplay.Outfront.SSHKeyProvider, private_key: key}
         ) do
      {:ok, sftp_conn} ->
        sftp_conn

      {:error, error} ->
        Sentry.capture_message(
          "[takeover_tool_testing sftp_connection_error] #{inspect(error)}",
          level: "error"
        )
    end
  end

  defp upload_image(conn, orientation) do
    remote_path = Path.join([orientation, @test_sftp_directory_name, "takeover_test.png"])

    case sftp_client_module().upload_file(conn, "", remote_path) do
      :ok ->
        :ok

      {:error, error} ->
        Sentry.capture_message(
          "[takeover_tool_testing sftp_connection_error] #{inspect(error)}",
          level: "error"
        )
    end
  end

  defp delete_image(conn, orientation) do
    remote_path = Path.join([orientation, @test_sftp_directory_name, "takeover_test.png"])

    case sftp_client_module().delete_file(conn, remote_path) do
      :ok ->
        :ok

      {:error, %SFTPClient.OperationError{reason: :no_such_file}} ->
        Logger.info("Skipping deleting #{orientation} test image as file does not exist")

        :ok

      {:error, error} ->
        Sentry.capture_message(
          "[takeover_tool_testing sftp_connection_error] #{inspect(error)}",
          level: "error"
        )
    end
  end

  defp sftp_client_module do
    Application.get_env(:screenplay, :sftp_client_module)
  end
end
