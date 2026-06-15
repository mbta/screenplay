defmodule Screenplay.EmergencyTakeoversTest do
  use ScreenplayWeb.DataCase, async: true

  alias Screenplay.EmergencyTakeovers
  import Screenplay.Factory

  describe "get_active_and_past_alerts/0" do
    test "returns empty lists when there are no alerts" do
      assert {[], []} == EmergencyTakeovers.get_active_and_past_alerts()
    end

    test "returns only active alerts" do
      active_alert_1 =
        insert(:emergency_takeover,
          start_time: ~U[2023-01-01 12:00:00Z],
          cleared_at: nil
        )

      active_alert_2 =
        insert(:emergency_takeover,
          start_time: ~U[2023-01-02 12:00:00Z],
          cleared_at: nil
        )

      {active_alerts, past_alerts} = EmergencyTakeovers.get_active_and_past_alerts()

      assert Enum.empty?(past_alerts)
      assert length(active_alerts) == 2

      assert Enum.map(active_alerts, & &1["id"]) == [
               to_string(active_alert_2.id),
               to_string(active_alert_1.id)
             ]
    end

    test "returns only past alerts" do
      past_alert_1 =
        insert(:emergency_takeover,
          start_time: ~U[2023-01-01 12:00:00Z],
          cleared_at: ~U[2023-01-01 13:00:00Z]
        )

      past_alert_2 =
        insert(:emergency_takeover,
          start_time: ~U[2023-01-02 12:00:00Z],
          cleared_at: ~U[2023-01-02 13:00:00Z]
        )

      {active_alerts, past_alerts} = EmergencyTakeovers.get_active_and_past_alerts()

      assert Enum.empty?(active_alerts)
      assert length(past_alerts) == 2

      assert Enum.map(past_alerts, & &1["id"]) == [
               to_string(past_alert_2.id),
               to_string(past_alert_1.id)
             ]
    end

    test "returns a mix of active and past alerts" do
      active_alert =
        insert(:emergency_takeover,
          start_time: ~U[2023-01-03 12:00:00Z],
          cleared_at: nil
        )

      past_alert =
        insert(:emergency_takeover,
          start_time: ~U[2023-01-01 12:00:00Z],
          cleared_at: ~U[2023-01-01 13:00:00Z]
        )

      {active_alerts, past_alerts} = EmergencyTakeovers.get_active_and_past_alerts()

      assert length(active_alerts) == 1
      assert [to_string(active_alert.id)] == Enum.map(active_alerts, & &1["id"])
      assert length(past_alerts) == 1
      assert [to_string(past_alert.id)] == Enum.map(past_alerts, & &1["id"])
    end
  end
end
