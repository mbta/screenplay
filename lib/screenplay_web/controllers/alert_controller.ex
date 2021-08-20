defmodule ScreenplayWeb.AlertController do
  use ScreenplayWeb, :controller

  alias Screenplay.Alerts.{Alert, State}
  alias Screenplay.Util

  @spec create(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def create(conn, %{"message" => message, "stations" => stations_string, "duration" => duration}) do
    start = Util.now()
    end_time = DateTime.add(start, String.to_integer(duration) * 3600, :second)

    # To do later: post to outfront.  If successful, then create S3 alert.

    alert = Alert.new(message, String.split(stations_string, ","), %{start: start, end: end_time})
    State.add_alert(alert)
    send_resp(conn, 200, "")
  end
end
