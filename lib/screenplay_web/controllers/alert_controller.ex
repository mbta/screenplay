defmodule ScreenplayWeb.AlertController do
  use ScreenplayWeb, :controller

  alias Screenplay.Alerts.{Alert, State}
  alias Screenplay.Outfront.SFTP

  def create(conn, %{
        "message" => message,
        "stations" => stations,
        "duration" => duration_in_hours,
        "portrait_png" => portrait_png,
        "landscape_png" => landscape_png
      }) do
    start_dt = DateTime.utc_now()
    end_dt = DateTime.add(start_dt, 60 * 60 * duration_in_hours, :second)
    schedule = %{start: start_dt, end: end_dt}

    user = get_session(conn, "username")

    message = Alert.message_from_json(message)
    alert = Alert.new(message, stations, schedule, user)
    :ok = State.add_alert(alert)

    portrait_image_data = decode_png(portrait_png)
    landscape_image_data = decode_png(landscape_png)

    _ = SFTP.set_takeover_images(stations, portrait_image_data, landscape_image_data)

    json(conn, %{success: true})
  end

  def create(conn, _params) do
    json(conn, %{success: false})
  end

  def edit(conn, %{
        "id" => id,
        "message" => message,
        "stations" => stations,
        "duration" => duration_in_hours,
        "portrait_png" => portrait_png,
        "landscape_png" => landscape_png
      }) do
    alert = State.get_alert(id)

    start_dt = alert.schedule.start
    end_dt = DateTime.add(start_dt, 60 * 60 * duration_in_hours, :second)
    schedule = %{start: start_dt, end: end_dt}
    message = Alert.message_from_json(message)
    changes = %{message: message, stations: stations, schedule: schedule}

    user = get_session(conn, "username")

    new_alert = Alert.update(alert, changes, user)
    :ok = State.update_alert(id, new_alert)

    portrait_image_data = decode_png(portrait_png)
    landscape_image_data = decode_png(landscape_png)

    _ = SFTP.set_takeover_images(stations, portrait_image_data, landscape_image_data)

    json(conn, %{success: true})
  end

  def edit(conn, _params) do
    json(conn, %{success: false})
  end

  def clear(conn, %{"id" => id}) do
    %Alert{stations: stations} = State.get_alert(id)
    :ok = State.delete_alert(id)

    _ = SFTP.clear_takeover_images(stations)

    json(conn, %{success: true})
  end

  def list(conn, _params) do
    alerts_json = State.get_all_alerts() |> Enum.map(&Alert.to_json/1)
    IO.inspect(alerts_json, label: "alerts_json")
    json(conn, alerts_json)
  end

  defp decode_png(png) do
    "data:image/png;base64," <> raw = png
    Base.decode64!(raw)
  end
end
