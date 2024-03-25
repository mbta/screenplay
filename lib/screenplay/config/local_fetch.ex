defmodule Screenplay.Config.LocalFetch do
  @moduledoc false

  @behaviour Screenplay.Config.Fetch

  @impl true
  def get_places_and_screens do
    with {:ok, config_contents, version_id} <- do_get(:local_config_file_spec),
         {:ok, config_json} <- do_decode(config_contents, :local_config_file_spec) do
      {:ok, config_json, version_id}
    end
  end

  @impl true
  def get_locations do
    with {:ok, config_contents, version_id} <- do_get(:local_locations_file_spec),
         {:ok, config_json} <- do_decode(config_contents, :local_locations_file_spec) do
      {:ok, config_json, version_id}
    end
  end

  @impl true
  def get_place_descriptions do
    with {:ok, config_contents, version_id} <- do_get(:local_place_descriptions_file_spec),
         {:ok, config_json} <- do_decode(config_contents, :local_place_descriptions_file_spec) do
      {:ok, config_json, version_id}
    end
  end

  @impl true
  # sobelow_skip ["Traversal.FileModule"]
  def put_config(file_contents) do
    encoded_contents =
      case Jason.encode(file_contents, pretty: true) do
        {:ok, contents} -> contents
        {:error, _} -> :error
      end

    File.copy!(
      local_path(:local_config_file_spec),
      local_path(:local_config_file_spec) <> ".temp"
    )

    case File.write(local_path(:local_config_file_spec), encoded_contents) do
      :ok -> :ok
      {:error, _} -> :error
    end
  end

  @impl true
  # sobelow_skip ["Traversal.FileModule"]
  def commit do
    File.rm!(local_path(:local_config_file_spec) <> ".temp")
  end

  @impl true
  # sobelow_skip ["Traversal.FileModule"]
  def revert(_) do
    File.copy!(
      local_path(:local_config_file_spec) <> ".temp",
      local_path(:local_config_file_spec)
    )

    File.rm!(local_path(:local_config_file_spec) <> ".temp")
  end

  # sobelow_skip ["Traversal.FileModule"]
  defp do_get(file_spec) do
    path = local_path(file_spec)

    case File.read(path) do
      {:ok, contents} ->
        {:ok, mtime} = get_last_modified(path)
        {:ok, contents, mtime}

      {:error, reason_atom} ->
        "Couldn't read local file #{path} for spec #{inspect(file_spec)}. Error reported: #{inspect(reason_atom)}"
        |> IO.warn()

        :error
    end
  end

  defp do_decode(json_string, file_spec) do
    case Jason.decode(json_string) do
      {:ok, data} ->
        {:ok, data}

      {:error, jason_error} ->
        "Couldn't decode JSON for spec #{inspect(file_spec)}. Error reported: #{Exception.message(jason_error)}. File contents:\n#{json_string}"
        |> IO.warn()

        :error
    end
  end

  defp local_path(file_spec) do
    case Application.get_env(:screenplay, file_spec) do
      {:priv, file_name} -> Path.join([:code.priv_dir(:screenplay), "config", file_name])
      {:test, file_name} -> Path.join(~w[#{File.cwd!()} test fixtures #{file_name}])
    end
  end

  defp get_last_modified(path) do
    case File.stat(path) do
      {:ok, %File.Stat{mtime: mtime}} -> {:ok, mtime}
      {:error, _} -> :error
    end
  end
end
