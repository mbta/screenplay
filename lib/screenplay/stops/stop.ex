defmodule Screenplay.Stops.Stop do
  @moduledoc false

  alias Screenplay.V3Api

  def fetch_platform_ids_for_route_at_stop(stop_id, route_id) do
    case V3Api.get_json("stops", %{
           "filter[id]" => stop_id,
           "include" => "child_stops",
           "filter[route]" => route_id
         }) do
      {:ok, %{"data" => [data]}} ->
        %{"relationships" => relationships} = data

        relationships
        |> get_in(["child_stops", "data"])
        |> Enum.map(fn platform ->
          %{"id" => id} = platform
          id
        end)
        |> Enum.filter(&match?({_, ""}, Integer.parse(&1)))

      _ ->
        []
    end
  end
end
