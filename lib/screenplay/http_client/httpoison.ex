defmodule Screenplay.HttpClient.HTTPoison do
  @moduledoc """
  HTTPoison adapter for Screenplay.HttpClient behaviour.
  """

  @behaviour Screenplay.HttpClient

  @impl true
  def get(url, headers), do: HTTPoison.get(url, headers)

  @impl true
  def post(url, body, headers), do: HTTPoison.post(url, body, headers)
end
