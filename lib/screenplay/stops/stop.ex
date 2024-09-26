defmodule Screenplay.Stops.Stop do
  @moduledoc """
  Functions used to fetch stop data from the V3 API.
  """

  @behaviour Screenplay.Stops.Behaviour

  alias Screenplay.V3Api

  @impl true
  def fetch_parent_stops(stop_ids) do
    case V3Api.get_json("/stops", %{
           "filter[id]" => Enum.join(stop_ids, ",")
         }) do
      {:ok, %{"data" => data}} -> data
      _ -> []
    end
  end

  @impl true
  def fetch_all_parent_stations do
    case V3Api.get_json("/stops", %{
           "filter[location_type]" => 1
         }) do
      {:ok, %{"data" => data}} -> data
      _ -> []
    end
  end
end
