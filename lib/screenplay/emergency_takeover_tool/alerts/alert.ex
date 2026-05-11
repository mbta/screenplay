defmodule Screenplay.EmergencyTakeoverTool.Alerts.Alert do
  @moduledoc """
  Represents a single Emergency Takeover Alert.
  """

  alias Screenplay.EmergencyTakeoverTool.Alerts.State
  alias Screenplay.EmergencyTakeoverTool.CannedMessages
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
          text: %{
            indoor: String.t(),
            outdoor: String.t()
          }
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

  @spec new(
          canned_message() | custom_message(),
          list(station()),
          schedule(),
          user()
        ) :: t()
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

  defp message_to_json(%{type: :custom, text: %{indoor: indoor, outdoor: outdoor}}) do
    %{"type" => "custom", "text" => %{"indoor" => indoor, "outdoor" => outdoor}}
  end

  def message_from_json(%{"type" => "canned", "id" => id}) do
    %{type: :canned, id: id}
  end

  def message_from_json(%{
        "type" => "custom",
        "text" => %{"indoor" => indoor, "outdoor" => outdoor}
      }) do
    %{type: :custom, text: %{indoor: indoor, outdoor: outdoor}}
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

  def indoor_text(%{type: :canned, id: message_id}) do
    case CannedMessages.get(message_id) do
      %{text: %{indoor: text}} -> text
      nil -> nil
    end
  end

  def indoor_text(%{type: :custom, text: %{indoor: text}}) do
    text
  end

  def outdoor_text(%{type: :canned, id: message_id}) do
    case CannedMessages.get(message_id) do
      %{text: %{outdoor: text}} -> text
      nil -> nil
    end
  end

  def outdoor_text(%{type: :custom, text: %{outdoor: text}}) do
    text
  end

  def image_location_for_message(message, alert_id, screen_type, messaging_location) do
    where = messaging_location_to_text(messaging_location)
    orientation = screen_orientation(screen_type)

    case message do
      %{type: :canned, id: id} ->
        case CannedMessages.get(id) do
          %{images: images} -> get_canned_image_path(images, where, orientation)
          _ -> nil
        end

      %{type: :custom} ->
        build_image_location(alert_id, screen_type, messaging_location)

      _ ->
        nil
    end
  end

  # TODO: Actually link to S3 for canned images
  defp get_canned_image_path(images, where, orientation) when is_map(images) do
    image_path =
      case get_in(images, [where, orientation]) do
        path when is_binary(path) -> path
        nil -> get_in(images, [where, orientation])
      end
  end

  def build_image_location(alert_id, screen_type, messaging_location) do
    image_key = determine_image_key(screen_type, messaging_location)
    "emergency-takeovers/#{alert_id}/#{image_key}.png"
  end

  @spec determine_image_key(Screen.app_id(), EmergencyMessagingLocation.t()) :: String.t()
  defp determine_image_key(screen_type, messaging_location) do
    key_prefix = messaging_location_to_text(messaging_location) |> Atom.to_string()
    key_suffix = screen_orientation(screen_type) |> Atom.to_string()

    "#{key_prefix}_#{key_suffix}"
  end

  defp messaging_location_to_text(:inside), do: :indoor
  defp messaging_location_to_text(:outside), do: :outdoor

  defp screen_orientation(screen_type) when screen_type in [:busway_v2, :pre_fare_v2],
    do: :portrait

  defp screen_orientation(screen_type) when screen_type in [:dup_v2], do: :landscape
end
