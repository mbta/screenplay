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
end
