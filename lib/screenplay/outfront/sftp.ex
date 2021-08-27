defmodule Screenplay.Outfront.SFTP do
  @moduledoc """
  This module handles the CRUD functions to the SFTP server
  """
  @orientations ["Portrait", "Landscape"]
  @retries 3

  @host Application.compile_env(:screenplay, :sftp_host)
  @user Application.compile_env(:screenplay, :sftp_user)
  @password Application.compile_env(:screenplay, :sftp_password)
  @remote_path Application.compile_env(:screenplay, :sftp_remote_path)

  @stations_map %{
    "Station 1" => "STATION-1",
    "Station 2" => "STATION-2",
    "Station 3" => "STATION-3"
  }

  defp start_connection(retry \\ @retries)
  defp start_connection(_retry = 0), do: raise("Could not establish SFTP connection")

  defp start_connection(retry) do
    case SFTPClient.connect(host: @host, user: @user, password: @password) do
      {:ok, sftp_conn} -> sftp_conn
      {:error, _error} -> start_connection(retry - 1)
    end
  end

  def set_takeover_image(stations, portrait_png, landscape_png) do
    sftp_conn = start_connection()

    post_image(sftp_conn, portrait_png, stations, "Portrait")
    post_image(sftp_conn, landscape_png, stations, "Landscape")

    SFTPClient.disconnect(sftp_conn)
  end

  defp post_image(sftp_conn, image_stream, stations, orientation, retry \\ @retries)

  defp post_image(_sftp_conn, _image_stream, _stations, _orientation, _retry = 0),
    do: raise("Too many attempts for: post_image")

  defp post_image(sftp_conn, image_stream, stations, orientation, retry) do
    Enum.each(stations, fn station ->
      outfront_station = get_outfront_station_name(station)

      # First, check to see if that station has a screen of that orientation
      if station_has_screen_orientation(sftp_conn, outfront_station, orientation) do
        target_stream =
          SFTPClient.stream_file!(
            sftp_conn,
            "#{@remote_path}/#{orientation}/#{outfront_station}/new-file.png"
          )

        try do
          image_stream
          |> Stream.into(target_stream)
          |> Stream.run()
        rescue
          _e -> post_image(image_stream, sftp_conn, stations, orientation, retry - 1)
        end
      end
    end)
  end

  defp get_outfront_station_name(station) do
    _ = Map.get(@stations_map, station)

    # Temporarily always use test station directory
    "ZZZ_TEST_STATION"
  end

  def clear_images(stations) do
    sftp_conn = start_connection()

    for station <- stations, orientation <- @orientations do
      outfront_station = get_outfront_station_name(station)
      # First, check to see if this station has a sign with that orientation
      if station_has_screen_orientation(sftp_conn, outfront_station, orientation) do
        image_name = get_outfront_image_name(sftp_conn, outfront_station, orientation)
        delete_station_images(sftp_conn, outfront_station, orientation, image_name)
      end
    end

    SFTPClient.disconnect(sftp_conn)
  end

  defp delete_station_images(stfp_conn, station, orientation, image_name, retry \\ @retries)

  defp delete_station_images(_sftp_conn, _station, _orientation, _image_name, _retry = 0),
    do: raise("Too many attempts for: delete_station_images")

  defp delete_station_images(_sftp_conn, _station, _orientation, _image_name = nil, _retry),
    do: :ok

  defp delete_station_images(sftp_conn, station, orientation, image_name, retry) do
    case SFTPClient.delete_file(
           sftp_conn,
           "#{@remote_path}/#{orientation}/#{station}/#{image_name}"
         ) do
      :ok -> :ok
      _ -> delete_station_images(sftp_conn, station, orientation, image_name, retry - 1)
    end
  end

  defp station_has_screen_orientation(conn, station, orientation, retry \\ @retries)

  defp station_has_screen_orientation(_conn, _station, _orientation, _retry = 0),
    do: 'Too many attempts for: station_has_screen_orientation'

  defp station_has_screen_orientation(conn, station, orientation, retry) do
    case SFTPClient.list_dir(conn, "#{@remote_path}/#{orientation}") do
      {:ok, stations_by_screen_type} -> station in stations_by_screen_type
      _ -> station_has_screen_orientation(conn, station, orientation, retry - 1)
    end
  end

  defp get_outfront_image_name(sftp_conn, station, orientation, retry \\ @retries)

  defp get_outfront_image_name(_sftp_conn, _station, _orientation, _retry = 0),
    do: raise("Too many attempts for: get_outfront_image_name")

  defp get_outfront_image_name(sftp_conn, station, orientation, retry) do
    case SFTPClient.list_dir(sftp_conn, "#{@remote_path}/#{orientation}/#{station}") do
      {:ok, [image_name]} -> image_name
      {:ok, []} -> nil
      {:error, _error} -> get_outfront_image_name(sftp_conn, station, orientation, retry - 1)
    end
  end
end
