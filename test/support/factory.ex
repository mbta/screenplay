defmodule Screenplay.Factory do
  @moduledoc false

  use ExMachina.Ecto, repo: Screenplay.Repo

  def pa_message_factory do
    %Screenplay.PaMessages.PaMessage{
      alert_id: nil,
      start_datetime: nil,
      end_datetime: nil,
      days_of_week: [],
      sign_ids: [],
      priority: 0,
      interval_in_minutes: 1,
      visual_text: "",
      audio_text: "",
      paused: false,
      saved: false,
      message_type: ""
    }
  end

  def suppressed_predictions_factory do
    %Screenplay.SuppressedPredictions.SuppressedPrediction{
      location_id: "",
      direction_id: 0,
      clear_at_end_of_day: false
    }
  end

  def emergency_takeover_factory do
    %Screenplay.EmergencyTakeoverTool.EmergencyTakeover{
      message: %{
        type: :custom,
        text: %{
          indoor: "Indoor test message",
          outdoor: "Outdoor test message"
        }
      },
      station_ids: ["place-aqucl", "place-mvbcl"],
      start_time: ~U[2023-01-01 12:00:00Z],
      end_time: ~U[2023-01-01 13:00:00Z],
      created_by: "test_user",
      edited_by: "test_user",
      cleared_at: nil,
      cleared_by: nil
    }
  end
end
