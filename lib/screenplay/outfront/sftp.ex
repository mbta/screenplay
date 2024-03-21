defmodule Screenplay.Outfront.SFTP do
  @moduledoc """
  This module handles the CRUD functions to the SFTP server
  """

  require Logger

  @landscape_dir "Landscape"
  @portrait_dir "Portrait"
  @retries 3

  def set_takeover_images(stations, portrait_png, landscape_png) do
    conn = start_connection()

    Enum.each(stations, fn station ->
      write_image(conn, station, @portrait_dir, portrait_png)
      write_image(conn, station, @landscape_dir, landscape_png)
    end)

    sftp_client_module().disconnect(conn)
  end

  def clear_takeover_images(stations) do
    conn = start_connection()

    Enum.each(
      stations,
      fn station ->
        delete_image(conn, station, @portrait_dir)
        delete_image(conn, station, @landscape_dir)
      end
    )

    sftp_client_module().disconnect(conn)
  end

  def get_outfront_directory_for_station(station) do
    %{sftp_dir_name: dir_name} =
      :screenplay
      |> Application.get_env(:outfront_takeover_tool_screens)
      |> Map.values()
      |> List.flatten()
      |> Enum.find(&(&1.name == station))

    dir_name
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
       when orientation in [@landscape_dir, @portrait_dir] do
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
end
