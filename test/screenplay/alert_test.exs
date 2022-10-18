defmodule Screenplay.Alerts.AlertTest do
  use ExUnit.Case, async: true

  alias Screenplay.Alerts.Alert

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

    test "returns :error if fetch function returns :error", context do
      %{
        x_get_json_fn: x_get_json_fn
      } = context

      assert :error == Alert.fetch(x_get_json_fn)
    end
  end
end
