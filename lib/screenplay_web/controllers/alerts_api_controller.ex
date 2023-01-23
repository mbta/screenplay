defmodule ScreenplayWeb.AlertsApiController do
  use ScreenplayWeb, :controller

  alias Screenplay.Alerts.Alert
  alias Screenplay.Alerts.ScreensByAlert
  alias Screenplay.Util

  def index(conn, _params) do
    # We get all alerts from the API; unfortunately can't filter it down by effect (doesn't exist) or datetime (buggy)
    {:ok, alerts} = Alert.fetch()

    # Filter down by relevance to Screenplay
    relevant_alerts =
      Enum.filter(alerts, fn alert ->
        Alert.is_significant_alert?(alert) and Alert.happening_now?(alert)
      end)

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
end
