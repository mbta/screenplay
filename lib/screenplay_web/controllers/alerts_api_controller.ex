defmodule ScreenplayWeb.AlertsApiController do
  use ScreenplayWeb, :controller

  alias Screenplay.Alerts.Alert
  alias Screenplay.Alerts.ScreensByAlert

  def index(conn, _params) do
    {:ok, alerts} = Alert.fetch()

    alert_ids = Enum.map(alerts, & &1.id)

    screens_by_alerts =
      case ScreensByAlert.get_screens_by_alert(alert_ids) do
        {:ok, screens_by_alerts} -> screens_by_alerts
        _ -> Map.new(alert_ids, fn alert_id -> {alert_id, []} end)
      end

    json(conn, %{
      alerts: Enum.map(alerts, &Alert.to_full_map/1),
      screens_by_alert: screens_by_alerts
    })
  end
end
