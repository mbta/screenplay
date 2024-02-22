defmodule Screenplay.PendingScreensConfig.Fetch.Local do
  @moduledoc """
  Functions to work with a local copy of the pending screens config.
  """

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
  def put_config(file_contents) do
    case File.write(local_config_path(), file_contents) do
      :ok -> :ok
      {:error, _} -> :error
    end
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
