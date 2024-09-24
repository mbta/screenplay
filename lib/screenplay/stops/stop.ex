defmodule Screenplay.Stops.Stop do
  alias Screenplay.V3Api

  def fetch_stops(stop_ids) do
    case V3Api.get_json("/stops", %{
           "filter[id]" => stop_ids
         }) do
      {:ok, %{"data" => data}} -> data
      _ -> []
    end
  end

  def fetch_all_parent_stations do
    case V3Api.get_json("/stops", %{
           "filter[location_type]" => 1
         }) do
      {:ok, %{"data" => data}} -> data
      _ -> []
    end
  end
end
