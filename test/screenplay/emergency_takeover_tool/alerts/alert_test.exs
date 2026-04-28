defmodule Screenplay.EmergencyTakeoverTool.Alerts.AlertTest do
  use ExUnit.Case

  alias Screenplay.EmergencyTakeoverTool.Alerts.Alert

  describe "new/4" do
    test "creates a new alert with the specified values" do
      indoor_message = %{type: :canned, id: 1}
      outdoor_message = %{type: :custom, text: "hi"}
      stations = ["Orient Heights", "Airport"]
      schedule = %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]}
      user = "test user"

      alert = Alert.new(indoor_message, outdoor_message, stations, schedule, user)

      assert %Alert{
               indoor_message: ^indoor_message,
               outdoor_message: ^outdoor_message,
               stations: ^stations,
               schedule: ^schedule,
               created_by: ^user,
               edited_by: ^user
             } = alert

      assert not is_nil(alert.id)
    end
  end

  describe "clear/2" do
    test "sets cleared_at and cleared_by properties" do
      alert = %Alert{
        id: "alert",
        indoor_message: %{type: :canned, id: 1},
        outdoor_message: %{type: :canned, id: 2},
        stations: ["Orient Heights", "Airport"],
        schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
        created_by: "test user",
        edited_by: "test_user",
        cleared_at: nil,
        cleared_by: nil
      }

      clear_user = "clear_user"

      assert %{cleared_by: ^clear_user, cleared_at: %DateTime{}} = Alert.clear(alert, clear_user)
    end
  end

  describe "update/3" do
    test "replaces the specified values, and not others" do
      alert = %Alert{
        id: "alert",
        indoor_message: %{type: :canned, id: 1},
        outdoor_message: %{type: :canned, id: 2},
        stations: ["Orient Heights", "Airport"],
        schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
        created_by: "test user",
        edited_by: "test_user",
        cleared_at: nil,
        cleared_by: nil
      }

      changes_map = %{outdoor_message: %{type: :custom, text: "All clear"}}
      update_user = "test_user2"

      expected = %Alert{
        id: "alert",
        indoor_message: %{type: :canned, id: 1},
        outdoor_message: %{type: :custom, text: "All clear"},
        stations: ["Orient Heights", "Airport"],
        schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
        created_by: "test user",
        edited_by: "test_user2",
        cleared_at: nil,
        cleared_by: nil
      }

      assert expected == Alert.update(alert, changes_map, update_user)
    end

    test "ignores nil values in changes_map" do
      alert = %Alert{
        id: "alert",
        indoor_message: %{type: :canned, id: 1},
        outdoor_message: %{type: :canned, id: 1},
        stations: ["Orient Heights", "Airport"],
        schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
        created_by: "test user",
        edited_by: "test_user",
        cleared_at: nil,
        cleared_by: nil
      }

      changes_map = %{indoor_message: nil, stations: ["Government Center"], schedule: nil}
      update_user = "test_user2"

      expected = %Alert{
        id: "alert",
        indoor_message: %{type: :canned, id: 1},
        outdoor_message: %{type: :canned, id: 1},
        stations: ["Government Center"],
        schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
        created_by: "test user",
        edited_by: "test_user2",
        cleared_at: nil,
        cleared_by: nil
      }

      assert expected == Alert.update(alert, changes_map, update_user)
    end
  end

  describe "to_json/1" do
    test "handles both messages" do
      alert = %Alert{
        id: "alert",
        indoor_message: %{type: :canned, id: 4},
        outdoor_message: %{type: :custom, text: "hi"},
        stations: ["Wellington", "Malden Center"],
        schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
        created_by: "user",
        edited_by: "user",
        cleared_at: nil,
        cleared_by: nil
      }

      expected = %{
        "id" => "alert",
        "indoor_message" => %{"type" => "canned", "id" => 4},
        "outdoor_message" => %{"type" => "custom", "text" => "hi"},
        "stations" => ["Wellington", "Malden Center"],
        "schedule" => %{"start" => "2021-08-19T17:09:42Z", "end" => "2021-08-19T17:39:42Z"},
        "created_by" => "user",
        "edited_by" => "user",
        "cleared_at" => nil,
        "cleared_by" => nil
      }

      assert expected == Alert.to_json(alert)
    end
  end

  describe "from_json/1" do
    test "handles both messages and trims username" do
      json = %{
        "id" => "alert",
        "indoor_message" => %{"type" => "custom", "text" => "This is an alert"},
        "outdoor_message" => %{"type" => "canned", "id" => 4},
        "stations" => ["Wellington", "Malden Center"],
        "schedule" => %{"start" => "2021-08-19T17:09:42Z", "end" => "2021-08-19T17:39:42Z"},
        "created_by" => "ActiveDirectory_MBTA\\user",
        "edited_by" => "ActiveDirectory_MBTA\\user"
      }

      expected = %Alert{
        id: "alert",
        indoor_message: %{type: :custom, text: "This is an alert"},
        outdoor_message: %{type: :canned, id: 4},
        stations: ["Wellington", "Malden Center"],
        schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]},
        created_by: "user",
        edited_by: "user",
        cleared_at: nil,
        cleared_by: nil
      }

      assert expected == Alert.from_json(json)
    end
  end
end
