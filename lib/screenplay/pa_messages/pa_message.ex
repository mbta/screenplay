defmodule Screenplay.PaMessages.PaMessage do
  @moduledoc """
  Represents a PA Message that will be retrieved by RTS to play audio in stations.
  """
  use Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder, except: [:__meta__]}

  @type t() :: %__MODULE__{
          alert_id: String.t() | nil,
          start_time: DateTime.t(),
          end_time: DateTime.t() | nil,
          days_of_week: [integer()] | nil,
          sign_ids: [String.t()],
          priority: integer(),
          interval_in_minutes: integer() | nil,
          visual_text: String.t(),
          audio_text: String.t(),
          paused: boolean() | nil,
          saved: boolean() | nil,
          message_type: String.t() | nil,
          inserted_at: DateTime.t(),
          updated_at: DateTime.t()
        }

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

  def changeset(message, attrs \\ %{}) do
    message
    |> cast(attrs, [
      :alert_id,
      :start_time,
      :end_time,
      :days_of_week,
      :sign_ids,
      :priority,
      :interval_in_minutes,
      :visual_text,
      :audio_text,
      :paused,
      :saved
    ])
    |> validate_required([
      :start_time,
      :days_of_week,
      :sign_ids,
      :priority,
      :interval_in_minutes,
      :visual_text,
      :audio_text
    ])
    |> validate_length(:sign_ids, min: 1)
    |> validate_subset(:days_of_week, 1..7)
    |> validate_end_date()
  end

  defp validate_end_date(changeset) do
    end_time = get_field(changeset, :end_time)
    alert_id = get_field(changeset, :alert_id)

    if is_nil(end_time) and is_nil(alert_id) do
      add_error(changeset, :end_time, "cannot have an end time if associated with an alert")
    else
      changeset
    end
  end
end
