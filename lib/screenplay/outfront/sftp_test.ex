defmodule Screenplay.Outfront.SFTPTest do
  @moduledoc """
  This module handles the CRUD functions to the SFTP server
  """

  require Logger

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

  def list_directories do
    conn = start_connection()

    result =
      case SFTPClient.list_dir(conn, ".") do
        {:error, error} -> "Something wrong with directory: #{error}"
        result -> result
      end

    SFTPClient.disconnect(conn)
    result
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
      Logger.info("Outfront SSH key is not a string as expected: #{inspect(key)}")
    end

    case SFTPClient.connect(
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
end
