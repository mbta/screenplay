defmodule Screenplay.Alerts.Alert do
  @moduledoc false

  alias Screenplay.Alerts.Parser
  alias Screenplay.V3Api

  @subway_ids [
    "red",
    "orange",
    "blue",
    "green",
    "green-b",
    "green-c",
    "green-d",
    "green-e"
  ]

  @significant_alert_effects %{
    :subway => ["SHUTTLE", "STATION_CLOSURE", "SUSPENSION", "DELAY"],
    :bus => ["STOP_CLOSURE", "DETOUR", "STOP_MOVE", "SNOW_ROUTE", "SUSPENSION"]
  }

  defstruct id: nil,
            cause: nil,
            effect: nil,
            severity: nil,
            header: nil,
            informed_entities: nil,
            active_period: nil,
            lifecycle: nil,
            timeframe: nil,
            created_at: nil,
            updated_at: nil,
            url: nil,
            description: nil,
            affected_list: nil

  @type informed_entity :: %{
          stop: String.t() | nil,
          route: String.t() | nil,
          route_type: non_neg_integer() | nil
        }

  @type t :: %__MODULE__{
          id: String.t(),
          cause: String.t(),
          effect: String.t(),
          severity: integer,
          header: String.t(),
          informed_entities: list(informed_entity()),
          active_period: list(),
          lifecycle: String.t(),
          timeframe: String.t(),
          created_at: DateTime.t(),
          updated_at: DateTime.t(),
          description: String.t(),
          affected_list: list(atom())
        }

  def fetch(get_json_fn \\ &V3Api.get_json/2) do
    case get_json_fn.("alerts", %{
           "include" => "routes"
         }) do
      {:ok, result} ->
        {:ok, Parser.parse_result(result)}

      _ ->
        :error
    end
  end

  def to_full_map(alert) do
    aps = Enum.map(alert.active_period, &ap_to_map/1)

    %{
      id: alert.id,
      effect: alert.effect,
      severity: alert.severity,
      severity_string: interpret_severity(alert.severity),
      header: alert.header,
      informed_entities: alert.informed_entities,
      active_period: aps,
      lifecycle: alert.lifecycle,
      timeframe: alert.timeframe,
      created_at: DateTime.to_iso8601(alert.created_at),
      updated_at: DateTime.to_iso8601(alert.updated_at),
      affected_list: alert.affected_list
    }
  end

  def ap_to_map({nil, end_t}) do
    %{"start" => nil, "end" => DateTime.to_iso8601(end_t)}
  end

  def ap_to_map({start_t, nil}) do
    %{"start" => DateTime.to_iso8601(start_t), "end" => nil}
  end

  def ap_to_map({start_t, end_t}) do
    %{"start" => DateTime.to_iso8601(start_t), "end" => DateTime.to_iso8601(end_t)}
  end

  # information -> 1
  # up to 10 minutes -> 3
  # up to 15 minutes -> 4
  # up to 20 minutes -> 5
  # up to 25 minutes -> 6
  # up to 30 minutes -> 7
  # more than 30 minutes -> 8
  # more than an hour -> 9
  # High priority (deliver to T-Alert subscribers immediately) -> 10
  def interpret_severity(severity) do
    cond do
      severity < 3 -> "up to 10 minutes"
      severity > 9 -> "more than 60 minutes"
      severity >= 8 -> "more than #{30 * (severity - 7)} minutes"
      true -> "up to #{5 * (severity - 1)} minutes"
    end
  end

  # Check if alert is one of the chosen effect types + happening now
  @spec is_significant_alert?(t()) :: boolean()
  def is_significant_alert?(alert = %{affected_list: affected_list}) do
    mode = primary_affected_mode(affected_list)

    cond do
      is_nil(mode) -> false
      alert.effect === "DELAY" and mode === :subway -> alert.severity > 3
      true -> alert.effect in @significant_alert_effects[mode]
    end
  end

  defp primary_affected_mode(affected_list) do
    if Enum.any?(affected_list, fn mode -> mode in @subway_ids end) do
      :subway
    else
      case affected_list do
        ["bus" | _] -> :bus
        ["sl" <> _ | _] -> :bus
        _ -> nil
      end
    end
  end

  # Determine whether an alert is currently active
  @spec happening_now?(t(), DateTime.t() | nil) :: boolean()
  def happening_now?(%{active_period: aps}, now \\ DateTime.utc_now()) do
    Enum.any?(aps, &in_active_period(&1, now))
  end

  @spec in_active_period({DateTime.t() | nil, DateTime.t() | nil}, DateTime.t()) :: boolean()
  def in_active_period({nil, end_t}, t) do
    DateTime.compare(t, end_t) in [:lt, :eq]
  end

  def in_active_period({start_t, nil}, t) do
    DateTime.compare(t, start_t) in [:gt, :eq]
  end

  def in_active_period({start_t, end_t}, t) do
    DateTime.compare(t, start_t) in [:gt, :eq] && DateTime.compare(t, end_t) in [:lt, :eq]
  end
end
