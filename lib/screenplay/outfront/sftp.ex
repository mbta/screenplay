defmodule Screenplay.Outfront.SFTP do
  @moduledoc """
  This module handles the CRUD functions to the SFTP server
  """
  @dialyzer {:no_match, start_connection: 1, write_image: 5, delete_image: 4}

  require Logger

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

  def set_takeover_images(
        stations,
        {portrait_data, portrait_ext},
        {landscape_data, landscape_ext}
      )
      when portrait_ext in @extensions and landscape_ext in @extensions do
    run(fn conn ->
      for station <- stations,
          {dir, data, ext} <- [
            {@portrait_dir, portrait_data, portrait_ext},
            {@landscape_dir, landscape_data, landscape_ext}
          ] do
        List.delete(@extensions, ext)
        |> Enum.each(&delete_image(conn, station, dir, &1))

        write_image(conn, station, dir, data, ext)
      end
    end)
  end

  def clear_takeover_images(stations) do
    run(fn conn ->
      for station <- stations,
          dir <- [@portrait_dir, @landscape_dir],
          ext <- @extensions do
        delete_image(conn, station, dir, ext)
      end
    end)
  end

  def get_outfront_directory_for_station(station) do
    %{sftp_dir_name: dir_name} =
      :screenplay
      |> Application.get_env(:outfront_takeover_screens)
      |> Map.values()
      |> List.flatten()
      |> Enum.find(&(&1.name == station))

    dir_name
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

  defp write_image(conn, station, orientation, data, ext) do
    retry(
      fn ->
        path = get_outfront_path_for_image(station, orientation, ext)
        sftp_client_module().write_file(conn, path, data)
      end,
      "Failed to write #{orientation} image for #{station} after #{@retries} attempts!"
    )
  end

  defp delete_image(conn, station, orientation, ext) do
    retry(
      fn ->
        path = get_outfront_path_for_image(station, orientation, ext)

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

  defp get_outfront_path_for_image(station, orientation, ext) do
    station_directory = get_outfront_directory_for_station(station)
    Path.join([orientation, station_directory, "takeover.#{ext}"])
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
