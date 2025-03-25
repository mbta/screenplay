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
        location_id: "place-zero",
        direction_id: 1,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:suppressed_predictions, %{
        location_id: "place-one",
        direction_id: 2,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:suppressed_predictions, %{
        location_id: "place-two",
        direction_id: 0,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      assert nil ==
               SuppressedPredictions.get_suppressed_prediction("place_typo", 2)
    end

    test "create_suppressed_prediction/1 errors with invalid arguments" do
      insert(:suppressed_predictions, %{
        location_id: "place-zero",
        direction_id: 1,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:suppressed_predictions, %{
        location_id: "place-one",
        direction_id: 2,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:suppressed_predictions, %{
        location_id: "place-two",
        direction_id: 0,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

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

    test "update_suppressed_prediction/2 errors with invalid arguments" do
      insert(:suppressed_predictions, %{
        location_id: "place-zero",
        direction_id: 1,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:suppressed_predictions, %{
        location_id: "place-one",
        direction_id: 2,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:suppressed_predictions, %{
        location_id: "place-two",
        direction_id: 0,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      changes = %{location_id: "invalid_location", direction_id: 4}

      existing_prediction = %SuppressedPrediction{
        location_id: "place-one",
        direction_id: 2,
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
