defmodule ScreenplayWeb.EmergencyTakeoverTool.AlertController do
  use ScreenplayWeb, :controller

  alias Screenplay.EmergencyTakeoverTool.Alerts.{Alert, State}
  alias Screenplay.Outfront.SFTP
  alias Screenplay.PermanentConfig
  alias Screenplay.Places
  alias Screenplay.Places.Place.ShowtimeScreen
  alias ScreenplayWeb.UserActionLogger

  def create(
        conn,
        params = %{
          "message" => message,
          "stations" => stations_map,
          "showtimeScreenIds" => showtime_screen_ids,
          "duration" => duration_in_hours,
          "images" => images
        }
      ) do
    schedule = schedule_from_duration(DateTime.utc_now(), duration_in_hours)
    user = get_session(conn, "username")

    remove_overlapping_alerts(params, user)

    message = Alert.message_from_json(message)
    station_names = Map.keys(stations_map)
    alert = Alert.new(message, station_names, schedule, user)

    params_to_log =
      params
      |> Map.take(["message", "stations", "duration"])
      |> Map.merge(%{"id" => alert.id})

    _ = UserActionLogger.log(user, :create_alert, params_to_log)
    :ok = State.add_alert(alert)

    # Extract only the stations that have an outfront screen (portrait or landscape)
    outfront_stations =
      stations_map
      |> Enum.filter(fn {_name, has_outfront} -> has_outfront end)
      |> Enum.map(fn {name, _has_outfront} -> name end)

    _ = create_outfront_takeovers(outfront_stations, images)

    _ =
      create_showtime_takeovers(
        alert.id,
        showtime_screen_ids,
        message,
        images
      )

    json(conn, %{success: true})
  end

  def create(conn, _params) do
    json(conn, %{success: false})
  end

  def create_outfront_takeovers(stations, images) do
    portrait_image_data = decode_image(images["indoor_portrait"])
    landscape_image_data = decode_image(images["outdoor_landscape"])
    _ = SFTP.set_takeover_images(stations, portrait_image_data, landscape_image_data)
  end

  def create_showtime_takeovers(
        alert_id,
        showtime_screen_ids,
        %{type: :canned} = message,
        _images
      ) do
    _ = PermanentConfig.update_emergency_takeover_configs(alert_id, showtime_screen_ids, message)
  end

  def create_showtime_takeovers(
        alert_id,
        showtime_screen_ids,
        %{type: :custom} = message,
        images
      ) do
    # Only upload images for custom messages; canned messages use pre-existing image URLs
    _ = upload_takeover_images(alert_id, images)
    _ = PermanentConfig.update_emergency_takeover_configs(alert_id, showtime_screen_ids, message)
  end

  def upload_takeover_images(alert_id, images) do
    alerts_fetch_module = Application.get_env(:screenplay, :alerts_fetch_module)

    # Handle image uploads for all 4 image types
    upload_images = fn image_type ->
      case images[image_type] do
        nil ->
          :ok

        image_data_string ->
          {image_binary, _format} = decode_image(image_data_string)
          alerts_fetch_module.upload_takeover_image(alert_id, image_binary, image_type)
      end
    end

    # Upload all 4 image types
    _ = upload_images.("indoor_portrait")
    _ = upload_images.("outdoor_portrait")
    _ = upload_images.("indoor_landscape")
    _ = upload_images.("outdoor_landscape")
  end

  def edit(
        conn,
        params = %{
          "id" => id,
          "message" => message,
          "stations" => stations_map,
          "showtimeScreenIds" => showtime_screen_ids,
          "duration" => duration_in_hours,
          "images" => images
        }
      ) do
    alert = State.get_alert(id)
    schedule = schedule_from_duration(DateTime.utc_now(), duration_in_hours)
    message = Alert.message_from_json(message)

    station_names = Map.keys(stations_map)

    changes = %{
      message: message,
      stations: station_names,
      schedule: schedule
    }

    user = get_session(conn, "username")

    remove_overlapping_alerts(params, user)

    new_alert = Alert.update(alert, changes, user)

    # Extract only the stations that have an outfront screen (portrait or landscape)
    outfront_stations =
      stations_map
      |> Enum.filter(fn {_name, has_outfront} -> has_outfront end)
      |> Enum.map(fn {name, _has_outfront} -> name end)

    params_to_log =
      Map.take(params, ["message", "stations", "duration", "id"])

    _ = UserActionLogger.log(user, :update_alert, params_to_log)
    :ok = State.update_alert(id, new_alert)

    _ = create_outfront_takeovers(outfront_stations, images)

    _ =
      create_showtime_takeovers(
        alert.id,
        showtime_screen_ids,
        message,
        images
      )

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
    remove_takeovers_from_showtime_screens(stations)

    # Get the configured fetch module based on environment and delete images
    alerts_fetch_module = Application.get_env(:screenplay, :alerts_fetch_module)
    _ = alerts_fetch_module.delete_takeover_images(id)

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

  defp decode_image("data:image/png;base64," <> raw) do
    {Base.decode64!(raw), "png"}
  end

  defp decode_image("data:image/gif;base64," <> raw) do
    {Base.decode64!(raw), "gif"}
  end

  defp remove_overlapping_alerts(params, user) do
    stations_to_delete = State.remove_overlapping_alerts(params, user)

    IO.inspect(stations_to_delete, label: "Stations to delete takeovers from")
    SFTP.clear_takeover_images(stations_to_delete)
    remove_takeovers_from_showtime_screens(stations_to_delete)
  end

  defp remove_takeovers_from_showtime_screens(station_names) do
    station_names
    |> showtime_screens_at_stations()
    |> PermanentConfig.clear_emergency_takeover_configs()
  end

  defp showtime_screens_at_stations(station_names) do
    Places.get_all()
    |> Enum.filter(fn place -> place.name in station_names end)
    |> Enum.flat_map(fn place ->
      place.screens
      |> Enum.filter(fn screen ->
        match?(
          %ShowtimeScreen{type: type} when type in [:pre_fare_v2, :dup_v2, :busway_v2],
          screen
        ) and
          screen.emergency_messaging_location in [:inside, :outside]
      end)
      |> Enum.map(& &1.id)
    end)
  end
end
