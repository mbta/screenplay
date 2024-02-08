defmodule Screenplay.PendingScreensConfig.Fetch.Local do
  @moduledoc """
  Functions to work with a local copy of the pending screens config.
  """

  alias ScreensConfig.PendingConfig

  @behaviour Screenplay.PendingScreensConfig.Fetch

  @impl true
  def fetch_config(current_version \\ nil) do
    path = local_config_path()

    with {:ok, last_modified} <- get_last_modified(path) do
      if last_modified == current_version do
        :unchanged
      else
        do_fetch(path, last_modified)
      end
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
  def commit do
    File.rm!(local_config_path() <> ".temp")
  end

  @impl true
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
  defp do_fetch(path, last_modified) do
    case File.read(path) do
      {:ok, contents} -> {:ok, contents, last_modified}
      _ -> :error
    end
  end

  defp get_last_modified(path) do
    case File.stat(path) do
      {:ok, %File.Stat{mtime: mtime}} ->
        mtime_as_string = mtime |> NaiveDateTime.from_erl!() |> NaiveDateTime.to_string()
        {:ok, mtime_as_string}

      {:error, _} ->
        :error
    end
  end
end
