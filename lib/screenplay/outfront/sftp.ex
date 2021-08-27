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
    "Park Street" => "001_XFER_RED_GREEN_PARK",
    "Downtown Crossing" => "002_XFER_RED_ORANGE_SILVER_DOWNTOWNCROSSING",
    "South Station" => "003_XFER_RED_SILVER_CR_SOUTHSTATION",
    "North Station" => "004_XFER_ORANGE_GREEN_CR_NORTHSTATION",
    "Haymarket" => "005_XFER_ORANGE_GREEN_HAYMARKET",
    "State" => "006_XFER_ORANGE_BLUE_STATE",
    "Government Center" => "007_XFER_BLUE_GREEN_GOVERNMENTCENTER",
    "Alewife" => "008_RED_ALEWIFE",
    "Davis" => "009_RED_DAVIS",
    "Porter" => "010_RED_CR_PORTER",
    "Harvard" => "011_RED_HARVARD",
    "Central" => "012_RED_CENTRAL",
    "Kendall/MIT" => "013_RED_KENDALL",
    "Charles/MGH" => "014_RED_CHARLES",
    "Broadway" => "015_RED_BROADWAY",
    "Andrew" => "016_RED_ANDREW",
    "JFK/UMass" => "017_RED_CR_JFKUMASS",
    "Savin Hill" => "018_A_RED_SAVINHILL",
    "Fields Corner" => "019_A_RED_FIELDSCORNER",
    "Shawmut" => "020_A_RED_SHAWMUT",
    "Ashmont" => "021_A_RED_ASHMONT",
    "North Quincy" => "022_B_RED_NORTHQUINCY",
    "Wollaston" => "023_B_RED_WOLLASTON",
    "Quincy Center" => "024_B_RED_CR_QUINCYCENTER",
    "Quincy Adams" => "025_B_RED_QUINCYADAMS",
    "Braintree" => "026_B_RED_CR_BRAINTREE",
    "Oak Grove" => "034_ORANGE_OAKGROVE",
    "Malden Center" => "035_ORANGE_CR_MALDENCENTER",
    "Wellington" => "036_ORANGE_WELLINGTON",
    "Assembly" => "037_ORANGE_ASSEMBLY",
    "Sullivan Square" => "038_ORANGE_SULLIVAN",
    "Community College" => "039_ORANGE_COMMUNITYCOLLEGE",
    "Chinatown" => "040_ORANGE_SILVER_CHINATOWN",
    "Tufts Medical Center" => "041_ORANGE_SILVER_TUFTSMEDICAL",
    "Back Bay" => "042_ORANGE_CR_BACKBAY",
    "Massachusetts Avenue" => "043_ORANGE_MASSAVE",
    "Ruggles" => "044_ORANGE_CR_RUGGLES",
    "Roxbury Crossing" => "045_ORANGE_ROXBURYCROSSING",
    "Jackson Square" => "046_ORANGE_JACKSON",
    "Stony Brook" => "047_ORANGE_STONYBROOK",
    "Green Street" => "048_ORANGE_GREENST",
    "Forest Hills" => "049_ORANGE_CR_FORESTHILLS",
    "Wonderland" => "050_BLUE_WONDERLAND",
    "Revere Beach" => "051_BLUE_REVEREBEACH",
    "Beachmont" => "052_BLUE_BEACHMONT",
    "Suffolk Downs" => "053_BLUE_SUFFOLKDOWNS",
    "Orient Heights" => "054_BLUE_ORIENTHEIGHTS",
    "Wood Island" => "055_BLUE_WOODISLAND",
    "Airport" => "056_BLUE_SILVER_AIRPORT",
    "Maverick" => "057_BLUE_MAVERICK",
    "Aquarium" => "058_BLUE_AQUARIUM",
    "Bowdoin" => "059_BLUE_BOWDOIN",
    "Boylston" => "062_GREEN_SILVER_BOYLSTON",
    "Arlington" => "063_GREEN_ARLINGTON",
    "Copley" => "064_GREEN_COPLEY",
    "Hynes Convention Center" => "065_GREEN_HYNES",
    "Kenmore" => "066_GREEN_KENMORE",
    "Prudential" => "111_E_GREEN_PRUDENTIAL",
    "Symphony" => "112_E_GREEN_SYMPHONY",
    "World Trade Center" => "125_1_2_3_SILVER_WORLDTRADE"
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
