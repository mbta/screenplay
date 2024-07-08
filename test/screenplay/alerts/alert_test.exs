defmodule Screenplay.Alerts.AlertTest do
  use ExUnit.Case, async: true
  use ExUnitProperties

  alias Screenplay.Alerts.Alert

  @subway_ids [
    "red",
    "orange",
    "blue",
    "green",
    "green-b",
    "green-c",
    "green-d",
    "green-e"
  ]

  defp alert_json(id) do
    %{
      "id" => id,
      "attributes" => %{
        "active_period" => [],
        "created_at" => nil,
        "updated_at" => nil,
        "cause" => nil,
        "effect" => nil,
        "header" => nil,
        "informed_entity" => [],
        "lifecycle" => nil,
        "severity" => nil,
        "timeframe" => nil,
        "url" => nil,
        "description" => nil
      }
    }
  end

  describe "fetch_by_stop_and_route/3" do
    setup do
      alerts = [alert_json("1"), alert_json("2"), alert_json("3")]

      %{
        get_json_fn: fn
          _, %{"include" => "routes"} ->
            {:ok, %{"data" => alerts, "included" => []}}
        end,
        x_get_json_fn: fn
          _, %{"include" => "routes"} -> :error
        end
      }
    end

    test "returns {:ok, alerts} if fetch function succeeds in both cases", context do
      %{
        get_json_fn: get_json_fn
      } = context

      assert {:ok,
              [
                %Alert{id: "1"},
                %Alert{id: "2"},
                %Alert{id: "3"}
              ]} = Alert.fetch(get_json_fn)
    end

    test "returns {:ok, []} if fetch function returns an empty alerts list" do
      get_json_fn = fn _, _ -> {:ok, %{"data" => []}} end

      assert {:ok, []} = Alert.fetch(get_json_fn)
    end

    test "returns :error if fetch function returns :error", context do
      %{
        x_get_json_fn: x_get_json_fn
      } = context

      assert :error == Alert.fetch(x_get_json_fn)
    end
  end

  describe "interpret_severity/1" do
    for {severity, message} <- %{
          1 => "up to 10 minutes",
          2 => "up to 10 minutes",
          3 => "up to 10 minutes",
          4 => "up to 15 minutes",
          5 => "up to 20 minutes",
          6 => "up to 25 minutes",
          7 => "up to 30 minutes",
          8 => "more than 30 minutes",
          9 => "more than 60 minutes"
        } do
      test "returns correct message for severity #{severity}" do
        assert unquote(message) == Alert.interpret_severity(unquote(severity))
      end
    end
  end

  describe "significant?/1" do
    property "true for subway delay with severity > 3" do
      subway_affected_lists_generator =
        StreamData.list_of(
          StreamData.member_of(@subway_ids),
          min_length: 1
        )

      check all(
              affected_list <- subway_affected_lists_generator,
              severity <- StreamData.member_of(4..8)
            ) do
        alert = %Alert{effect: "DELAY", affected_list: affected_list, severity: severity}
        assert Alert.significant?(alert)
      end
    end

    property "false for subway delay with severity <= 3" do
      subway_affected_lists_generator =
        StreamData.list_of(
          StreamData.member_of(@subway_ids),
          min_length: 1
        )

      check all(
              affected_list <- subway_affected_lists_generator,
              severity <- StreamData.member_of(1..3)
            ) do
        alert = %Alert{effect: "DELAY", affected_list: affected_list, severity: severity}
        refute Alert.significant?(alert)
      end
    end

    property "false for all other delay alerts" do
      non_subway_affected_lists_generator =
        StreamData.member_of([[:access], ["bus"], ["sl1"], ["sl2"], ["ferry"]])

      check all(
              affected_list <- non_subway_affected_lists_generator,
              severity <- StreamData.member_of(1..9)
            ) do
        alert = %Alert{effect: "DELAY", affected_list: affected_list, severity: severity}
        refute Alert.significant?(alert)
      end
    end

    test "true for elevator_closure alerts" do
      alert = %Alert{effect: "ELEVATOR_CLOSURE", affected_list: [:access]}
      assert Alert.significant?(alert)
    end

    test "true for stop_closure, detour, stop_move, snow_route, suspension effects on an alert primarily affecting bus" do
      bus_affected_lists_generator = StreamData.member_of([["bus"], ["sl1"], ["sl2"]])

      bus_effect_generator =
        StreamData.member_of(["STOP_CLOSURE", "DETOUR", "STOP_MOVE", "SNOW_ROUTE", "SUSPENSION"])

      check all(
              affected_list <- bus_affected_lists_generator,
              effect <- bus_effect_generator
            ) do
        alert = %Alert{effect: effect, affected_list: affected_list}
        assert Alert.significant?(alert)
      end
    end

    test "false for other effects on an alert primarily affecting bus" do
      bus_affected_lists_generator = StreamData.member_of([["bus"], ["sl1"], ["sl2"]])

      non_bus_effect_generator = StreamData.member_of(["SHUTTLE", "STATION_CLOSURE"])

      check all(
              affected_list <- bus_affected_lists_generator,
              effect <- non_bus_effect_generator
            ) do
        alert = %Alert{effect: effect, affected_list: affected_list}
        refute Alert.significant?(alert)
      end
    end

    test "true for shuttle, station_closure, suspension effects on an alert primarily affecting subway" do
      subway_affected_lists_generator =
        StreamData.list_of(
          StreamData.member_of(@subway_ids),
          min_length: 1
        )

      subway_effect_generator = StreamData.member_of(["SHUTTLE", "STATION_CLOSURE", "SUSPENSION"])

      check all(
              affected_list <- subway_affected_lists_generator,
              effect <- subway_effect_generator
            ) do
        alert = %Alert{effect: effect, affected_list: affected_list}
        assert Alert.significant?(alert)
      end
    end

    test "false for other effects on an alert primarily affecting subway" do
      subway_affected_lists_generator =
        StreamData.list_of(
          StreamData.member_of(@subway_ids),
          min_length: 1
        )

      non_subway_effect_generator =
        StreamData.member_of(["STOP_CLOSURE", "DETOUR", "STOP_MOVE", "SNOW_ROUTE"])

      check all(
              affected_list <- subway_affected_lists_generator,
              effect <- non_subway_effect_generator
            ) do
        alert = %Alert{effect: effect, affected_list: affected_list}
        refute Alert.significant?(alert)
      end
    end
  end
end
