defmodule Screenplay.PaMessages.StaticTemplates do
  @moduledoc """
  Functions needed to access static templates in priv/config/static_templates.json.
  """

  require Logger

  @spec get_all :: {:ok, list(map())} | :error
  # sobelow_skip ["Traversal.FileModule"]
  def get_all do
    with {:ok, contents} <- file_path() |> File.read(),
         {:ok, json} <- Jason.decode(contents) do
      {:ok, json}
    else
      {:error, err} ->
        Logger.error("static_template_fetch_error #{inspect(err)}")
        :error
    end
  end

  @spec get_template(nil) :: nil
  @spec get_template(non_neg_integer()) :: {:ok, map()} | :error
  def get_template(nil), do: {:ok, nil}

  def get_template(id) do
    case get_all() do
      {:ok, templates} -> {:ok, Enum.find(templates, fn template -> template["id"] == id end)}
      :error -> :error
    end
  end

  defp file_path do
    case Application.get_env(:screenplay, :static_template_file_spec) do
      {:test, file_name} -> Path.join(~w[#{File.cwd!()} test fixtures #{file_name}])
      {:priv, file_name} -> Path.join([:code.priv_dir(:screenplay), "config", file_name])
    end
  end
end
