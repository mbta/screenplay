defmodule Screenplay.Alerts.AlertTest do
  use ExUnit.Case

  alias Screenplay.Alerts.Alert

  describe "to_json/1" do
    test "handles canned message" do
      alert = %Alert{
        id: "alert",
        message: %{type: :canned, id: "4"},
        stations: ["Wellington", "Malden Center"],
        schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]}
      }

      expected = %{
        "id" => "alert",
        "message" => %{"type" => "canned", "id" => "4"},
        "stations" => ["Wellington", "Malden Center"],
        "schedule" => %{"start" => "2021-08-19T17:09:42Z", "end" => "2021-08-19T17:39:42Z"}
      }

      assert expected == Alert.to_json(alert)
    end

    test "handles custom message" do
      alert = %Alert{
        id: "alert",
        message: %{type: :custom, text: "This is an alert"},
        stations: ["Wellington", "Malden Center"],
        schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]}
      }

      expected = %{
        "id" => "alert",
        "message" => %{"type" => "custom", "text" => "This is an alert"},
        "stations" => ["Wellington", "Malden Center"],
        "schedule" => %{"start" => "2021-08-19T17:09:42Z", "end" => "2021-08-19T17:39:42Z"}
      }

      assert expected == Alert.to_json(alert)
    end
  end

  describe "from_json/1" do
    test "handles canned message" do
      json = %{
        "id" => "alert",
        "message" => %{"type" => "canned", "id" => "4"},
        "stations" => ["Wellington", "Malden Center"],
        "schedule" => %{"start" => "2021-08-19T17:09:42Z", "end" => "2021-08-19T17:39:42Z"}
      }

      expected = %Alert{
        id: "alert",
        message: %{type: :canned, id: "4"},
        stations: ["Wellington", "Malden Center"],
        schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]}
      }

      assert expected == Alert.from_json(json)
    end

    test "handles custom message" do
      json = %{
        "id" => "alert",
        "message" => %{"type" => "custom", "text" => "This is an alert"},
        "stations" => ["Wellington", "Malden Center"],
        "schedule" => %{"start" => "2021-08-19T17:09:42Z", "end" => "2021-08-19T17:39:42Z"}
      }

      expected = %Alert{
        id: "alert",
        message: %{type: :custom, text: "This is an alert"},
        stations: ["Wellington", "Malden Center"],
        schedule: %{start: ~U[2021-08-19 17:09:42Z], end: ~U[2021-08-19 17:39:42Z]}
      }

      assert expected == Alert.from_json(json)
    end
  end
end
