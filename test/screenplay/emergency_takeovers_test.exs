defmodule Screenplay.EmergencyTakeoversTest do
  use ScreenplayWeb.DataCase, async: true

  alias Screenplay.EmergencyTakeovers
  alias Screenplay.EmergencyTakeoverTool.EmergencyTakeover
  import Screenplay.Factory

  describe "get_alerts/0" do
    test "returns empty lists when there are no alerts" do
      assert {[], []} == EmergencyTakeovers.get_alerts()
    end

    test "returns only active alerts" do
      active_alert_1 =
        insert(:emergency_takeover,
          start_time: ~U[2026-01-01 12:00:00Z],
          cleared_at: nil
        )

      active_alert_2 =
        insert(:emergency_takeover,
          start_time: ~U[2026-01-02 12:00:00Z],
          cleared_at: nil
        )

      {active_alerts, past_alerts} = EmergencyTakeovers.get_alerts()

      assert Enum.empty?(past_alerts)
      assert length(active_alerts) == 2

      assert Enum.map(active_alerts, & &1.id) == [active_alert_2.id, active_alert_1.id]
    end

    test "returns only past alerts" do
      past_alert_1 =
        insert(:emergency_takeover,
          start_time: ~U[2026-01-01 12:00:00Z],
          cleared_at: ~U[2026-01-01 13:00:00Z]
        )

      past_alert_2 =
        insert(:emergency_takeover,
          start_time: ~U[2026-01-02 12:00:00Z],
          cleared_at: ~U[2026-01-02 13:00:00Z]
        )

      {active_alerts, past_alerts} = EmergencyTakeovers.get_alerts()

      assert Enum.empty?(active_alerts)
      assert length(past_alerts) == 2

      assert Enum.map(past_alerts, & &1.id) == [past_alert_2.id, past_alert_1.id]
    end

    test "returns a mix of active and past alerts" do
      active_alert =
        insert(:emergency_takeover,
          start_time: ~U[2026-01-03 12:00:00Z],
          cleared_at: nil
        )

      past_alert =
        insert(:emergency_takeover,
          start_time: ~U[2026-01-01 12:00:00Z],
          cleared_at: ~U[2026-01-01 13:00:00Z]
        )

      {active_alerts, past_alerts} = EmergencyTakeovers.get_alerts()

      assert length(active_alerts) == 1
      assert [active_alert.id] == Enum.map(active_alerts, & &1.id)
      assert length(past_alerts) == 1
      assert [past_alert.id] == Enum.map(past_alerts, & &1.id)
    end
  end

  describe "get_active_alerts/0" do
    test "returns empty list when there are no alerts" do
      assert [] == EmergencyTakeovers.get_active_alerts()
    end

    test "returns only active alerts" do
      _active_alert =
        insert(:emergency_takeover,
          id: 123,
          start_time: ~U[2026-01-01 12:00:00Z],
          cleared_at: nil
        )

      _past_alert =
        insert(:emergency_takeover,
          start_time: ~U[2026-01-01 12:00:00Z],
          cleared_at: ~U[2026-01-01 13:00:00Z]
        )

      active_alerts = EmergencyTakeovers.get_active_alerts()

      assert length(active_alerts) == 1
      assert [123] == Enum.map(active_alerts, & &1.id)
    end
  end

  describe "remove_overlapping_alerts/3" do
    test "does nothing when there are no overlapping alerts" do
      insert(:emergency_takeover, stations: ["station1", "station2"], cleared_at: nil)

      cleared_stations =
        EmergencyTakeovers.remove_overlapping_alerts(nil, ["station3"], "test_user")

      assert cleared_stations == []
      assert length(EmergencyTakeovers.get_active_alerts()) == 1
    end

    test "clears an alert with full station overlap" do
      alert = insert(:emergency_takeover, stations: ["station1", "station2"], cleared_at: nil)

      cleared_stations =
        EmergencyTakeovers.remove_overlapping_alerts(
          nil,
          ["station1", "station2", "station3"],
          "test_user"
        )

      assert Enum.sort(cleared_stations) == ["station1", "station2"]
      assert Repo.get(EmergencyTakeover, alert.id).cleared_at != nil
    end

    test "edits an alert with partial station overlap" do
      alert =
        insert(:emergency_takeover,
          stations: ["station1", "station2", "station3"],
          cleared_at: nil
        )

      cleared_stations =
        EmergencyTakeovers.remove_overlapping_alerts(nil, ["station2", "station4"], "test_user")

      assert cleared_stations == ["station2"]
      updated_alert = Repo.get(EmergencyTakeover, alert.id)
      assert updated_alert.stations == ["station1", "station3"]
      assert updated_alert.cleared_at == nil
    end

    test "handles multiple overlapping alerts" do
      alert_to_clear = insert(:emergency_takeover, stations: ["station1"], cleared_at: nil)

      alert_to_edit =
        insert(:emergency_takeover, stations: ["station2", "station3"], cleared_at: nil)

      cleared_stations =
        EmergencyTakeovers.remove_overlapping_alerts(nil, ["station1", "station2"], "test_user")

      assert Enum.sort(cleared_stations) == ["station1", "station2"]
      refute Repo.get(EmergencyTakeover, alert_to_clear.id).cleared_at == nil
      updated_alert = Repo.get(EmergencyTakeover, alert_to_edit.id)
      assert updated_alert.stations == ["station3"]
    end

    test "does not consider the alert being edited" do
      alert = insert(:emergency_takeover, stations: ["station1", "station2"], cleared_at: nil)

      cleared_stations =
        EmergencyTakeovers.remove_overlapping_alerts(
          alert.id,
          ["station1", "station2"],
          "test_user"
        )

      assert cleared_stations == []
      assert Repo.get(EmergencyTakeover, alert.id).cleared_at == nil
    end

    test "ignores already cleared alerts" do
      insert(:emergency_takeover, stations: ["station1"], cleared_at: DateTime.utc_now())

      cleared_stations =
        EmergencyTakeovers.remove_overlapping_alerts(nil, ["station1"], "test_user")

      assert cleared_stations == []
      assert Enum.empty?(EmergencyTakeovers.get_active_alerts())
    end

    test "returns empty list for empty new_stations" do
      insert(:emergency_takeover, stations: ["station1", "station2"], cleared_at: nil)

      cleared_stations = EmergencyTakeovers.remove_overlapping_alerts(nil, [], "test_user")

      assert cleared_stations == []
      assert length(EmergencyTakeovers.get_active_alerts()) == 1
    end
  end
end
