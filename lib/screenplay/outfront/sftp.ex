defmodule Screenplay.Outfront.SFTP do
  @moduledoc """
  This module handles the CRUD functions to the SFTP server
  """

  require Logger

  @orientations ["Portrait", "Landscape"]
  @retries 3

  @stations_to_outfront_directories %{
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

  def set_takeover_images(stations, portrait_png, landscape_png) do
    conn = start_connection()

    Enum.each(stations, fn station ->
      write_image(conn, station, "Portrait", portrait_png)
      write_image(conn, station, "Landscape", landscape_png)
    end)

    sftp_client_module().disconnect(conn)
  end

  def clear_takeover_images(stations) do
    conn = start_connection()

    Enum.each(
      stations,
      fn station ->
        delete_image(conn, station, "Portrait")
        delete_image(conn, station, "Landscape")
      end
    )

    sftp_client_module().disconnect(conn)
  end

  defp sftp_client_module do
    Application.get_env(:screenplay, :sftp_client_module)
  end

  defp start_connection(retry \\ @retries)

  defp start_connection(_retry = 0),
    do: raise("Could not establish SFTP connection after #{@retries} attempts!")

  defp start_connection(retry) do
    host = Application.get_env(:screenplay, :outfront_sftp_domain)
    user = Application.get_env(:screenplay, :outfront_sftp_user)
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
        sftp_conn

      {:error, error} ->
        Logger.error("[sftp_connection_error] #{inspect(error)}")
        start_connection(retry - 1)
    end
  end

  defp write_image(conn, station, orientation, image_data, retry \\ @retries)

  defp write_image(_conn, station, orientation, _image_data, _retry = 0),
    do: raise("Failed to write #{orientation} image for #{station} after #{@retries} attempts!")

  defp write_image(conn, station, orientation, image_data, retry) do
    case do_write_image(conn, station, orientation, image_data, retry) do
      :ok -> :ok
      _ -> write_image(conn, station, orientation, image_data, retry - 1)
    end
  end

  defp do_write_image(conn, station, orientation, image_data, _retry)
       when orientation in @orientations do
    path = get_outfront_path_for_image(station, orientation)
    sftp_client_module().write_file(conn, path, image_data)
  end

  defp do_write_image(_conn, station, orientation, _image_data, _retry),
    do: raise("Invalid orientation #{orientation} for station #{station}!")

  defp delete_image(conn, station, orientation, retry \\ @retries)

  defp delete_image(_conn, station, orientation, 0),
    do: raise("Failed to delete #{orientation} image for #{station} after #{@retries} attempts!")

  defp delete_image(conn, station, orientation, retry) do
    case do_delete_image(conn, station, orientation) do
      :ok ->
        :ok

      {:error, %SFTPClient.OperationError{reason: :no_such_file}} ->
        _ =
          Logger.info(
            "Skipping deleting #{orientation} image for #{station} as file does not exist"
          )

        :ok

      _ ->
        delete_image(conn, station, orientation, retry - 1)
    end
  end

  defp do_delete_image(conn, station, orientation) do
    path = get_outfront_path_for_image(station, orientation)

    # Note: Check what happens when the path doesn't exist.
    sftp_client_module().delete_file(conn, path)
  end

  defp get_outfront_path_for_image(station, orientation) do
    station_directory = get_outfront_directory_for_station(station)
    Path.join([orientation, station_directory, "takeover.png"])
  end

  defp get_outfront_directory_for_station(station) do
    Map.get(@stations_to_outfront_directories, station)
  end
end
