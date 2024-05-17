defmodule Screenplay.PaMessages.PaMessageTest do
  use ScreenplayWeb.DataCase

  import Screenplay.Factory

  alias Screenplay.PaMessages.PaMessage
  alias Screenplay.Util

  defp alert_json(id, start_dt, end_dt) do
    %{
      "id" => id,
      "attributes" => %{
        "active_period" => [
          %{"start" => DateTime.to_iso8601(start_dt), "end" => DateTime.to_iso8601(end_dt)}
        ],
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

  describe "get_active_messages/0" do
    test "returns messages linked to an existing alert" do
      now = ~U[2024-05-01T05:00:00Z]
      now_service_day = Util.get_current_service_day(now)

      get_json_fn = fn "alerts", %{"include" => "routes"} ->
        {:ok,
         %{
           "data" => [
             alert_json("1", ~U[2024-05-01T04:00:00Z], ~U[2024-05-01T06:00:00Z]),
             alert_json("2", ~U[2024-04-01T04:00:00Z], ~U[2024-04-01T06:00:00Z])
           ],
           "included" => []
         }}
      end

      {:ok, fetcher} = start_supervised({Screenplay.Alerts.Cache, get_json_fn: get_json_fn})
      send(fetcher, :fetch)

      insert(:pa_message, %{
        alert_id: "1",
        start_time: ~U[2024-05-01T01:00:00Z],
        days_of_week: [now_service_day]
      })

      insert(:pa_message, %{
        alert_id: "2",
        start_time: ~U[2024-05-01T04:00:00Z],
        days_of_week: [now_service_day]
      })

      assert [%PaMessage{alert_id: "1"}, %PaMessage{alert_id: "2"}] =
               PaMessage.get_active_messages(now)
    end

    test "returns custom messages if now is between start and end schedule" do
      now = ~U[2024-05-01T12:00:00Z]
      now_service_day = Util.get_current_service_day(now)

      start_supervised(Screenplay.Alerts.Cache)

      insert(:pa_message, %{
        id: 1,
        start_time: ~U[2024-05-01T01:00:00Z],
        end_time: ~U[2024-05-01T13:00:00Z],
        days_of_week: [now_service_day]
      })

      insert(:pa_message, %{
        id: 2,
        start_time: ~U[2024-05-02T12:00:00Z],
        end_time: ~U[2024-05-02T12:00:00Z],
        days_of_week: [now_service_day]
      })

      assert [%PaMessage{id: 1}] = PaMessage.get_active_messages(now)
    end
  end

  test "returns messages linked to an existing alert using custom schedule" do
    now = ~U[2024-05-01T12:00:00Z]
    now_service_day = Util.get_current_service_day(now)

    get_json_fn = fn "alerts", %{"include" => "routes"} ->
      {:ok,
       %{
         "data" => [
           alert_json("1", ~U[2024-05-01T04:00:00Z], ~U[2024-05-01T06:00:00Z])
         ],
         "included" => []
       }}
    end

    {:ok, fetcher} = start_supervised({Screenplay.Alerts.Cache, get_json_fn: get_json_fn})
    send(fetcher, :fetch)

    insert(:pa_message, %{
      id: 1,
      alert_id: "1",
      start_time: ~U[2024-05-01T04:00:00Z],
      end_time: ~U[2024-05-02T04:00:00Z],
      days_of_week: [now_service_day]
    })

    insert(:pa_message, %{
      id: 2,
      alert_id: "2",
      start_time: ~U[2024-05-02T04:00:00Z],
      end_time: ~U[2024-05-02T05:00:00Z],
      days_of_week: [now_service_day]
    })

    assert [%PaMessage{id: 1}] = PaMessage.get_active_messages(now)
  end
end
