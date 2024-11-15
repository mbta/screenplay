defmodule Screenplay.PaMessages.PaMessage do
  @moduledoc """
  Represents a PA Message that will be retrieved by RTS to play audio in stations.
  """
  use Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder, except: [:__meta__]}

  @type t() :: %__MODULE__{
          alert_id: String.t() | nil,
          start_datetime: DateTime.t(),
          end_datetime: DateTime.t() | nil,
          days_of_week: [integer()] | nil,
          sign_ids: [String.t()],
          priority: integer(),
          interval_in_minutes: integer() | nil,
          visual_text: String.t(),
          audio_text: String.t(),
          paused: boolean() | nil,
          saved: boolean() | nil,
          message_type: String.t(),
          inserted_at: DateTime.t(),
          updated_at: DateTime.t(),
          template_id: non_neg_integer() | nil
        }

  schema "pa_message" do
    field(:alert_id, :string)
    field(:start_datetime, :utc_datetime)
    field(:end_datetime, :utc_datetime)
    field(:days_of_week, {:array, :integer})
    field(:sign_ids, {:array, :string})
    field(:priority, :integer)
    field(:interval_in_minutes, :integer)
    field(:visual_text, :string)
    field(:audio_text, :string)
    field(:paused, :boolean)
    field(:saved, :boolean)
    field(:message_type, :string)
    field(:template_id, :integer)

    timestamps(type: :utc_datetime)
  end

  def changeset(message, attrs \\ %{}) do
    message
    |> cast(attrs, [
      :alert_id,
      :start_datetime,
      :end_datetime,
      :days_of_week,
      :sign_ids,
      :priority,
      :interval_in_minutes,
      :visual_text,
      :audio_text,
      :paused,
      :saved,
      :template_id
    ])
    |> validate_required([
      :start_datetime,
      :days_of_week,
      :sign_ids,
      :priority,
      :interval_in_minutes,
      :visual_text,
      :audio_text
    ])
    |> validate_length(:sign_ids, min: 1)
    |> validate_subset(:days_of_week, 1..7)
    |> validate_number(:interval_in_minutes, greater_than: 0)
    |> validate_inclusion(:priority, 1..4)
    |> validate_start_date()
    |> validate_end_date()
    |> maybe_unpause()
  end

  defp validate_start_date(changeset) do
    start_datetime = get_field(changeset, :start_datetime)
    end_datetime = get_field(changeset, :end_datetime)

    if not is_nil(end_datetime) and DateTime.after?(start_datetime, end_datetime) do
      add_error(changeset, :start_datetime, "start time must be before end time")
    else
      changeset
    end
  end

  defp validate_end_date(changeset) do
    end_datetime = get_field(changeset, :end_datetime)
    alert_id = get_field(changeset, :alert_id)

    if is_nil(end_datetime) and is_nil(alert_id) do
      add_error(changeset, :end_datetime, "cannot have an end time if associated with an alert")
    else
      changeset
    end
  end

  defp maybe_unpause(changeset) do
    now = DateTime.utc_now()

    currently_active? =
      in_active_period?(
        now,
        changeset.data.start_datetime,
        changeset.data.end_datetime
      )

    will_be_active? =
      in_active_period?(
        now,
        get_field(changeset, :start_datetime) || changeset.data.start_datetime,
        get_field(changeset, :end_datetime) || changeset.data.end_datetime
      )

    if currently_active? != will_be_active? do
      put_change(changeset, :paused, false)
    else
      changeset
    end
  end

  defp in_active_period?(now, start_datetime, end_datetime) do
    not is_nil(start_datetime) and DateTime.after?(now, start_datetime) and
      (end_datetime == nil or
         DateTime.before?(now, end_datetime))
  end
end
