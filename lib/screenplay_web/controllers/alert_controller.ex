defmodule ScreenplayWeb.AlertController do
  use ScreenplayWeb, :controller

  alias Screenplay.Alerts.{Alert, State}

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

    sftp_module = Application.get_env(:screenplay, :sftp_module)
    _ = sftp_module.set_takeover_image(stations, portrait_png, landscape_png)

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

    sftp_module = Application.get_env(:screenplay, :sftp_module)
    _ = sftp_module.set_takeover_image(stations, portrait_png, landscape_png)

    json(conn, %{success: true})
  end

  def edit(conn, _params) do
    json(conn, %{success: false})
  end

  def clear(conn, %{"id" => id}) do
    %Alert{stations: stations} = State.get_alert(id)
    :ok = State.delete_alert(id)

    sftp_module = Application.get_env(:screenplay, :sftp_module)
    _ = sftp_module.clear_images(stations)

    json(conn, %{success: true})
  end

  def list(conn, _params) do
    alerts_json = State.get_all_alerts() |> Enum.map(&Alert.to_json/1)
    json(conn, alerts_json)
  end
end
