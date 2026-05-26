defmodule Screenplay.Outfront.SFTP do
  @moduledoc """
  This module handles the CRUD functions to the SFTP server
  """
  @dialyzer {:no_match, start_connection: 1, write_image: 5, delete_image: 4}

  require Logger

  @type station :: %{
          place_id: String.t(),
          name: String.t(),
          portrait: boolean(),
          landscape: boolean(),
          sftp_dir_name: String.t()
        }

  @landscape_dir Application.compile_env!(:screenplay, :landscape_dir)
  @portrait_dir Application.compile_env!(:screenplay, :portrait_dir)
  @retries 3
  @extensions ["gif", "png"]

  @spec run((SFTPClient.Conn.t() -> :ok)) :: :ok
  def run(work_fn) do
    conn = start_connection()

    try do
      work_fn.(conn)
    after
      sftp_client_module().disconnect(conn)
    end
  end

  @spec all_stations() :: [station()]
  def all_stations do
    :screenplay
    |> Application.get_env(:outfront_takeover_screens)
    |> Map.values()
    |> List.flatten()
  end

  @spec get_station([station()], String.t()) :: station() | nil
  def get_station(all_stations, station_name) do
    Enum.find(all_stations, &(&1.name == station_name))
  end

  def set_takeover_images(
        station_names,
        {portrait_data, portrait_ext},
        {landscape_data, landscape_ext}
      )
      when portrait_ext in @extensions and landscape_ext in @extensions do
    run(fn conn ->
      all_stations = all_stations()

      # For each station, we check if it has portrait and/or landscape screens,
      # and if so, delete any existing takeover images for that orientation and write the new one.
      for station_name <- station_names do
        station = get_station(all_stations, station_name)
        station_directory = station.sftp_dir_name

        if station.portrait do
          set_orientation_image(
            conn,
            station_name,
            station_directory,
            @portrait_dir,
            portrait_data,
            portrait_ext
          )
        end

        if station.landscape do
          set_orientation_image(
            conn,
            station_name,
            station_directory,
            @landscape_dir,
            landscape_data,
            landscape_ext
          )
        end
      end
    end)

    :ok
  end

  def clear_takeover_images(station_names) do
    run(fn conn ->
      all_stations = all_stations()

      for station_name <- station_names do
        station = get_station(all_stations, station_name)
        station_directory = station.sftp_dir_name

        if station.portrait do
          clear_orientation_images(conn, station_name, station_directory, @portrait_dir)
        end

        if station.landscape do
          clear_orientation_images(conn, station_name, station_directory, @landscape_dir)
        end
      end
    end)

    :ok
  end

  defp set_orientation_image(
         conn,
         station_name,
         station_directory,
         orientation_dir,
         image_data,
         image_ext
       ) do
    List.delete(@extensions, image_ext)
    |> Enum.each(fn ext ->
      path = Path.join([orientation_dir, station_directory, "takeover.#{ext}"])
      delete_image(conn, path, station_name, orientation_dir)
    end)

    path = Path.join([orientation_dir, station_directory, "takeover.#{image_ext}"])
    write_image(conn, path, image_data, station_name, orientation_dir)
  end

  defp clear_orientation_images(conn, station_name, station_directory, orientation_dir) do
    Enum.each(@extensions, fn ext ->
      path = Path.join([orientation_dir, station_directory, "takeover.#{ext}"])
      delete_image(conn, path, station_name, orientation_dir)
    end)
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

  defp write_image(conn, path, data, station, orientation) do
    retry(
      fn ->
        sftp_client_module().write_file(conn, path, data)
      end,
      "Failed to write #{orientation} image for #{station} after #{@retries} attempts!"
    )
  end

  defp delete_image(conn, path, station, orientation) do
    retry(
      fn ->
        case sftp_client_module().delete_file(conn, path) do
          :ok ->
            :ok

          {:error, %SFTPClient.OperationError{reason: :no_such_file}} ->
            _ =
              Logger.info(
                "Skipping deleting #{orientation} image for #{station} as file does not exist"
              )

            :ok

          _ ->
            :error
        end
      end,
      "Failed to delete #{orientation} image for #{station} after #{@retries} attempts!"
    )
  end

  defp sftp_client_module, do: Application.get_env(:screenplay, :sftp_client_module)

  defp retry(fun, error, retries \\ @retries)

  defp retry(_fun, error, 0), do: raise(error)

  defp retry(fun, error, retries) do
    case fun.() do
      :ok -> :ok
      {:ok, value} -> {:ok, value}
      _ -> retry(fun, error, retries - 1)
    end
  end
end
