defmodule ScreenplayWeb.UserActionLogger do
  @moduledoc """
  Helper for logging every action a user takes.
  """

  require Logger

  @spec log(String.t(), atom()) :: :ok
  @spec log(String.t(), atom(), map()) :: :ok
  def log(username, action, params \\ %{}) do
    params = Map.merge(%{username: username, action: action}, params)

    Logger.info(["User action: ", params_iodata(params)])
  end

  @spec params_iodata(map()) :: [iodata()]
  defp params_iodata(params) do
    params
    |> Enum.map(fn {key, value} -> [to_string(key), ?=, inspect(value)] end)
    |> Enum.intersperse(", ")
  end
end
