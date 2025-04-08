defmodule Screenplay.SuppressedPredictionsTest do
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
      PlaceCacheHelpers.seed_place_cache()
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

    test "get_all_suppressed_predictions_for_data/0" do
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

      PredictionSuppression.init([])

      assert [
               %{
                 direction_id: 0,
                 route_id: "741",
                 location_id: "place-six",
                 suppressed_type: nil
               },
               %{
                 direction_id: 0,
                 route_id: "742",
                 location_id: "place-six",
                 suppressed_type: nil
               },
               %{
                 direction_id: 0,
                 route_id: "743",
                 location_id: "place-six",
                 suppressed_type: nil
               },
               %{
                 direction_id: 1,
                 route_id: "741",
                 location_id: "place-six",
                 suppressed_type: nil
               },
               %{
                 direction_id: 1,
                 route_id: "742",
                 location_id: "place-six",
                 suppressed_type: nil
               },
               %{
                 direction_id: 1,
                 route_id: "743",
                 location_id: "place-six",
                 suppressed_type: nil
               },
               %{
                 direction_id: 0,
                 route_id: "Green-B",
                 location_id: "place-four",
                 suppressed_type: nil
               },
               %{
                 location_id: "place-four",
                 route_id: "Green-C",
                 direction_id: 0,
                 suppressed_type: nil
               },
               %{
                 location_id: "place-four",
                 route_id: "Green-B",
                 direction_id: 1,
                 suppressed_type: nil
               },
               %{
                 location_id: "place-four",
                 route_id: "Green-C",
                 direction_id: 1,
                 suppressed_type: nil
               }
             ] == SuppressedPredictions.get_all_suppressed_predictions_for_data()
    end
  end
end
