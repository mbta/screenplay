defmodule Screenplay.PredictionSuppressionUtils do
  @moduledoc """
  Utility functions for validating, checking prediction suppression and getting suppression type
  """
  alias Screenplay.PredictionSuppression
  alias Screenplay.SuppressedPredictions.SuppressedPrediction
  require Logger

  @green_line_routes ["Green-B", "Green-C", "Green-D", "Green-E"]
  def green_line_routes, do: @green_line_routes
  defguard is_green_line(route_id) when route_id in @green_line_routes

  @sl_waterfront_routes ["741", "742", "743", "746"]
  def sl_waterfront?(route_id), do: route_id in @sl_waterfront_routes
  defguard is_sl_waterfront(route_id) when route_id in @sl_waterfront_routes

  @valid_subway_routes [
    "Red",
    "Orange",
    "Blue",
    "Green-B",
    "Green-C",
    "Green-D",
    "Green-E"
  ]
  def valid_route?(route_id), do: route_id in (@valid_subway_routes ++ @sl_waterfront_routes)

  @jfk_umass_ashmont_location_id "jfk_umass_ashmont_platform"
  @jfk_umass_braintree_location_id "jfk_umass_braintree_platform"
  def jfk_umass_child_location_ids,
    do: [@jfk_umass_ashmont_location_id, @jfk_umass_braintree_location_id]

  def jfk_umass_child_stop_data,
    do: [
      %{
        route_id: "Red",
        stop_id: "70085",
        direction_id: 0,
        location_id: @jfk_umass_ashmont_location_id
      },
      %{
        route_id: "Red",
        stop_id: "70086",
        direction_id: 1,
        location_id: @jfk_umass_ashmont_location_id
      },
      %{
        route_id: "Red",
        stop_id: "70095",
        direction_id: 0,
        location_id: @jfk_umass_braintree_location_id
      },
      %{
        route_id: "Red",
        stop_id: "70096",
        direction_id: 1,
        location_id: @jfk_umass_braintree_location_id
      }
    ]

  @jfk_umass_child_stop_ids ["70085", "70086", "70095", "70096"]

  @spec suppression_type(
          suppressed_predictions :: [SuppressedPrediction.t()],
          location_id :: String.t(),
          route_id :: String.t(),
          direction_id :: integer()
        ) :: :terminal | :stop | :none

  def suppression_type(suppressed_predictions, location_id, route_id, direction_id)
      when is_green_line(route_id) do
    suppression_type_from_line_data(
      suppressed_predictions,
      location_id,
      "Green",
      direction_id
    )
  end

  def suppression_type(suppressed_predictions, location_id, route_id, direction_id)
      when is_sl_waterfront(route_id) do
    suppression_type_from_line_data(
      suppressed_predictions,
      location_id,
      "Silver",
      direction_id
    )
  end

  def suppression_type(suppressed_predictions, location_id, route_id, direction_id) do
    suppression_type_from_line_data(
      suppressed_predictions,
      location_id,
      route_id,
      direction_id
    )
  end

  def suppression_type(suppressed_predictions, stop_id)
      when stop_id in @jfk_umass_child_stop_ids do
    case Enum.find(jfk_umass_child_stop_data(), fn %{stop_id: id} -> id == stop_id end) do
      %{
        location_id: @jfk_umass_ashmont_location_id,
        route_id: route_id,
        direction_id: direction_id
      } ->
        suppression_type_from_line_data(
          suppressed_predictions,
          @jfk_umass_ashmont_location_id,
          route_id,
          direction_id
        )

      %{
        location_id: @jfk_umass_braintree_location_id,
        route_id: route_id,
        direction_id: direction_id
      } ->
        suppression_type_from_line_data(
          suppressed_predictions,
          @jfk_umass_braintree_location_id,
          route_id,
          direction_id
        )

      nil ->
        :none
    end
  end

  defp suppression_type_from_line_data(
         suppressed_predictions,
         location_id,
         route_id,
         direction_id
       ) do
    Enum.find(suppressed_predictions, fn prediction ->
      prediction.route_id == route_id && prediction.location_id == location_id &&
        prediction.direction_id == direction_id
    end)
    |> case do
      nil ->
        :none

      _found_prediction ->
        Enum.find(PredictionSuppression.line_stops(), fn line_stop ->
          line_stop.line == route_id &&
            (line_stop.stop_id == location_id ||
               (line_stop.stop_id == "place-jfk" &&
                  location_id in jfk_umass_child_location_ids())) &&
            line_stop.direction_id == direction_id
        end)
        |> case do
          %{type: :start} -> :terminal
          %{type: :end} -> :terminal
          %{type: :mid} -> :stop
          _ -> :none
        end
    end
  end
end
