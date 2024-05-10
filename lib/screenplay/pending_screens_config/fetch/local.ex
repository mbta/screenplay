defmodule Screenplay.PendingScreensConfig.Fetch.Local do
  @moduledoc """
  Functions to work with a local copy of the pending screens config.
  """

  alias Screenplay.PendingScreensConfig.Fetch
  alias ScreensConfig.PendingConfig

  @behaviour Fetch

  @impl true
  def fetch_config do
    path = local_config_path()

    with {:ok, last_modified} <- get_last_modified(path),
         {:ok, contents} <- do_fetch(path) do
      last_modified_as_string = DateTime.to_iso8601(last_modified)

      metadata = %Fetch.Metadata{
        etag: last_modified_as_string,
        version_id: last_modified_as_string,
        last_modified: last_modified
      }

      {:ok, contents, metadata}
    end
  end

  @impl true
  # sobelow_skip ["Traversal.FileModule"]
  def put_config(config) do
    json = config |> PendingConfig.to_json() |> Jason.encode!(pretty: true)

    File.copy!(local_config_path(), local_config_path() <> ".temp")

    case File.write(local_config_path(), json) do
      :ok -> :ok
      {:error, _} -> :error
    end
  end

  @impl true
  # sobelow_skip ["Traversal.FileModule"]
  def commit do
    File.rm!(local_config_path() <> ".temp")
  end

  @impl true
  # sobelow_skip ["Traversal.FileModule"]
  def revert(_) do
    File.copy!(local_config_path() <> ".temp", local_config_path())
    File.rm!(local_config_path() <> ".temp")
  end

  defp local_config_path do
    case Application.get_env(:screenplay, :local_pending_screens_config_file_spec) do
      {:test, file_name} -> Path.join(~w[#{File.cwd!()} test fixtures #{file_name}])
      path -> path
    end
  end

  # sobelow_skip ["Traversal.FileModule"]
  defp do_fetch(path) do
    case File.read(path) do
      {:ok, contents} -> {:ok, contents}
      _ -> :error
    end
  end

  defp get_last_modified(path) do
    case File.stat(path, time: :posix) do
      {:ok, %File.Stat{mtime: mtime}} ->
        {:ok, DateTime.from_unix!(mtime)}

      {:error, _} ->
        :error
    end
  end
end
