defmodule Screenplay.Config.LocalFetch do
  @moduledoc false

  @behaviour Screenplay.Config.Fetch

  def get_config do
    with {:ok, config_contents} <- do_get(:local_config_file_spec),
         {:ok, location_contents} <- do_get(:local_locations_file_spec),
         {:ok, place_description_contents} <- do_get(:local_place_descriptions_file_spec),
         {:ok, config_json} <- Jason.decode(config_contents),
         {:ok, location_json} <- Jason.decode(location_contents),
         {:ok, place_description_json} <- Jason.decode(place_description_contents) do
      {:ok, config_json, location_json, place_description_json}
    else
      _ -> :error
    end
  end

  # sobelow_skip ["Traversal.FileModule"]
  defp do_get(file_spec) do
    path = local_path(file_spec)

    case File.read(path) do
      {:ok, contents} -> {:ok, contents}
      _ -> :error
    end
  end

  defp local_path(file_spec) do
    case Application.get_env(:screenplay, file_spec) do
      {:priv, file_name} -> Path.join(:code.priv_dir(:screenplay), file_name)
      {:test, file_name} -> Path.join(~w[#{File.cwd!()} test fixtures #{file_name}])
    end
  end
end
