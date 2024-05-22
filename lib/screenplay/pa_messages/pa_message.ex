defmodule Screenplay.PaMessages.PaMessage do
  @moduledoc """
  Represents a PA Message that will be retrieved by RTS to play audio in stations.
  """

  import Ecto.Query

  alias Screenplay.Alerts.Cache, as: AlertsCache
  alias Screenplay.{Repo, Util}

  use Ecto.Schema

  @derive {Jason.Encoder, except: [:__meta__]}

  schema "pa_message" do
    field(:alert_id, :string)
    field(:start_time, :utc_datetime)
    field(:end_time, :utc_datetime)
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

  def get_active_messages(now \\ DateTime.utc_now()) do
    current_service_day_of_week = Util.get_current_service_day(now)

    alert_ids = AlertsCache.alert_ids()

    Repo.all(
      from m in __MODULE__,
        where:
          ^current_service_day_of_week in m.days_of_week and
            m.start_time <= ^now and
            ((is_nil(m.end_time) and m.alert_id in ^alert_ids) or m.end_time >= ^now)
    )
  end
end
