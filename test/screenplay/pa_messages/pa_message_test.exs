defmodule Screenplay.PaMessages.PaMessageTest do
  use ScreenplayWeb.DataCase

  import Screenplay.Factory

  alias Screenplay.PaMessages.PaMessage

  describe "get_all_messages/0" do
    test "returns all messages with most recent first" do
      insert(:pa_message, %{
        id: 1,
        start_time: ~U[2024-05-01T01:00:00Z],
        end_time: ~U[2024-05-01T13:00:00Z],
        days_of_week: [3],
        inserted_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:pa_message, %{
        id: 2,
        start_time: ~U[2024-05-02T12:00:00Z],
        end_time: ~U[2024-05-02T12:00:00Z],
        days_of_week: [3],
        inserted_at: ~U[2024-05-02T12:00:00Z]
      })

      insert(:pa_message, %{
        id: 3,
        start_time: ~U[2024-05-02T12:00:00Z],
        end_time: ~U[2024-05-02T12:00:00Z],
        days_of_week: [3],
        inserted_at: ~U[2024-05-03T12:00:00Z]
      })

      assert [%PaMessage{id: 3}, %PaMessage{id: 2}, %PaMessage{id: 1}] =
               PaMessage.get_all_messages()
    end
  end
end
