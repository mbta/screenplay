defmodule Screenplay.Alerts.Cache.StoreTest do
  use ExUnit.Case

  alias Screenplay.Alerts.Alert
  alias Screenplay.Alerts.Cache.Store

  setup_all do
    _ = start_supervised(Store)
    :ok
  end

  test "updating and fetching" do
    alert1 =
      struct(Alert,
        id: "123",
        informed_entities: [
          %{route: "Blue"},
          %{stop: "place-pktrm"}
        ]
      )

    alert2 =
      struct(Alert,
        id: "456",
        informed_entities: [
          %{route: "Red"}
        ]
      )

    alerts = [alert1, alert2]

    Store.update(alerts)

    expected_alerts = MapSet.new(alerts)
    actual_alerts = MapSet.new(Store.alerts())

    assert expected_alerts == actual_alerts
    assert Store.alert("123") == alert1
    assert Store.alert("aaa") == nil
  end
end
