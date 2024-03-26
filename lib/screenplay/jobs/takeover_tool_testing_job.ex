defmodule Screenplay.Jobs.TakeoverToolTestingJob do
  @moduledoc """
  Module that executes automated testing for the OFM Takeover Tool.
  Job tests two things:
  1. We have the ability to write to and delete from the test folder `ZZZ-MBTA-TEST`
  2. We see all station folders that we expect to see depending on the screens located at the station.
  """
  @dialyzer {:no_match, write_image: 3, delete_image: 2}

  alias Screenplay.Outfront.SFTP

  require Logger

  @test_sftp_directory_name "ZZZ-MBTA-TEST"
  @landscape_dir Application.compile_env!(:screenplay, :landscape_dir)
  @portrait_dir Application.compile_env!(:screenplay, :portrait_dir)
  @test_image :screenplay |> :code.priv_dir() |> Path.join("takeover_test.png") |> File.read!()

  def run do
    SFTP.run(fn conn ->
      test_creating_and_removing_images(conn)
      test_all_directories_exist(conn)
    end)
  end

  defp test_creating_and_removing_images(conn) do
    Enum.each([@portrait_dir, @landscape_dir], fn orientation ->
      write_image(conn, orientation, @test_image)
      delete_image(conn, orientation)
    end)
  end

  defp write_image(conn, orientation, local_image_data) do
    remote_path = Path.join([orientation, @test_sftp_directory_name, "takeover-test.png"])

    case sftp_client_module().write_file(conn, remote_path, local_image_data) do
      :ok ->
        Logger.info("Successfully uploaded #{orientation} test image")
        :ok

      {:error, error} ->
        Logger.error(
          "[takeover_tool_testing sftp_connection_error] Failed to write image to #{orientation} #{inspect(error)}"
        )
    end
  end

  defp delete_image(conn, orientation) do
    remote_path = Path.join([orientation, @test_sftp_directory_name, "takeover-test.png"])

    case sftp_client_module().delete_file(conn, remote_path) do
      :ok ->
        Logger.info("Successfully deleted #{orientation} test image")
        :ok

      {:error, %SFTPClient.OperationError{reason: :no_such_file}} ->
        Logger.info("Skipping deleting #{orientation} test image as file does not exist")
        :ok

      {:error, error} ->
        Logger.error(
          "[takeover_tool_testing sftp_connection_error] failed to delete from #{orientation} #{inspect(error)}"
        )
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

    log_missing_dirs(portrait_dirs, portrait_stations, @portrait_dir)
    log_missing_dirs(landscape_dirs, landscape_stations, @landscape_dir)
  end

  defp log_missing_dirs(sftp_dirs, stations, orientation) do
    Enum.each(stations, fn %{name: station_name} ->
      station_dir = SFTP.get_outfront_directory_for_station(station_name)

      if station_dir not in sftp_dirs do
        Logger.error(
          "[takeover_tool_testing sftp_connection_error] missing #{orientation} directory for station #{station_name}"
        )
      end
    end)
  end

  defp sftp_client_module, do: Application.get_env(:screenplay, :sftp_client_module)
end
