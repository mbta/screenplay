defmodule Screenplay.EmergencyTakeover do
  @moduledoc """
  Represents an emergency takeover alert persisted in Postgres.
  """
  alias Screenplay.Util

  use Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder, except: [:__meta__]}

  @type t() :: %__MODULE__{
          id: integer(),
          message: map(),
          stations: [String.t()],
          start_time: DateTime.t(),
          end_time: DateTime.t() | nil,
          created_by: String.t(),
          edited_by: String.t() | nil,
          cleared_by: String.t() | nil,
          cleared_at: DateTime.t() | nil,
          inserted_at: DateTime.t(),
          updated_at: DateTime.t()
        }

  schema "emergency_takeover" do
    field :message, :map
    field :stations, {:array, :string}
    field :start_time, :utc_datetime_usec
    field :end_time, :utc_datetime_usec
    field :created_by, :string
    field :edited_by, :string
    field :cleared_by, :string
    field :cleared_at, :utc_datetime_usec

    timestamps(type: :utc_datetime_usec)
  end

  def changeset(takeover, attrs \\ %{}) do
    takeover
    |> cast(attrs, [
      :message,
      :stations,
      :start_time,
      :end_time,
      :created_by,
      :edited_by,
      :cleared_by,
      :cleared_at
    ])
    |> validate_required([
      :start_time,
      :stations,
      :message,
      :created_by
    ])
    |> validate_length(:stations, min: 1)

    # TODO: Add more validation for message content once the structure is finalized
  end

  # @spec new(
  #         message(),
  #         list(station()),
  #         schedule(),
  #         user()
  #       ) :: t()
  def new(message, stations, schedule, user) do
    IO.inspect(schedule, label: "Schedule in EmergencyTakeover.new/4")

    %{
      message: message,
      stations: stations,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      created_by: Util.trim_username(user),
      edited_by: Util.trim_username(user),
      cleared_at: nil,
      cleared_by: nil
    }
  end
end
