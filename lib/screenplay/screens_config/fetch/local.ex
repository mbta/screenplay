defmodule Screenplay.ScreensConfig.Fetch.Local do
  @moduledoc """
  Functions to work with a local copy of the screens config.
  """

  alias ScreensConfig.PendingConfig

  @behaviour Screenplay.ScreensConfig.Fetch

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

    case File.write(local_config_path(), json) do
      :ok -> :ok
      {:error, _} -> :error
    end
  end

  defp local_config_path do
    Application.get_env(:screenplay, :local_screens_config_file_spec)
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
      {:ok, %File.Stat{mtime: mtime}} -> {:ok, mtime}
      {:error, _} -> :error
    end
  end
end
