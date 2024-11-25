defmodule Screenplay.Util do
  @moduledoc """
  Utility functions
  """
  require Logger

  @spec trim_username(String.t()) :: String.t()
  def trim_username(nil), do: nil

  def trim_username(username) do
    username
    |> String.replace("ActiveDirectory_MBTA\\", "")
  end

  @spec get_current_service_day(DateTime.t()) :: integer()
  def get_current_service_day(now \\ DateTime.utc_now()) do
    now
    # Shift to EST to account for possible Daylight Savings Time
    |> DateTime.shift_zone!("America/New_York")
    # Shift time back 3 hours to account for MBTA's 3am-3am service day
    |> DateTime.add(-180, :minute)
    |> Date.day_of_week()
  end

  @spec format_changeset_errors(changeset :: Ecto.Changeset.t()) :: String.t()
  def format_changeset_errors(changeset) do
    changeset
    |> Ecto.Changeset.traverse_errors(fn {msg, _} -> msg end)
    |> Enum.map_join(", ", fn {field, msg} -> "#{field}: #{msg}" end)
  end

  @doc """
  Log structured data. All passed values must implement the Jason.Encoder protocol
  """
  @spec log(String.t(), keyword()) :: :ok
  def log(event, extras) do
    ([event: event] ++ extras)
    |> Enum.map_join(" ", fn {k, v} -> "#{k}=#{Jason.encode!(v)}" end)
    |> Logger.info()
  end
end
