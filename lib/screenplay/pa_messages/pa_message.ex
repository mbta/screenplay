defmodule Screenplay.PaMessages.PaMessage do
  @moduledoc """
  Represents a PA Message that will be retrieved by RTS to play audio in stations.
  """

  import Ecto.Query

  alias Screenplay.Alerts.Alert
  alias Screenplay.Alerts.Cache, as: AlertsCache
  alias Screenplay.Repo

  use Ecto.Schema

  @derive {Jason.Encoder, except: [:__meta__]}

  schema "pa_message" do
    field(:alert_id, :string)
    field(:start_time_utc, :time)
    field(:end_time_utc, :time)
    field(:days_of_week, {:array, :integer})
    field(:sign_ids, {:array, :string})
    field(:priority, :integer)
    field(:interval_in_minutes, :integer)
    field(:visual_text, :string)
    field(:audio_text, :string)
    field(:paused, :boolean)
    field(:saved, :boolean)
    field(:message_type, :string)

    timestamps(type: :utc_datetime)
  end

  def get_active_messages(now_utc \\ DateTime.utc_now()) do
    now_adjusted =
      now_utc
      |> DateTime.shift_zone!("America/New_York")
      |> DateTime.add(-150, :minute)
      |> DateTime.shift_zone!("Etc/UTC")

    day_of_week = Date.day_of_week(now_adjusted)

    current_time = DateTime.to_time(now_adjusted)

    {custom_messages, alert_messages} =
      Repo.all(
        from m in __MODULE__,
          where:
            not is_nil(m.alert_id) or
              (^day_of_week in m.days_of_week and
                 (m.start_time_utc <= ^current_time and m.end_time_utc >= ^current_time))
      )
      |> Enum.split_with(&is_nil(&1.alert_id))

    active_alerts = AlertsCache.alerts()

    alert_messages =
      Enum.filter(alert_messages, fn %{alert_id: alert_id} ->
        alert = Enum.find(active_alerts, &(&1.id == alert_id))
        not is_nil(alert) and Alert.happening_now?(alert, now_utc)
      end)

    custom_messages ++ alert_messages
  end
end
