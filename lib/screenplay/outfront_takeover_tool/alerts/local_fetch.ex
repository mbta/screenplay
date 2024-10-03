defmodule Screenplay.OutfrontTakeoverTool.Alerts.LocalFetch do
  @moduledoc false

  # sobelow_skip ["Traversal.FileModule"]
  @spec get_state!() :: binary()
  def get_state! do
    file_path() |> File.read!()
  end

  # sobelow_skip ["Traversal.FileModule"]
  @spec put_state!(binary()) :: :ok
  def put_state!(state) do
    file_path() |> File.write!(state)
    :ok
  end

  defp file_path, do: Path.join([:code.priv_dir(:screenplay), "local", "alerts.json"])
end
