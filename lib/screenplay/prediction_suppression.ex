defmodule Screenplay.PredictionSuppression do
  use GenServer

  @spec service_records() :: [
          %{
            place_id: String.t(),
            route: String.t(),
            direction_id: 0 | 1,
            type: :start | :end | :mid
          }
        ]
  def service_records() do
    case :ets.lookup(:service_records, :value) do
      [{:value, data}] -> data
      _ -> []
    end
  end

  def start_link(_) do
    GenServer.start_link(__MODULE__, nil, name: __MODULE__)
  end

  @impl GenServer
  def init(_) do
    :ets.new(:service_records, [:protected, :named_table, read_concurrency: true])
    send(self(), :update)
    {:ok, %{}}
  end

  @impl GenServer
  def handle_info(:update, state) do
    Process.send_after(self(), :update, 60_000)

    case Screenplay.V3Api.get_json("/route_patterns", %{
           "filter[route]" => "Red,Orange,Blue,Green-B,Green-C,Green-D,Green-E,741,742,743,746",
           "include" => "representative_trip.stops"
         }) do
      {:ok, %{"data" => data, "included" => included}} ->
        trip_lookup =
          for %{"type" => "trip"} = trip <- included, into: %{} do
            {trip["id"], trip}
          end

        stop_lookup =
          for %{"type" => "stop"} = stop <- included, into: %{} do
            {stop["id"], stop}
          end

        new_service_records =
          for %{"attributes" => %{"typicality" => 1}} = route_pattern <- data,
              trip_id = route_pattern["relationships"]["representative_trip"]["data"]["id"],
              trip = trip_lookup[trip_id],
              stop_references = trip["relationships"]["stops"]["data"],
              %{"id" => stop_id} <- stop_references,
              uniq: true do
            stop = stop_lookup[stop_id]

            %{
              place_id: stop["relationships"]["parent_station"]["data"]["id"],
              route: trip["relationships"]["route"]["data"]["id"] |> route(),
              direction_id: trip["attributes"]["direction_id"],
              type:
                cond do
                  List.first(stop_references)["id"] == stop_id -> :start
                  List.last(stop_references)["id"] == stop_id -> :end
                  true -> :mid
                end
            }
          end

        :ets.insert(:service_records, {:value, new_service_records})

      _ ->
        nil
    end

    {:noreply, state}
  end

  defp route("Green-" <> _), do: "Green"
  defp route(route_id) when route_id in ["741", "742", "743", "746"], do: "Silver"
  defp route(route_id), do: route_id
end
