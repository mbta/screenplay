defmodule Screenplay.RoutePatterns.RoutePattern do
  @moduledoc false

  alias Screenplay.V3Api

  def fetch_platform_ids_for_route_at_stop(stop_id, route_id) do
    case V3Api.get_json("route_patterns", %{
           "include" => "representative_trip.stops",
           "filter[route]" => route_id,
           "filter[canonical]" => true
         }) do
      {:ok, %{"included" => included_data}} ->
        [{0, direction_0_platforms}, {1, direction_1_platforms}] =
          included_data
          |> Enum.filter(&(&1["type"] == "trip"))
          |> Enum.map(fn trip ->
            %{
              "attributes" => %{"direction_id" => direction_id},
              "relationships" => %{"stops" => %{"data" => platforms}}
            } = trip

            {direction_id, Enum.map(platforms, & &1["id"])}
          end)
          |> Enum.sort_by(&elem(&1, 0))

        platform_ids_at_stop =
          included_data
          |> Enum.filter(
            &match?(
              %{
                "type" => "stop",
                "relationships" => %{"parent_station" => %{"data" => %{"id" => ^stop_id}}}
              },
              &1
            )
          )
          |> Enum.map(& &1["id"])

        {Enum.find(platform_ids_at_stop, &(&1 in direction_0_platforms)),
         Enum.find(platform_ids_at_stop, &(&1 in direction_1_platforms))}

      _ ->
        []
    end
  end
end
