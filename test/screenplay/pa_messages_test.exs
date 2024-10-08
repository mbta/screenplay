defmodule Screenplay.PaMessagesTest do
  use ScreenplayWeb.DataCase

  import Screenplay.Factory

  alias Screenplay.PaMessages
  alias Screenplay.PaMessages.PaMessage

  describe "get_all_messages/0" do
    test "returns all messages with most recent first" do
      insert(:pa_message, %{
        id: 1,
        start_datetime: ~U[2024-05-01T01:00:00Z],
        end_datetime: ~U[2024-05-01T13:00:00Z],
        days_of_week: [3],
        inserted_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:pa_message, %{
        id: 2,
        start_datetime: ~U[2024-05-02T12:00:00Z],
        end_datetime: ~U[2024-05-02T12:00:00Z],
        days_of_week: [3],
        inserted_at: ~U[2024-05-02T12:00:00Z]
      })

      insert(:pa_message, %{
        id: 3,
        start_datetime: ~U[2024-05-02T12:00:00Z],
        end_datetime: ~U[2024-05-02T12:00:00Z],
        days_of_week: [3],
        inserted_at: ~U[2024-05-03T12:00:00Z]
      })

      assert [%PaMessage{id: 3}, %PaMessage{id: 2}, %PaMessage{id: 1}] =
               PaMessages.get_all_messages()
    end
  end

  describe "get_active_messages/0" do
    test "returns messages linked to an existing alert" do
      now = ~U[2024-05-01T05:00:00Z]

      get_json_fn = fn "/alerts", %{"include" => "routes"} ->
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
        start_datetime: ~U[2024-05-01T01:00:00Z],
        days_of_week: [2]
      })

      insert(:pa_message, %{
        alert_id: "2",
        start_datetime: ~U[2024-05-01T04:00:00Z],
        days_of_week: [2]
      })

      assert [%PaMessage{alert_id: "1"}, %PaMessage{alert_id: "2"}] =
               PaMessages.get_active_messages(now)
    end

    test "returns custom messages if now is between start and end schedule" do
      now = ~U[2024-05-01T12:00:00Z]

      start_supervised!(Screenplay.Alerts.Cache)

      insert(:pa_message, %{
        id: 1,
        start_datetime: ~U[2024-05-01T01:00:00Z],
        end_datetime: ~U[2024-05-01T13:00:00Z],
        days_of_week: [3]
      })

      insert(:pa_message, %{
        id: 2,
        start_datetime: ~U[2024-05-02T12:00:00Z],
        end_datetime: ~U[2024-05-02T12:00:00Z],
        days_of_week: [3]
      })

      assert [%PaMessage{id: 1}] = PaMessages.get_active_messages(now)
    end
  end

  test "returns messages linked to an existing alert using custom schedule" do
    now = ~U[2024-05-01T12:00:00Z]

    get_json_fn = fn "/alerts", %{"include" => "routes"} ->
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
      start_datetime: ~U[2024-05-01T04:00:00Z],
      end_datetime: ~U[2024-05-02T04:00:00Z],
      days_of_week: [3]
    })

    insert(:pa_message, %{
      id: 2,
      alert_id: "2",
      start_datetime: ~U[2024-05-02T04:00:00Z],
      end_datetime: ~U[2024-05-02T05:00:00Z],
      days_of_week: [3]
    })

    assert [%PaMessage{id: 1}] = PaMessages.get_active_messages(now)
  end

  describe "create_message/1" do
    test "creates new message" do
      now = ~U[2024-08-07T12:12:12Z]

      new_message = %{
        start_datetime: now,
        end_datetime: DateTime.add(now, 60),
        days_of_week: [1, 2, 3],
        sign_ids: ["test_sign"],
        priority: 1,
        interval_in_minutes: 4,
        visual_text: "Visual Text",
        audio_text: "Audio Text"
      }

      assert {:ok, actual} = PaMessages.create_message(new_message)
      assert actual.start_datetime == new_message.start_datetime
      assert actual.end_datetime == new_message.end_datetime
      assert actual.days_of_week == new_message.days_of_week
      assert actual.sign_ids == new_message.sign_ids
      assert actual.priority == new_message.priority
      assert actual.interval_in_minutes == new_message.interval_in_minutes
      assert actual.visual_text == new_message.visual_text
      assert actual.audio_text == new_message.audio_text
    end

    test "does not create invalid message" do
      now = DateTime.utc_now()

      new_message = %{
        start_datetime: now,
        end_datetime: nil,
        days_of_week: [22],
        sign_ids: [],
        priority: 1,
        visual_text: "",
        audio_text: "Audio Text"
      }

      assert {:error, %Ecto.Changeset{} = changeset} = PaMessages.create_message(new_message)
      assert {_, _} = changeset.errors[:days_of_week]
      assert {_, _} = changeset.errors[:sign_ids]
      assert {_, _} = changeset.errors[:interval_in_minutes]
      assert {_, _} = changeset.errors[:visual_text]
      assert {_, _} = changeset.errors[:end_datetime]

      new_message = %{
        start_datetime: DateTime.add(now, 61),
        end_datetime: DateTime.add(now, 60),
        days_of_week: [1],
        sign_ids: ["test_sign"],
        priority: 1,
        visual_text: "Visual Text",
        audio_text: "Audio Text"
      }

      assert {:error, %Ecto.Changeset{} = changeset} = PaMessages.create_message(new_message)
      assert {_, _} = changeset.errors[:start_datetime]
    end
  end

  describe "update_message/2" do
    setup do
      pa_message =
        insert(:pa_message, %{
          start_datetime: DateTime.utc_now(),
          end_datetime: DateTime.utc_now() |> DateTime.add(1, :day),
          visual_text: "Foobar",
          audio_text: "Foo bar",
          sign_ids: ["sign-1", "sign-2"]
        })

      [pa_message: pa_message]
    end

    test "updates an existing message", %{pa_message: pa_message} do
      id = pa_message.id

      assert {:ok, %PaMessage{id: ^id, visual_text: "Hello, World!"}} =
               PaMessages.update_message(pa_message, %{
                 visual_text: "Hello, World!"
               })
    end

    test "returns an error changeset tuple if passed invalid update data", %{
      pa_message: pa_message
    } do
      assert {:error, %Ecto.Changeset{}} = PaMessages.update_message(pa_message, %{sign_ids: []})
    end
  end

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
end
