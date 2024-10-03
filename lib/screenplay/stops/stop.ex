defmodule Screenplay.Stops.Stop do
  @moduledoc """
  Functions used to fetch stop data from the V3 API.
  """

  alias Screenplay.V3Api

  @callback fetch_parent_stops(list(String.t())) :: list(map())
  def fetch_parent_stops(stop_ids) do
    case V3Api.get_json("/stops", %{
           "filter[id]" => Enum.join(stop_ids, ",")
         }) do
      {:ok, %{"data" => data}} -> data
      _ -> []
    end
  end

  @callback fetch_all_parent_stations() :: list(map())
  def fetch_all_parent_stations do
    case V3Api.get_json("/stops", %{
           "filter[location_type]" => 1
         }) do
      {:ok, %{"data" => data}} -> data
      _ -> []
    end
  end
end
