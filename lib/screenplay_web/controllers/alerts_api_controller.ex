defmodule ScreenplayWeb.AlertsApiController do
  use ScreenplayWeb, :controller

  alias Screenplay.Alerts.Alert
  alias Screenplay.Alerts.ScreensByAlert

  def index(conn, _params) do
    {:ok, alerts} = Alert.fetch()

    {:ok, screens_by_alerts} =
      alerts |> Enum.map(& &1.id) |> ScreensByAlert.get_screens_by_alert()

    json(conn, %{
      alerts: Enum.map(alerts, &Alert.to_full_map/1),
      screens_by_alert: screens_by_alerts
    })
  end
end
