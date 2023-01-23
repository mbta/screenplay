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
end
