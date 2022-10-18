defmodule ScreenplayWeb.AlertsApiController do
  use ScreenplayWeb, :controller

  alias Screenplay.Alerts.Alert

  def index(conn, _params) do
    {:ok, alerts} = Alert.fetch()
    json(conn, Enum.map(alerts, &Alert.to_full_map/1))
  end
end
