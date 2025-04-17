defmodule Screenplay.PredictionSuppressionUtils do
  @moduledoc """
  Utility functions for validating, checking prediction suppression and getting suppression type
  """
  require Logger

  @green_line_routes ["Green-B", "Green-C", "Green-D", "Green-E"]
  def green_line_routes, do: @green_line_routes
  defguard is_green_line(route_id) when route_id in @green_line_routes

  @sl_waterfront_routes ["741", "742", "743", "746"]
  def sl_waterfront_routes, do: @sl_waterfront_routes
  def sl_waterfront?(route_id), do: route_id in @sl_waterfront_routes
  defguard is_sl_waterfront(route_id) when route_id in @sl_waterfront_routes

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

  def valid_route_for_place?(place, route_id) when route_id == "Silver" do
    # For Silver Line, we make sure that the routes are all valid routes in Screenplay
    # In this case, 741, 742, 743 and 746 within @valid_silver_line_routes
    Enum.any?(
      place.screens,
      fn
        %Screenplay.Places.Place.PaEssScreen{routes: routes} ->
          Enum.any?(
            routes,
            fn route -> sl_waterfront?(route.id) end
          )

        _ ->
          false
      end
    )
  end

  def valid_route_for_place?(place, route_id) when route_id == "Green" do
    # For Green Line, double check that a branch exists within the routes
    Enum.any?(
      place.routes,
      &String.starts_with?(&1, "Green")
    )
  end

  def valid_route_for_place?(place, route_id) do
    route_id in place.routes
  end

  def suppressed_prediction_for_data(
        stop_id,
        route_id,
        direction_id,
        suppressed_predictions_map,
        suppression_type,
        suppression_route_id
      ) do
    %{
      stop_id: stop_id,
      route_id: route_id,
      direction_id: direction_id,
      suppression_type:
        suppression_type(
          stop_id,
          suppression_route_id,
          direction_id,
          suppressed_predictions_map,
          suppression_type
        )
    }
  end

  def suppression_type(
        stop_id,
        suppression_route_id,
        direction_id,
        suppressed_predictions_map,
        suppression_type
      ) do
    if %{
         location_id: stop_id,
         route_id: suppression_route_id,
         direction_id: direction_id
       } in suppressed_predictions_map do
      case suppression_type do
        :mid -> :stop
        :start -> :terminal
      end
    else
      :none
    end
  end
end
