defmodule Screenplay.PaMessages.PaMessageLifecycleTest do
  use ExUnit.Case

  import Mox

  alias Screenplay.Alerts.Alert
  alias Screenplay.PaMessages.PaMessage
  alias Screenplay.PaMessages.PaMessageLifecycle

  @now ~U[2026-11-09 12:00:00Z]
  @update_interval_ms 100_000_000

  setup :verify_on_exit!

  describe "handle_info/2" do
    setup do
      %{now_fn: fn -> @now end}
    end

    test "does not update a pa message when no pa messages exist", %{now_fn: now_fn} do
      expect(Screenplay.Alerts.Cache.Mock, :alerts, fn ->
        [%Alert{id: "1"}]
      end)

      Screenplay.PaMessages.Mock
      |> expect(:list_pa_messages_with_alerts, fn _ -> [] end)
      |> expect(:update_message, 0, fn _, _ -> :ok end)

      {:ok, state} =
        PaMessageLifecycle.init(now_fn: now_fn, update_interval_ms: @update_interval_ms)

      PaMessageLifecycle.handle_info(:update, state)
    end

    test "does not update a pa message when no alerts exist", %{now_fn: now_fn} do
      expect(Screenplay.Alerts.Cache.Mock, :alerts, fn -> [] end)

      Screenplay.PaMessages.Mock
      |> expect(:list_pa_messages_with_alerts, fn _ ->
        [
          %PaMessage{
            id: 1,
            start_datetime: DateTime.add(@now, -1, :hour),
            end_datetime: DateTime.add(@now, 1, :hour)
          },
          %PaMessage{
            id: 2,
            alert_id: 3,
            start_datetime: DateTime.add(@now, -1, :hour),
            end_datetime: DateTime.add(@now, 1, :hour)
          }
        ]
      end)
      |> expect(:update_message, 0, fn _, _ -> :ok end)

      {:ok, state} =
        PaMessageLifecycle.init(now_fn: now_fn, update_interval_ms: @update_interval_ms)

      PaMessageLifecycle.handle_info(:update, state)
    end

    test "does not update a pa message when no alerts match", %{now_fn: now_fn} do
      expect(Screenplay.Alerts.Cache.Mock, :alerts, fn ->
        [
          %Alert{id: 3, informed_entities: [%{route_type: 1}]}
        ]
      end)

      Screenplay.PaMessages.Mock
      |> expect(:list_pa_messages_with_alerts, fn _ ->
        [
          %PaMessage{
            id: 1,
            alert_id: 2,
            start_datetime: DateTime.add(@now, -1, :hour),
            end_datetime: DateTime.add(@now, 1, :hour)
          }
        ]
      end)
      |> expect(:update_message, 0, fn _, _ -> :ok end)

      {:ok, state} =
        PaMessageLifecycle.init(now_fn: now_fn, update_interval_ms: @update_interval_ms)

      PaMessageLifecycle.handle_info(:update, state)
    end

    test "does not update a pa message when an alert has no route_type set", %{now_fn: now_fn} do
      alert_id = 2

      expect(Screenplay.Alerts.Cache.Mock, :alerts, fn ->
        [
          %Alert{id: alert_id, informed_entities: [%{}]}
        ]
      end)

      Screenplay.PaMessages.Mock
      |> expect(:list_pa_messages_with_alerts, fn _ ->
        [
          %PaMessage{
            id: 1,
            alert_id: alert_id,
            start_datetime: DateTime.add(@now, -1, :hour),
            end_datetime: DateTime.add(@now, 1, :hour)
          }
        ]
      end)
      |> expect(:update_message, 0, fn _, _ -> :ok end)

      {:ok, state} =
        PaMessageLifecycle.init(now_fn: now_fn, update_interval_ms: @update_interval_ms)

      PaMessageLifecycle.handle_info(:update, state)
    end

    test "does not update a pa message when an alert has the same effect and modes", %{
      now_fn: now_fn
    } do
      alert_id = 2
      effect = "Station closure due to a rafter of wild turkeys"

      expect(Screenplay.Alerts.Cache.Mock, :alerts, fn ->
        [
          %Alert{
            id: alert_id,
            effect: effect,
            informed_entities: [%{route_type: 1}, %{route_type: 2}]
          }
        ]
      end)

      Screenplay.PaMessages.Mock
      |> expect(:list_pa_messages_with_alerts, fn _ ->
        [
          %PaMessage{
            id: 1,
            alert_id: alert_id,
            alert_modes: [2, 1],
            alert_service_effect: effect,
            start_datetime: DateTime.add(@now, -1, :hour),
            end_datetime: DateTime.add(@now, 1, :hour)
          }
        ]
      end)
      |> expect(:update_message, 0, fn _, _ -> :ok end)

      {:ok, state} =
        PaMessageLifecycle.init(now_fn: now_fn, update_interval_ms: @update_interval_ms)

      PaMessageLifecycle.handle_info(:update, state)
    end

    test "updates a pa message when an alert has a different effect", %{now_fn: now_fn} do
      alert_id = 2

      expect(Screenplay.Alerts.Cache.Mock, :alerts, fn ->
        [
          %Alert{
            id: alert_id,
            effect: "Station closure due to a rafter of wild turkeys",
            informed_entities: [%{route_type: 1}]
          }
        ]
      end)

      pa_message = %PaMessage{
        id: 1,
        alert_id: alert_id,
        alert_modes: [1],
        alert_service_effect: "Station bypass due to flooding",
        start_datetime: DateTime.add(@now, -1, :hour),
        end_datetime: DateTime.add(@now, 1, :hour)
      }

      Screenplay.PaMessages.Mock
      |> expect(:list_pa_messages_with_alerts, fn _ -> [pa_message] end)
      |> expect(:update_message, 1, fn msg, changes ->
        assert msg == pa_message
        assert changes == %{end_datetime: @now}
        {:ok, %{pa_message | end_datetime: @now}}
      end)

      {:ok, state} =
        PaMessageLifecycle.init(now_fn: now_fn, update_interval_ms: @update_interval_ms)

      PaMessageLifecycle.handle_info(:update, state)
    end

    test "updates a pa message when an alert has a different mode", %{now_fn: now_fn} do
      alert_id = 2
      effect = "Station closure due to a rafter of wild turkeys"

      expect(Screenplay.Alerts.Cache.Mock, :alerts, fn ->
        [
          %Alert{
            id: alert_id,
            effect: effect,
            informed_entities: [%{route_type: 0}]
          }
        ]
      end)

      pa_message = %PaMessage{
        id: 1,
        alert_id: alert_id,
        alert_modes: [1],
        alert_service_effect: effect,
        start_datetime: DateTime.add(@now, -1, :hour),
        end_datetime: DateTime.add(@now, 1, :hour)
      }

      Screenplay.PaMessages.Mock
      |> expect(:list_pa_messages_with_alerts, fn _ -> [pa_message] end)
      |> expect(:update_message, 1, fn msg, changes ->
        assert msg == pa_message
        assert changes == %{end_datetime: @now}
        {:ok, %{pa_message | end_datetime: @now}}
      end)

      {:ok, state} =
        PaMessageLifecycle.init(now_fn: now_fn, update_interval_ms: @update_interval_ms)

      PaMessageLifecycle.handle_info(:update, state)
    end

    test "updates a pa message when an alert has a different mode and effect", %{now_fn: now_fn} do
      alert_id = 2

      expect(Screenplay.Alerts.Cache.Mock, :alerts, fn ->
        [
          %Alert{
            id: alert_id,
            effect: "Station closure due to a rafter of wild turkeys",
            informed_entities: [%{route_type: 0}, %{route_type: 1}]
          }
        ]
      end)

      pa_message = %PaMessage{
        id: 1,
        alert_id: alert_id,
        alert_modes: [1],
        alert_service_effect: "Station bypass due to flooding",
        start_datetime: DateTime.add(@now, -1, :hour),
        end_datetime: DateTime.add(@now, 1, :hour)
      }

      Screenplay.PaMessages.Mock
      |> expect(:list_pa_messages_with_alerts, fn _ -> [pa_message] end)
      |> expect(:update_message, 1, fn msg, changes ->
        assert msg == pa_message
        assert changes == %{end_datetime: @now}
        {:ok, %{pa_message | end_datetime: @now}}
      end)

      {:ok, state} =
        PaMessageLifecycle.init(now_fn: now_fn, update_interval_ms: @update_interval_ms)

      PaMessageLifecycle.handle_info(:update, state)
    end

    test "updates a future pa message to have the same start and end time" do
      alert_id = 2
      pa_message_start_time = DateTime.add(@now, 2, :hour)
      now = DateTime.add(pa_message_start_time, -1, :hour)
      now_fn = fn -> now end

      expect(Screenplay.Alerts.Cache.Mock, :alerts, fn ->
        [
          %Alert{
            id: alert_id,
            effect: "Station closure due to a rafter of wild turkeys",
            informed_entities: [%{route_type: 0}, %{route_type: 1}]
          }
        ]
      end)

      pa_message = %PaMessage{
        id: 1,
        alert_id: alert_id,
        alert_modes: [1],
        alert_service_effect: "Station bypass due to flooding",
        start_datetime: pa_message_start_time,
        end_datetime: nil
      }

      Screenplay.PaMessages.Mock
      |> expect(:list_pa_messages_with_alerts, fn _ -> [pa_message] end)
      |> expect(:update_message, 1, fn msg, changes ->
        assert msg == pa_message
        assert changes == %{end_datetime: pa_message_start_time}
        {:ok, %{pa_message | end_datetime: pa_message_start_time}}
      end)

      {:ok, state} =
        PaMessageLifecycle.init(now_fn: now_fn, update_interval_ms: @update_interval_ms)

      PaMessageLifecycle.handle_info(:update, state)
    end

    test "does not update a pre-existing pa message for initial rollout", %{
      now_fn: now_fn
    } do
      alert_id = 2

      expect(Screenplay.Alerts.Cache.Mock, :alerts, fn ->
        [
          %Alert{
            id: alert_id,
            effect: "Station closure due to a rafter of wild turkeys",
            informed_entities: [%{route_type: 0}, %{route_type: 1}]
          }
        ]
      end)

      pa_message = %PaMessage{
        id: 1,
        alert_id: alert_id,
        # when rolling the feature out, alert_modes should be an empty list, and
        # alert_service_effect set to nil
        alert_modes: [],
        alert_service_effect: nil,
        start_datetime: DateTime.add(@now, -1, :hour),
        end_datetime: DateTime.add(@now, 1, :hour)
      }

      Screenplay.PaMessages.Mock
      |> expect(:list_pa_messages_with_alerts, fn _ -> [pa_message] end)
      |> expect(:update_message, 0, fn _, _ -> :ok end)

      {:ok, state} =
        PaMessageLifecycle.init(now_fn: now_fn, update_interval_ms: @update_interval_ms)

      PaMessageLifecycle.handle_info(:update, state)
    end
  end
end
