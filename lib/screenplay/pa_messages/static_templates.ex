defmodule Screenplay.PaMessages.StaticTemplates do
  require Logger

  @spec get :: {:ok, list(map())} | :error
  def get do
    with {:ok, contents} <- file_path() |> File.read(),
         {:ok, json} <- Jason.decode(contents) do
      {:ok, json}
    else
      {:error, err} ->
        Logger.error("static_template_fetch_error #{inspect(err)}")
        :error
    end
  end

  defp file_path do
    case Application.get_env(:screenplay, :static_template_file_spec) do
      {:test, file_name} -> Path.join(~w[#{File.cwd!()} test fixtures #{file_name}])
      {:priv, file_name} -> Path.join([:code.priv_dir(:screenplay), "config", file_name])
    end
  end
end
