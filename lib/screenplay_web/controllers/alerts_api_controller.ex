defmodule ScreenplayWeb.AlertsApiController do
  use ScreenplayWeb, :controller

  alias Screenplay.Alerts.Alert
  alias Screenplay.Alerts.ScreensByAlert
  alias Screenplay.Util

  @subway_ids [
    "red",
    "orange",
    "blue",
    "green",
    "green-b",
    "green-c",
    "green-d",
    "green-e",
  ]

  @significant_alert_effects %{
    :subway => ["SHUTTLE", "STATION_CLOSURE", "SUSPENSION", "DELAY"],
    :bus => ["STOP_CLOSURE", "DETOUR", "STOP_MOVE", "SNOW_ROUTE", "SUSPENSION"]
  }

  def index(conn, _params) do
    # We get all alerts from the API; unfortunately can't filter it down by effect (doesn't exist) or datetime (buggy)
    {:ok, alerts} = Alert.fetch()

    # Filter down by relevance to Screenplay
    relevant_alerts = Enum.filter(alerts, fn alert -> is_significant_alert?(alert) and Util.happening_now?(alert) end)

    # Makes it a list of ids only
    alert_ids = Enum.map(relevant_alerts, & &1.id)

    # Then we use those ids to read a from the screens endpoint to get screen counts.
    # But why get by ids instead of just reading everything in that field of the cache?
    screens_by_alerts =
      case ScreensByAlert.get_screens_by_alert(alert_ids) do
        {:ok, screens_by_alerts} -> screens_by_alerts
        _ -> Map.new(alert_ids, fn alert_id -> {alert_id, []} end)
      end

    json(conn, %{
      alerts: Enum.map(relevant_alerts, &Alert.to_full_map/1),
      screens_by_alert: screens_by_alerts
    })
  end

  @spec is_significant_alert?(Alert) :: boolean
  def is_significant_alert?(%{affected_list: affected_list} = alert) do
    mode = primary_affected_mode(affected_list)

    cond do
      is_nil(mode) -> false
      alert.effect === "DELAY" and mode === :subway -> alert.severity > 3
      true -> alert.effect in @significant_alert_effects[mode]
    end
  end

  def primary_affected_mode(affected_list) do
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
end
