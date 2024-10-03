defmodule Screenplay.Stops.Stop do
  @moduledoc """
  Functions used to fetch stop data from the V3 API.
  """

  require Logger
  alias Screenplay.V3Api

  @callback fetch_by_ids(list(String.t())) :: {:ok, list(map())} | :error
  def fetch_by_ids(stop_ids) do
    case V3Api.get_json("/stops", %{
           "filter[id]" => Enum.join(stop_ids, ",")
         }) do
      {:ok, %{"data" => data}} -> {:ok, data}
      _ -> :error
    end
  end

  @callback fetch_all_parent_stations() :: {:ok, list(map())} | :error
  def fetch_all_parent_stations do
    case V3Api.get_json("/stops", %{
           "filter[location_type]" => 1
         }) do
      {:ok, %{"data" => data}} -> {:ok, data}
      _ -> :error
    end
  end
end
