defmodule Screenplay.SuppressedPredictionsTest do
  alias Screenplay.PlaceCacheHelpers
  alias Screenplay.SuppressedPredictions
  alias Screenplay.SuppressedPredictions.SuppressedPrediction
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

      assert nil ==
               SuppressedPredictions.get_suppressed_prediction("place_typo", "place-one-route", 1)
    end

    test "create_suppressed_prediction/1 errors with invalid arguments" do
      suppressed_prediction = %{
        location_id: "invalid_location",
        direction_id: 4,
        clear_at_end_of_day: true
      }

      assert {:error, %Ecto.Changeset{} = changeset} =
               SuppressedPredictions.create_suppressed_prediction(suppressed_prediction)

      assert {_, _} = changeset.errors[:location_id]
      assert {_, _} = changeset.errors[:direction_id]
    end

    test "create_suppressed_prediction/1 errors with Green Line invalid route id" do
      suppressed_prediction = %{
        location_id: "place-four",
        route_id: "Green-B",
        direction_id: 1,
        clear_at_end_of_day: true
      }

      assert {:error, %Ecto.Changeset{} = changeset} =
               SuppressedPredictions.create_suppressed_prediction(suppressed_prediction)

      assert {"Please just provide `Green` as the route_id for handling all Green Line routes", _} =
               changeset.errors[:route_id]
    end

    test "create_suppressed_prediction/1 errors with Silver Line not using correct route ids" do
      suppressed_prediction = %{
        location_id: "place-five",
        route_id: "Silver",
        direction_id: 1,
        clear_at_end_of_day: true
      }

      assert {:error, %Ecto.Changeset{} = changeset} =
               SuppressedPredictions.create_suppressed_prediction(suppressed_prediction)

      assert {"PA/ESS Place `place-five currently has only routes that are not supported in Screenplay: `747`",
              _} =
               changeset.errors[:route_id]
    end

    test "update_suppressed_prediction/2 errors with invalid arguments" do
      insert(:suppressed_predictions, %{
        location_id: "place-one",
        route_id: "Green",
        direction_id: 1,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:suppressed_predictions, %{
        location_id: "place-two",
        route_id: "Red",
        direction_id: 0,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      changes = %{location_id: "invalid_location", direction_id: 4}

      existing_prediction = %SuppressedPrediction{
        location_id: "place-one",
        direction_id: 1,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      }

      assert {:error, %Ecto.Changeset{} = changeset} =
               SuppressedPredictions.update_suppressed_prediction(existing_prediction, changes)

      assert {_, _} = changeset.errors[:location_id]
      assert {_, _} = changeset.errors[:direction_id]
    end
  end
end
