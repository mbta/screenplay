defmodule ScreenplayWeb.OutfrontTakeoverTool.AlertController do
  use ScreenplayWeb, :controller

  alias Screenplay.OutfrontTakeoverTool.Alerts.{Alert, State}
  alias Screenplay.Outfront.SFTP
  alias ScreenplayWeb.UserActionLogger

  def create(
        conn,
        params = %{
          "message" => message,
          "stations" => stations,
          "duration" => duration_in_hours,
          "portrait_png" => portrait_png,
          "landscape_png" => landscape_png
        }
      ) do
    schedule = schedule_from_duration(DateTime.utc_now(), duration_in_hours)
    user = get_session(conn, "username")

    remove_overlapping_alerts(params, user)

    message = Alert.message_from_json(message)
    alert = Alert.new(message, stations, schedule, user)

    params_to_log =
      params
      |> Map.take(["message", "stations", "duration"])
      |> Map.merge(%{"id" => alert.id})

    _ = UserActionLogger.log(user, :create_alert, params_to_log)
    :ok = State.add_alert(alert)

    portrait_image_data = decode_png(portrait_png)
    landscape_image_data = decode_png(landscape_png)

    _ = SFTP.set_takeover_images(stations, portrait_image_data, landscape_image_data)

    json(conn, %{success: true})
  end

  def create(conn, _params) do
    json(conn, %{success: false})
  end

  def edit(
        conn,
        params = %{
          "id" => id,
          "message" => message,
          "stations" => stations,
          "duration" => duration_in_hours,
          "portrait_png" => portrait_png,
          "landscape_png" => landscape_png
        }
      ) do
    alert = State.get_alert(id)
    schedule = schedule_from_duration(DateTime.utc_now(), duration_in_hours)
    message = Alert.message_from_json(message)
    changes = %{message: message, stations: stations, schedule: schedule}

    user = get_session(conn, "username")

    remove_overlapping_alerts(params, user)

    new_alert = Alert.update(alert, changes, user)

    params_to_log = Map.take(params, ["message", "stations", "duration", "id"])
    _ = UserActionLogger.log(user, :update_alert, params_to_log)
    :ok = State.update_alert(id, new_alert)

    portrait_image_data = decode_png(portrait_png)
    landscape_image_data = decode_png(landscape_png)

    _ = SFTP.set_takeover_images(stations, portrait_image_data, landscape_image_data)

    json(conn, %{success: true})
  end

  def edit(conn, _params) do
    json(conn, %{success: false})
  end

  def clear(conn, params = %{"id" => id}) do
    user = get_session(conn, "username")
    _ = UserActionLogger.log(user, :clear_alert, params)

    alert = State.get_alert(id)
    %Alert{stations: stations} = alert
    :ok = alert |> Alert.clear(user) |> State.clear_alert()

    _ = SFTP.clear_takeover_images(stations)

    json(conn, %{success: true})
  end

  def clear_all(conn, _params) do
    user = get_session(conn, "username")
    _ = UserActionLogger.log(user, :clear_all_alerts)

    State.get_active_alerts()
    |> Enum.each(fn alert = %Alert{stations: stations} ->
      :ok = alert |> Alert.clear(user) |> State.clear_alert()
      SFTP.clear_takeover_images(stations)
    end)

    json(conn, %{success: true})
  end

  def active_alerts(conn, _params) do
    alerts_json = State.get_active_alerts() |> Enum.map(&Alert.to_json/1)
    json(conn, alerts_json)
  end

  def past_alerts(conn, _params) do
    alerts_json = State.get_past_alerts() |> Enum.map(&Alert.to_json/1)
    json(conn, alerts_json)
  end

  defp schedule_from_duration(start_dt, duration) do
    end_dt =
      case duration do
        "Open ended" -> nil
        _ -> DateTime.add(start_dt, 60 * 60 * duration, :second)
      end

    %{start: start_dt, end: end_dt}
  end

  defp decode_png(png) do
    "data:image/png;base64," <> raw = png
    Base.decode64!(raw)
  end

  defp remove_overlapping_alerts(params, user) do
    stations_to_delete = State.remove_overlapping_alerts(params, user)
    SFTP.clear_takeover_images(stations_to_delete)
  end
end
