defmodule ScreenplayWeb.AlertsApiController do
  use ScreenplayWeb, :controller

  alias Screenplay.Alerts.Alert
  alias Screenplay.Alerts.Cache, as: AlertsCache
  alias Screenplay.Alerts.ScreensByAlert

  def index(conn, _params) do
    alerts = AlertsCache.alerts()

    # Filter down by relevance to Screenplay
    relevant_alerts = Enum.filter(alerts, &relevant_alert?/1)

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
      all_alert_ids: Enum.map(alerts, & &1.id),
      alerts: Enum.map(relevant_alerts, &Alert.to_full_map/1),
      screens_by_alert: screens_by_alerts
    })
  end

  defp relevant_alert?(alert) do
    Alert.significant?(alert) and Alert.happening_now?(alert)
  end

  def non_access_alerts(conn, _params) do
    non_access_alerts =
      AlertsCache.alerts()
      |> Enum.reject(&Alert.access_alert?/1)
      |> Enum.map(&Alert.to_full_map/1)

    json(conn, %{alerts: non_access_alerts})
  end
end
