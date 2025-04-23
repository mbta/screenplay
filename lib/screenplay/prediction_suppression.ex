defmodule Screenplay.PredictionSuppression do
  @moduledoc """
  Generates data structures for driving the prediction suppression UI
  """
  use GenServer
  import Screenplay.PredictionSuppressionUtils, only: [is_sl_waterfront: 1]

  @spec line_stops() :: [
          %{
            stop_id: String.t(),
            line: String.t(),
            direction_id: 0 | 1,
            type: :start | :end | :mid
          }
        ]
  def line_stops do
    case :ets.lookup(:line_stops, :value) do
      [{:value, data}] -> data
      _ -> []
    end
  end

  def start_link(_) do
    GenServer.start_link(__MODULE__, nil, name: __MODULE__)
  end

  @impl GenServer
  def init(_) do
    :ets.new(:line_stops, [:protected, :named_table, read_concurrency: true])
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

        new_line_stops =
          for %{
                "attributes" => %{"typicality" => typicality, "canonical" => canonical},
                "relationships" => %{
                  "route" => %{"data" => %{"id" => route_id}},
                  "representative_trip" => %{"data" => %{"id" => trip_id}}
                }
              }
              when canonical or (is_sl_waterfront(route_id) and typicality == 1) <- data,
              trip = trip_lookup[trip_id],
              stop_references = trip["relationships"]["stops"]["data"],
              first_stop_id = List.first(stop_references)["id"],
              last_stop_id = List.last(stop_references)["id"],
              %{"id" => stop_id} <- stop_references,
              uniq: true do
            stop = stop_lookup[stop_id]

            %{
              stop_id: stop["relationships"]["parent_station"]["data"]["id"] || stop["id"],
              line: trip["relationships"]["route"]["data"]["id"] |> line(),
              direction_id: trip["attributes"]["direction_id"],
              type:
                case stop_id do
                  ^first_stop_id -> :start
                  ^last_stop_id -> :end
                  _ -> :mid
                end
            }
          end

        :ets.insert(:line_stops, {:value, new_line_stops})

      _ ->
        nil
    end

    {:noreply, state}
  end

  defp line("Green-" <> _), do: "Green"
  defp line(route_id) when is_sl_waterfront(route_id), do: "Silver"
  defp line(route_id), do: route_id
end
