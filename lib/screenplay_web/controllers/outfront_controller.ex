defmodule ScreenplayWeb.OutfrontController do
  use ScreenplayWeb, :controller

  @orientations ["Portrait", "Landscape"]
  @retries 3

  @host System.get_env("SFTP_HOST")
  @user System.get_env("SFTP_USER")
  @password System.get_env("SFTP_PASSWORD")
  @path System.get_env("SFTP_PATH")
  @image_path System.get_env("SFTP_IMAGE_PATH")

  @stations_map %{
    "Station 1" => "STATION-1",
    "Station 2" => "STATION-2",
    "Station 3" => "STATION-3"
  }

  def index(conn, _params) do
    # set_takeover_image(["Station 2", "Station 1"])
    clear_images(["Station 2", "Station 1"])
    render(conn, "index.html")
  end

  def set_takeover_image(stations, retry \\ @retries)
  # Handle better
  def set_takeover_image(_stations, _retry = 0), do: :ignore
  def set_takeover_image(stations, retry) do

    case SFTPClient.connect([host: @host, user: @user, password: @password], fn sftp_conn ->
      
      Enum.each(@orientations, fn orientation ->
        make_image(orientation)
        |> post_image(sftp_conn, stations, orientation)
      end)
    
    end) do
      {:ok, _effect} -> :ok
      {:error, _error} -> set_takeover_image(stations, retry - 1)
    end
  end

  defp make_image(orientation) do
    File.stream!(@image_path, [], 32_768)
  end

  defp post_image(image_stream, sftp_conn, stations, orientation, retry \\ @retries)
  # Handle this better
  defp post_image(_image, _conn, _stations, _orientation, _retry = 0), do: IO.puts('ignoring the image post')
  defp post_image(image_stream, sftp_conn, stations, orientation, retry) do

    Enum.each(stations, fn station ->
      outfront_station = get_outfront_station_name(station)

      # First, check to see if that station has a screen of that orientation
      if station_has_screen_orientation(sftp_conn, outfront_station, orientation) do 
        target_stream =
          SFTPClient.stream_file!(sftp_conn, "#{@path}/#{orientation}/#{outfront_station}/new-file.png")
        
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
    Map.get(@stations_map, station)
  end

  def clear_images(stations, retry \\ @retries)
  # Handle this better
  def clear_images(_stations, _retry = 0), do: :ignore
  def clear_images(stations, retry) do

    case SFTPClient.connect([host: @host, user: @user, password: @password], fn sftp_conn ->
      
      Enum.each(stations, fn station ->
        outfront_station = get_outfront_station_name(station)

        Enum.each(@orientations, fn orientation ->
          # First, check to see if this station has a sign with that orientation
          if station_has_screen_orientation(sftp_conn, outfront_station, orientation) do
            delete_station_images(sftp_conn, outfront_station, orientation, retry)
          end
        end)
      end)

    end) do
      {:ok, _effect} -> :ok
      {:error, _error} -> clear_images(stations, retry - 1)
    end

  end

  defp delete_station_images(conn, station, orientation, retry \\ @retries)
  # Handle better
  defp delete_station_images(_sftp_conn, _station, _orientation, _retry = 0), do: IO.puts('ignoring image deletion')
  defp delete_station_images(sftp_conn, station, orientation, retry) do
    case SFTPClient.delete_file(sftp_conn, "#{@path}/#{orientation}/#{station}/new-file.png") do
      :ok -> :ok
      {:error, _error} -> delete_station_images(sftp_conn, station, orientation, retry - 1)
    end
  end

  def station_has_screen_orientation(conn, station, orientation) do
    {:ok, stations_by_screen_type} = SFTPClient.list_dir(conn, "#{@path}/#{orientation}")
    station in stations_by_screen_type
  end

  defp list_takeover_images(_stations) do
    
  end
end