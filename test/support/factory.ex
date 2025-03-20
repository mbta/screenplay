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
end
