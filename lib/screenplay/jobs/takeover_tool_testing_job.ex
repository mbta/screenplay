defmodule Screenplay.Jobs.TakeoverToolTestingJob do
  @moduledoc """
  Module that executes automated testing for the OFM Takeover Tool.
  Job tests two things:
  1. We have the ability to write to and delete from the test folder `ZZZ-MBTA-TEST`
  2. We see all station folders that we expect to see depending on the screens located at the station.
  """

  alias Screenplay.Outfront.SFTP

  require Logger

  @test_sftp_directory_name "ZZZ-MBTA-TEST"

  def run do
    conn = start_connection()

    try do
      test_creating_and_removing_images(conn)
      test_all_directories_exist(conn)
    rescue
      e ->
        message = "[takeover_tool_testing sftp_connection_error] #{inspect(e)}"
        Logger.error(message)
        Sentry.capture_message(message, level: "error")
    after
      sftp_client_module().disconnect(conn)
    end
  end

  # sobelow_skip ["Traversal.FileModule"]
  defp test_creating_and_removing_images(conn) do
    local_image_path = Path.join(:code.priv_dir(:screenplay), "takeover_test.png")
    local_image_data = File.read!(local_image_path)

    Enum.each(["Portrait", "Landscape"], fn orientation ->
      write_image(conn, orientation, local_image_data)
      delete_image(conn, orientation)
    end)
  end

  defp start_connection do
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
        message =
          "[takeover_tool_testing sftp_connection_error] Failed to connect: #{inspect(error)}"

        Logger.error(message)
        Sentry.capture_message(message, level: "error")
    end
  end

  defp write_image(conn, orientation, local_image_data) do
    remote_path = Path.join([orientation, @test_sftp_directory_name, "takeover.png"])

    case sftp_client_module().write_file(conn, remote_path, local_image_data) do
      :ok ->
        :ok

      {:error, error} ->
        message =
          "[takeover_tool_testing sftp_connection_error] Failed to write image to #{orientation} #{inspect(error)}"

        Logger.error(message)
        Sentry.capture_message(message, level: "error")
    end
  end

  defp delete_image(conn, orientation) do
    remote_path = Path.join([orientation, @test_sftp_directory_name, "takeover.png"])

    case sftp_client_module().delete_file(conn, remote_path) do
      :ok ->
        :ok

      {:error, %SFTPClient.OperationError{reason: :no_such_file}} ->
        Logger.info("Skipping deleting #{orientation} test image as file does not exist")

        :ok

      {:error, error} ->
        message =
          "[takeover_tool_testing sftp_connection_error] failed to delete from #{orientation} #{inspect(error)}"

        Logger.error(message)
        Sentry.capture_message(message, level: "error")
    end
  end

  defp test_all_directories_exist(conn) do
    {:ok, portrait_dirs} = sftp_client_module().list_dir(conn, "./Portrait")
    {:ok, landscape_dirs} = sftp_client_module().list_dir(conn, "./Landscape")

    outfront_takeover_tool_screens =
      :screenplay
      |> Application.get_env(:outfront_takeover_tool_screens)
      |> Map.values()
      |> List.flatten()
      |> Enum.uniq()

    portrait_stations = Enum.filter(outfront_takeover_tool_screens, & &1.portrait)
    landscape_stations = Enum.filter(outfront_takeover_tool_screens, & &1.landscape)

    log_missing_dirs(portrait_dirs, portrait_stations, "Portrait")
    log_missing_dirs(landscape_dirs, landscape_stations, "Landscape")
  end

  defp log_missing_dirs(sftp_dirs, stations, orientation) do
    Enum.each(stations, fn station ->
      %{name: station_name} = station
      station_dir = SFTP.get_outfront_directory_for_station(station_name)

      if station_dir not in sftp_dirs do
        message =
          "[takeover_tool_testing sftp_connection_error] missing #{orientation} directory for station #{station_name}"

        Logger.error(message)
        Sentry.capture_message(message, level: "error")
      end
    end)
  end

  defp sftp_client_module do
    Application.get_env(:screenplay, :sftp_client_module)
  end
end
