defmodule Screenplay.Alerts.Alert do
  @moduledoc """
  Represents a single Outfront Takeover Alert.
  """

  alias Screenplay.Alerts.State
  alias Screenplay.Util

  @enforce_keys [
    :id,
    :message,
    :stations,
    :schedule,
    :created_by,
    :edited_by,
    :cleared_at,
    :cleared_by
  ]
  defstruct @enforce_keys

  @type id :: String.t()

  @type canned_message :: %{
          type: :canned,
          id: non_neg_integer()
        }

  @type custom_message :: %{
          type: :custom,
          text: String.t()
        }

  @type station :: String.t()

  @type schedule :: %{
          start: DateTime.t(),
          end: DateTime.t() | nil
        }

  @type user :: String.t()

  @type update_map :: %{
          optional(:message) => canned_message() | custom_message(),
          optional(:stations) => list(station),
          optional(:schedule) => schedule()
        }

  @type t :: %__MODULE__{
          id: id(),
          message: canned_message() | custom_message(),
          stations: list(station()),
          schedule: schedule(),
          created_by: user(),
          edited_by: user(),
          cleared_at: DateTime.t() | nil,
          cleared_by: user() | nil
        }

  @spec random_id :: id()
  def random_id do
    length = 16
    length |> :crypto.strong_rand_bytes() |> Base.url_encode64()
  end

  @spec new(canned_message() | custom_message(), list(station()), schedule(), user()) :: t()
  def new(message, stations, schedule, user) do
    %__MODULE__{
      id: State.get_unused_alert_id(),
      message: message,
      stations: stations,
      schedule: schedule,
      created_by: Util.trim_username(user),
      edited_by: Util.trim_username(user),
      cleared_at: nil,
      cleared_by: nil
    }
  end

  @spec update(t(), update_map(), user()) :: t()
  def update(alert, changes_map, user) do
    # Drop nil values from changes_map
    changes_map = changes_map |> Enum.filter(fn {_, v} -> v != nil end) |> Enum.into(%{})

    merged = Map.merge(alert, changes_map)
    %{merged | edited_by: Util.trim_username(user)}
  end

  @spec clear(t(), user()) :: t()
  def clear(alert, user) do
    %{alert | cleared_by: user, cleared_at: DateTime.utc_now()}
  end

  @spec to_json(t()) :: map()
  def to_json(%__MODULE__{
        id: id,
        message: message,
        stations: stations,
        schedule: schedule,
        created_by: created_by,
        edited_by: edited_by,
        cleared_at: cleared_at,
        cleared_by: cleared_by
      }) do
    %{
      "id" => id,
      "message" => message_to_json(message),
      "stations" => stations_to_json(stations),
      "schedule" => schedule_to_json(schedule),
      "created_by" => Util.trim_username(created_by),
      "edited_by" => Util.trim_username(edited_by),
      "cleared_at" => serialize_datetime(cleared_at),
      "cleared_by" => Util.trim_username(cleared_by)
    }
  end

  @spec from_json(map()) :: t()
  def from_json(%{
        "id" => id,
        "message" => message_json,
        "stations" => stations_json,
        "schedule" => schedule_json,
        "created_by" => created_by,
        "edited_by" => edited_by,
        "cleared_at" => cleared_at,
        "cleared_by" => cleared_by
      }) do
    %__MODULE__{
      id: id,
      message: message_from_json(message_json),
      stations: stations_from_json(stations_json),
      schedule: schedule_from_json(schedule_json),
      created_by: Util.trim_username(created_by),
      edited_by: Util.trim_username(edited_by),
      cleared_at: parse_datetime(cleared_at),
      cleared_by: Util.trim_username(cleared_by)
    }
  end

  def from_json(%{
        "id" => id,
        "message" => message_json,
        "stations" => stations_json,
        "schedule" => schedule_json,
        "created_by" => created_by,
        "edited_by" => edited_by
      }) do
    %__MODULE__{
      id: id,
      message: message_from_json(message_json),
      stations: stations_from_json(stations_json),
      schedule: schedule_from_json(schedule_json),
      created_by: Util.trim_username(created_by),
      edited_by: Util.trim_username(edited_by),
      cleared_at: nil,
      cleared_by: nil
    }
  end

  defp message_to_json(%{type: :canned, id: id}) do
    %{"type" => "canned", "id" => id}
  end

  defp message_to_json(%{type: :custom, text: text}) do
    %{"type" => "custom", "text" => text}
  end

  def message_from_json(%{"type" => "canned", "id" => id}) do
    %{type: :canned, id: id}
  end

  def message_from_json(%{"type" => "custom", "text" => text}) do
    %{type: :custom, text: text}
  end

  defp station_to_json(station), do: station

  defp station_from_json(station), do: station

  defp stations_to_json(stations) do
    Enum.map(stations, &station_to_json/1)
  end

  defp stations_from_json(stations_json) do
    Enum.map(stations_json, &station_from_json/1)
  end

  defp schedule_to_json(%{start: start_dt, end: end_dt}) do
    %{"start" => serialize_datetime(start_dt), "end" => serialize_datetime(end_dt)}
  end

  defp schedule_from_json(%{"start" => start_json, "end" => end_json}) do
    %{start: parse_datetime(start_json), end: parse_datetime(end_json)}
  end

  defp serialize_datetime(nil), do: nil
  defp serialize_datetime(dt = %DateTime{}), do: DateTime.to_iso8601(dt)

  defp parse_datetime(nil), do: nil

  defp parse_datetime(json) do
    {:ok, dt, _offset} = DateTime.from_iso8601(json)
    dt
  end
end
