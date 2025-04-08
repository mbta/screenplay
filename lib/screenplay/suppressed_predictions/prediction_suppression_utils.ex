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

  @jfk_umass_ashmont_place "jfk_umass_ashmont_platform"
  @jfk_umass_braintree_place "jfk_umass_braintree_platform"
  def jfk_umass_platforms, do: [@jfk_umass_ashmont_place, @jfk_umass_braintree_place]

  @spec get_suppression_type(
          suppressed_predictions :: [SuppressedPrediction.t()],
          route_id :: String.t(),
          location_id :: String.t(),
          direction_id :: integer()
        ) :: :terminal | :stop | nil
  def get_suppression_type(suppressed_predictions, route_id, location_id, direction_id)
      when is_green_line(route_id) do
    get_suppression_type_from_line_data(
      suppressed_predictions,
      "Green",
      location_id,
      direction_id
    )
  end

  def get_suppression_type(suppressed_predictions, route_id, location_id, direction_id)
      when is_sl_waterfront(route_id) do
    get_suppression_type_from_line_data(
      suppressed_predictions,
      "Silver",
      location_id,
      direction_id
    )
  end

  def get_suppression_type(suppressed_predictions, route_id, location_id, direction_id) do
    get_suppression_type_from_line_data(
      suppressed_predictions,
      route_id,
      location_id,
      direction_id
    )
  end

  defp get_suppression_type_from_line_data(
         suppressed_predictions,
         route_id,
         location_id,
         direction_id
       ) do
    Enum.find(suppressed_predictions, fn prediction ->
      prediction.route_id == route_id && prediction.location_id == location_id &&
        prediction.direction_id == direction_id
    end)
    |> case do
      nil ->
        nil

      found_prediction ->
        Enum.find(PredictionSuppression.line_stops(), fn line_stop ->
          line_stop.line == route_id &&
            (line_stop.stop_id == location_id ||
               (line_stop.stop_id == "place-jfk" &&
                  found_prediction.location_id in jfk_umass_platforms())) &&
            line_stop.direction_id == direction_id
        end)
        |> case do
          %{type: :start} -> :terminal
          %{type: :end} -> :terminal
          %{type: :mid} -> :stop
          _ -> nil
        end
    end
  end
end
