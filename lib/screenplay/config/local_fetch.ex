defmodule Screenplay.Config.LocalFetch do
  @moduledoc false

  @behaviour Screenplay.Config.Fetch

  def get_config() do
    with {:ok, file_contents} <- do_get(),
         {:ok, json} <- Jason.decode(file_contents) do
      {:ok, json}
    end
  end

  defp do_get() do
    path = local_config_path()

    case File.read(path) do
      {:ok, contents} -> {:ok, contents}
      _ -> :error
    end
  end

  defp local_config_path do
    case Application.get_env(:screenplay, :local_config_file_spec) do
      {:priv, file_name} -> Path.join(:code.priv_dir(:screenplay), file_name)
      {:test, file_name} -> Path.join(~w[#{File.cwd!()} test fixtures #{file_name}])
    end
  end
end
