defmodule Screenplay.SuppressedPredictionsTest do
  alias Screenplay.PlaceCacheHelpers
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
  end
end
