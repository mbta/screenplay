defmodule Screenplay.EmergencyTakeoverTool.EmergencyTakeover do
  @moduledoc """
  Represents an emergency takeover alert persisted in Postgres.
  """
  alias __MODULE__.MessageType
  alias Screenplay.Util

  use Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder, except: [:__meta__]}

  @type canned_message :: %{
          type: :canned,
          id: non_neg_integer()
        }

  @type custom_message :: %{
          type: :custom,
          text: %{
            indoor: String.t(),
            outdoor: String.t()
          }
        }

  @type message :: canned_message() | custom_message()

  @type station_id :: String.t()

  @type schedule :: %{
          start_time: DateTime.t(),
          end_time: DateTime.t() | nil
        }

  defmodule MessageType do
    use Ecto.Type
    @impl true
    def type, do: :map

    @impl true
    def cast(%{type: :canned, id: id}) when is_integer(id) and id >= 0 do
      {:ok, %{type: :canned, id: id}}
    end

    def cast(%{"type" => "canned", "id" => id}) when is_integer(id) and id >= 0 do
      {:ok, %{type: :canned, id: id}}
    end

    def cast(%{type: :custom, text: %{indoor: indoor, outdoor: outdoor}})
        when is_binary(indoor) and is_binary(outdoor) do
      {:ok, %{type: :custom, text: %{indoor: indoor, outdoor: outdoor}}}
    end

    def cast(%{"type" => "custom", "text" => %{"indoor" => indoor, "outdoor" => outdoor}})
        when is_binary(indoor) and is_binary(outdoor) do
      {:ok, %{type: :custom, text: %{indoor: indoor, outdoor: outdoor}}}
    end

    def cast(_), do: :error

    @impl true
    def dump(message), do: {:ok, message}

    @impl true
    def load(message), do: cast(message)
  end

  @type t() :: %__MODULE__{
          id: integer() | nil,
          message: message(),
          station_ids: [station_id()],
          start_time: DateTime.t(),
          end_time: DateTime.t() | nil,
          created_by: String.t(),
          edited_by: String.t() | nil,
          cleared_by: String.t() | nil,
          cleared_at: DateTime.t() | nil,
          inserted_at: DateTime.t() | nil,
          updated_at: DateTime.t() | nil
        }

  schema "emergency_takeover" do
    field :message, MessageType
    field :station_ids, {:array, :string}
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
      :station_ids,
      :start_time,
      :end_time,
      :created_by,
      :edited_by,
      :cleared_by,
      :cleared_at
    ])
    |> validate_required([
      :start_time,
      :station_ids,
      :message,
      :created_by
    ])
    |> validate_length(:station_ids, min: 1)
  end

  @spec new(message() | map(), [station_id()], schedule(), String.t()) :: __MODULE__.t()
  def new(message, station_ids, schedule, user) do
    {:ok, normalized_message} = MessageType.cast(message)

    %__MODULE__{
      message: normalized_message,
      station_ids: station_ids,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      created_by: Util.trim_username(user),
      edited_by: Util.trim_username(user),
      cleared_at: nil,
      cleared_by: nil
    }
  end
end
