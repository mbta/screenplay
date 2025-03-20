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

    test "get_suppressed_predictions/1" do
      insert(:suppressed_predictions, %{
        id: 1,
        location_id: "place-zero",
        direction_id: 1,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:suppressed_predictions, %{
        id: 2,
        location_id: "place-one",
        direction_id: 2,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:suppressed_predictions, %{
        id: 3,
        location_id: "place-two",
        direction_id: 0,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      assert %SuppressedPrediction{
               id: 3,
               location_id: "place-two",
               direction_id: 0,
               clear_at_end_of_day: true
             } =
               SuppressedPredictions.get_suppressed_prediction(3)
    end

    test "get_suppressed_predictions/1 nil with invalid id" do
      insert(:suppressed_predictions, %{
        id: 1,
        location_id: "place-zero",
        direction_id: 1,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:suppressed_predictions, %{
        id: 2,
        location_id: "place-one",
        direction_id: 2,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:suppressed_predictions, %{
        id: 3,
        location_id: "place-two",
        direction_id: 0,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      assert nil ==
               SuppressedPredictions.get_suppressed_prediction(143)
    end

    test "get_all_suppressed_predictions/0" do
      insert(:suppressed_predictions, %{
        id: 1,
        location_id: "place-zero",
        direction_id: 1,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:suppressed_predictions, %{
        id: 2,
        location_id: "place-one",
        direction_id: 2,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:suppressed_predictions, %{
        id: 3,
        location_id: "place-two",
        direction_id: 0,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      assert 3 =
               length(SuppressedPredictions.get_all_suppressed_predictions())
    end

    test "create_suppressed_prediction/1" do
      assert [] = SuppressedPredictions.get_all_suppressed_predictions()

      suppressed_prediction = %{
        location_id: "place-three",
        direction_id: 0,
        clear_at_end_of_day: true
      }

      assert {:ok, actual} =
               SuppressedPredictions.create_suppressed_prediction(suppressed_prediction)

      assert actual.location_id == suppressed_prediction.location_id
      assert actual.direction_id == suppressed_prediction.direction_id
      assert actual.clear_at_end_of_day == suppressed_prediction.clear_at_end_of_day
      assert 1 == length(SuppressedPredictions.get_all_suppressed_predictions())
    end

    test "create_suppressed_prediction/1 errors with invalid arguments" do
      insert(:suppressed_predictions, %{
        id: 1,
        location_id: "place-zero",
        direction_id: 1,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:suppressed_predictions, %{
        id: 2,
        location_id: "place-one",
        direction_id: 2,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:suppressed_predictions, %{
        id: 3,
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

    test "update_suppressed_prediction/2" do
      insert(:suppressed_predictions, %{
        id: 1,
        location_id: "place-zero",
        direction_id: 1,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:suppressed_predictions, %{
        id: 2,
        location_id: "place-one",
        direction_id: 2,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:suppressed_predictions, %{
        id: 3,
        location_id: "place-two",
        direction_id: 0,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      changes = %{clear_at_end_of_day: false}

      existing_prediction = %SuppressedPrediction{
        id: 2,
        location_id: "place-one",
        direction_id: 2,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      }

      {:ok, updated} =
        SuppressedPredictions.update_suppressed_prediction(existing_prediction, changes)

      assert updated.location_id == existing_prediction.location_id
      assert updated.direction_id == existing_prediction.direction_id
      assert updated.clear_at_end_of_day != existing_prediction.clear_at_end_of_day
    end

    test "update_suppressed_prediction/2 errors with invalid arguments" do
      insert(:suppressed_predictions, %{
        id: 1,
        location_id: "place-zero",
        direction_id: 1,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:suppressed_predictions, %{
        id: 2,
        location_id: "place-one",
        direction_id: 2,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:suppressed_predictions, %{
        id: 3,
        location_id: "place-two",
        direction_id: 0,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      changes = %{location_id: "invalid_location", direction_id: 4}

      existing_prediction = %SuppressedPrediction{
        id: 2,
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

    test "delete_suppressed_prediction/1" do
      insert(:suppressed_predictions, %{
        id: 1,
        location_id: "place-zero",
        direction_id: 1,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:suppressed_predictions, %{
        id: 2,
        location_id: "place-one",
        direction_id: 2,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:suppressed_predictions, %{
        id: 3,
        location_id: "place-two",
        direction_id: 0,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      assert 3 =
               length(SuppressedPredictions.get_all_suppressed_predictions())

      existing_prediction = %SuppressedPrediction{
        id: 2,
        location_id: "place-one",
        direction_id: 2,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      }

      {:ok, deleted} =
        SuppressedPredictions.delete_suppressed_prediction(existing_prediction)

      assert deleted.location_id == existing_prediction.location_id
      assert deleted.direction_id == existing_prediction.direction_id
      assert deleted.clear_at_end_of_day == existing_prediction.clear_at_end_of_day

      assert 2 =
               length(SuppressedPredictions.get_all_suppressed_predictions())
    end
  end
end
