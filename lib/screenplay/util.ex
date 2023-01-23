defmodule Screenplay.Util do
  @moduledoc """
  Utility functions
  """

  @spec trim_username(String.t()) :: String.t()
  def trim_username(nil), do: nil

  def trim_username(username) do
    username
    |> String.replace("ActiveDirectory_MBTA\\", "")
  end

  def happening_now?(%{active_period: aps}, now \\ DateTime.utc_now()) do
    Enum.any?(aps, &in_active_period(&1, now))
  end

  def in_active_period({nil, end_t}, t) do
    DateTime.compare(t, end_t) in [:lt, :eq]
  end

  def in_active_period({start_t, nil}, t) do
    DateTime.compare(t, start_t) in [:gt, :eq]
  end

  def in_active_period({start_t, end_t}, t) do
    DateTime.compare(t, start_t) in [:gt, :eq] && DateTime.compare(t, end_t) in [:lt, :eq]
  end
end
