defmodule ScreenplayWeb.AlertController do
  use ScreenplayWeb, :controller

  alias Screenplay.Alerts.{Alert, State}
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
    schedule = schedule_from_duration(alert.schedule.start, duration_in_hours)
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

    %Alert{stations: stations} = State.get_alert(id)
    delete_alert(id, stations)

    json(conn, %{success: true})
  end

  def list(conn, _params) do
    alerts_json = State.get_all_alerts() |> Enum.map(&Alert.to_json/1)
    json(conn, alerts_json)
  end

  def list_active(conn, _params) do
    alerts_json = State.get_active_alerts() |> Enum.map(&Alert.to_json/1)
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

  defp delete_alert(id, stations) do
    :ok = State.delete_alert(id)

    _ = SFTP.clear_takeover_images(stations)
  end

  defp remove_overlapping_alerts(
         params = %{
           "id" => id,
           "stations" => stations
         },
         user
       ) do
    # Get all active alerts and find any that share a station with the new alert (excluding self if editing)
    State.get_active_alerts()
    |> Enum.filter(fn %{id: active_id, stations: active_alert_stations} ->
      (id == nil or id != active_id) and
        MapSet.intersection(
          MapSet.new(stations),
          MapSet.new(active_alert_stations)
        )
        |> MapSet.size() > 0
    end)
    |> Enum.each(fn
      # If existing alert has only one station, just delete it
      %Alert{stations: [_single_station]} = a ->
        delete_alert(a.id, a.stations)

      # If existing alert has multiple stations: remove the overlapping stations, update the alert, clear the overlapping images.
      %Alert{stations: _stations} = a ->
        stations_no_overlap = Enum.reject(a.stations, fn station -> station in stations end)

        # Existing alert and new alert have the same station list
        if length(stations_no_overlap) == 0 do
          delete_alert(a.id, a.stations)
        else
          stations_to_delete = stations -- stations_no_overlap
          changes = %{message: a.message, stations: stations_no_overlap, schedule: a.schedule}

          updated_alert = Alert.update(a, changes, user)

          params_to_log = Map.take(params, ["message", "stations", "duration", "id"])
          UserActionLogger.log(user, :update_alert, params_to_log)
          :ok = State.update_alert(a.id, updated_alert)

          SFTP.clear_takeover_images(stations_to_delete)
        end
    end)
  end
end
