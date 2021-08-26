defmodule Screenplay.Alerts.LocalFetch do
  @moduledoc false

  alias Screenplay.Alerts.State

  @spec get_state() :: {:ok, State.t()} | :error
  def get_state do
    with {:ok, file_contents} <- do_get(),
         {:ok, json} <- Jason.decode(file_contents) do
      {:ok, State.from_json(json)}
    else
      _ -> :error
    end
  end

  defp do_get do
    path = local_alerts_path()

    case File.read(path) do
      {:ok, contents} -> {:ok, contents}
      _ -> :error
    end
  end

  @spec put_state(State.t()) :: :ok | :error
  def put_state(state) do
    contents = state |> State.to_json() |> Jason.encode!(pretty: true)
    do_put(contents)
  end

  defp do_put(contents) do
    path = local_alerts_path()

    case File.write(path, contents) do
      :ok -> :ok
      _ -> :error
    end
  end

  defp local_alerts_path do
    case Application.get_env(:screenplay, :local_alerts_path_spec) do
      {:priv, file_name} -> Path.join(:code.priv_dir(:screenplay), file_name)
      {:test, file_name} -> Path.join(~w[#{File.cwd!()} test fixtures #{file_name}])
    end
  end
end
