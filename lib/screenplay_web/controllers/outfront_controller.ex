defmodule ScreenplayWeb.OutfrontController do
  use ScreenplayWeb, :controller

  @orientations ["Portrait", "Landscape"]
  @retries 3

  @host Application.get_env(:screenplay, :sftp_host)
  @user Application.get_env(:screenplay, :sftp_user)
  @password Application.get_env(:screenplay, :sftp_password)
  @remote_path Application.get_env(:screenplay, :sftp_remote_path)
  @local_path Application.get_env(:screenplay, :sftp_local_path)

  @stations_map %{
    "Station 1" => "STATION-1",
    "Station 2" => "STATION-2",
    "Station 3" => "STATION-3"
  }

  def index(conn, _params) do
    set_takeover_image(["Station 2", "Station 1"])
    get_outfront_image("STATION-1", "Landscape")
    clear_images(["Station 2", "Station 1", "Station 3"])
    
    render(conn, "index.html")
  end

  def set_takeover_image(stations, retry \\ @retries)
  # Handle better
  def set_takeover_image(_stations, _retry = 0), do: IO.puts('skipping set_takeover_image')
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

  # Replace with true "Make the image" logic
  defp make_image(_orientation) do
    File.stream!("#{@local_path}/elixir.png", [], 32_768)
  end

  defp post_image(image_stream, sftp_conn, stations, orientation, retry \\ @retries)
  # Handle this better
  defp post_image(_image, _conn, _stations, _orientation, _retry = 0), do: IO.puts('skipping post_image')
  defp post_image(image_stream, sftp_conn, stations, orientation, retry) do

    Enum.each(stations, fn station ->
      outfront_station = get_outfront_station_name(station)

      # First, check to see if that station has a screen of that orientation
      if station_has_screen_orientation(sftp_conn, outfront_station, orientation) do 
        target_stream =
          SFTPClient.stream_file!(sftp_conn, "#{@remote_path}/#{orientation}/#{outfront_station}/new-file.png")
        
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
  def clear_images(_stations, _retry = 0), do: IO.puts('skipping clear_images')
  def clear_images(stations, retry) do

    case SFTPClient.connect([host: @host, user: @user, password: @password], fn sftp_conn ->
      
      Enum.each(stations, fn station ->
        outfront_station = get_outfront_station_name(station)

        Enum.each(@orientations, fn orientation ->
          # First, check to see if this station has a sign with that orientation
          if station_has_screen_orientation(sftp_conn, outfront_station, orientation) do
            delete_station_images(sftp_conn, outfront_station, orientation)
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
  defp delete_station_images(_sftp_conn, _station, _orientation, _retry = 0), do: IO.puts('skipping delete_station_images')
  defp delete_station_images(sftp_conn, station, orientation, retry) do
    case SFTPClient.delete_file(sftp_conn, "#{@remote_path}/#{orientation}/#{station}/new-file.png") do
      :ok -> :ok
      _ -> delete_station_images(sftp_conn, station, orientation, retry - 1)
    end
  end

  defp station_has_screen_orientation(conn, station, orientation, retry \\ @retries)
  # Handle better
  defp station_has_screen_orientation(_conn, _station, _orientation, _retry = 0), do: IO.puts('skipping station_has_screen_orientation')
  defp station_has_screen_orientation(conn, station, orientation, retry) do
    case SFTPClient.list_dir(conn, "#{@remote_path}/#{orientation}") do
      {:ok, stations_by_screen_type} -> station in stations_by_screen_type
      _ -> station_has_screen_orientation(conn, station, orientation, retry - 1)
    end
  end
  
  # For the dashboard of active alerts
  defp get_outfront_image(station, orientation, retry \\ @retries)
  # Handle better
  defp get_outfront_image(_station, _orientation, _retry = 0), do: IO.puts('skipping get_outfront_image')
  defp get_outfront_image(station, orientation, retry) do

    case SFTPClient.connect([host: @host, user: @user, password: @password], fn sftp_conn ->

      # First, check to see if that station has a screen of that orientation
      if station_has_screen_orientation(sftp_conn, station, orientation) do 
        do_get_outfront_image(sftp_conn, station, orientation)
      end

    end) do
      {:ok, _effect} -> :ok
      {:error, _error} -> get_outfront_image(station, orientation, retry - 1)
    end

  end

  defp do_get_outfront_image(sftp_conn, station, orientation, retry \\ @retries)
  # Handle better
  defp do_get_outfront_image(_conn, _station, _orientation, _retry = 0), do: IO.puts('skipping do_get_outfront_image')
  defp do_get_outfront_image(sftp_conn, station, orientation, retry) do
    image_name = get_outfront_image_name(sftp_conn, station, orientation) 

    source_stream = SFTPClient.stream_file!(sftp_conn, "#{@remote_path}/#{orientation}/#{station}/#{image_name}")
    # Currently, just storing the file locally.
    # Should explore saving to a temp directory?
    target_stream = File.stream!("#{@local_path}/#{station}_#{orientation}_downloaded.png")

    try do
      source_stream
      |> Stream.into(target_stream)
      |> Stream.run()
    rescue
      _e -> do_get_outfront_image(sftp_conn, station, orientation, retry - 1)
    end
  end

  defp get_outfront_image_name(sftp_conn, station, orientation, retry \\ @retries)
  # Handle better
  defp get_outfront_image_name(_sftp_conn, _station, _orientation, _retry = 0), do: IO.puts('skipping get_outfront_image_name')
  defp get_outfront_image_name(sftp_conn, station, orientation, retry) do
    case SFTPClient.list_dir(sftp_conn, "#{@remote_path}/#{orientation}/#{station}") do
      {:ok, [image_name]} -> image_name
      {:error, _error} -> get_outfront_image_name(sftp_conn, station, orientation, retry - 1)
    end
  end

end