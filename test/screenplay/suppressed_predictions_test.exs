defmodule Screenplay.SuppressedPredictionsTest do
  use ExUnit.Case

  alias Screenplay.PlaceCacheHelpers
  alias Screenplay.PredictionSuppression
  alias Screenplay.SuppressedPredictions
  use ScreenplayWeb.DataCase

  import Screenplay.Factory

  setup_all do
    start_supervised!(Screenplay.Places.Cache)
    :ok
  end

  describe "suppressed_predictions" do
    setup do
      PlaceCacheHelpers.seed_place_cache("places_and_screens_for_prediction_tests.json")
      :ok
    end

    test "get_suppressed_predictions/1 nil with invalid id" do
      insert(:suppressed_predictions, %{
        location_id: "place-one",
        route_id: "place-one-route",
        direction_id: 1,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:suppressed_predictions, %{
        location_id: "place-two",
        route_id: "place-two-route",
        direction_id: 0,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      assert {:error, :not_found} ==
               SuppressedPredictions.get_suppressed_prediction("place_typo", "place-one-route", 1)
    end

    test "clear_suppressed_predictions_for_end_of_day/0" do
      insert(:suppressed_predictions, %{
        location_id: "place-one",
        route_id: "place-one-route",
        direction_id: 1,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:suppressed_predictions, %{
        location_id: "place-two",
        route_id: "place-two-route",
        direction_id: 0,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:suppressed_predictions, %{
        location_id: "place-four",
        route_id: "Green",
        direction_id: 0,
        clear_at_end_of_day: false,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:suppressed_predictions, %{
        location_id: "place-six",
        route_id: "Silver",
        direction_id: 0,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      assert(4 == length(SuppressedPredictions.get_all_suppressed_predictions()))
      assert({3, nil} = SuppressedPredictions.clear_suppressed_predictions_for_end_of_day())
      assert(1 == length(SuppressedPredictions.get_all_suppressed_predictions()))
    end

    test "get_all_suppressed_predictions_for_data/0" do
      insert(:suppressed_predictions, %{
        location_id: "jfk_umass_ashmont_platform",
        route_id: "Red",
        direction_id: 1,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:suppressed_predictions, %{
        location_id: "jfk_umass_braintree_platform",
        route_id: "Red",
        direction_id: 0,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:suppressed_predictions, %{
        location_id: "place-two",
        route_id: "Blue",
        direction_id: 0,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:suppressed_predictions, %{
        location_id: "place-four",
        route_id: "Green",
        direction_id: 0,
        clear_at_end_of_day: false,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:suppressed_predictions, %{
        location_id: "place-six",
        route_id: "Silver",
        direction_id: 0,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      PredictionSuppression.init([])

      new_line_stops =
        [
          %{line: "Silver", suppression_type: :terminal, stop_id: "place-six", direction_id: 0},
          %{line: "Silver", suppression_type: :terminal, stop_id: "place-six", direction_id: 1},
          %{line: "Red", suppression_type: :stop, stop_id: "place-jfk", direction_id: 0},
          %{line: "Red", suppression_type: :stop, stop_id: "place-jfk", direction_id: 1},
          %{line: "Blue", suppression_type: :stop, stop_id: "place-two", direction_id: 0},
          %{line: "Orange", suppression_type: nil, stop_id: "place-three", direction_id: 0},
          %{line: "Orange", suppression_type: nil, stop_id: "place-three", direction_id: 1},
          %{line: "Green", suppression_type: :terminal, stop_id: "place-four", direction_id: 0},
          %{line: "Green", suppression_type: :terminal, stop_id: "place-four", direction_id: 1},
          %{line: "Silver", suppression_type: :terminal, stop_id: "place-five", direction_id: 0},
          %{line: "Silver", suppression_type: :terminal, stop_id: "place-five", direction_id: 1}
        ]

      :ets.insert(:line_stops, {:value, new_line_stops})

      assert [
               %{
                 direction_id: 0,
                 route_id: "741",
                 stop_id: "place-six",
                 suppression_type: :terminal
               },
               %{
                 direction_id: 0,
                 route_id: "742",
                 stop_id: "place-six",
                 suppression_type: :terminal
               },
               %{
                 direction_id: 0,
                 route_id: "743",
                 stop_id: "place-six",
                 suppression_type: :terminal
               },
               %{
                 direction_id: 1,
                 route_id: "741",
                 stop_id: "place-six",
                 suppression_type: :none
               },
               %{
                 direction_id: 1,
                 route_id: "742",
                 stop_id: "place-six",
                 suppression_type: :none
               },
               %{
                 direction_id: 1,
                 route_id: "743",
                 stop_id: "place-six",
                 suppression_type: :none
               },
               %{stop_id: "70085", route_id: "Red", direction_id: 0, suppression_type: :none},
               %{stop_id: "70086", route_id: "Red", direction_id: 1, suppression_type: :stop},
               %{stop_id: "70095", route_id: "Red", direction_id: 0, suppression_type: :stop},
               %{stop_id: "70096", route_id: "Red", direction_id: 1, suppression_type: :none},
               %{
                 direction_id: 0,
                 route_id: "Green-B",
                 stop_id: "place-four",
                 suppression_type: :terminal
               },
               %{
                 stop_id: "place-four",
                 route_id: "Green-C",
                 direction_id: 0,
                 suppression_type: :terminal
               },
               %{
                 stop_id: "place-four",
                 route_id: "Green-B",
                 direction_id: 1,
                 suppression_type: :none
               },
               %{
                 stop_id: "place-four",
                 route_id: "Green-C",
                 direction_id: 1,
                 suppression_type: :none
               },
               %{
                 stop_id: "place-two",
                 route_id: "Blue",
                 direction_id: 0,
                 suppression_type: :stop
               }
             ] = SuppressedPredictions.get_all_suppressed_predictions_for_data()
    end
  end
end
