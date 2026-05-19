defmodule ScreenplayWeb.EmergencyTakeoverTool.AlertController do
  use ScreenplayWeb, :controller

  alias Screenplay.EmergencyTakeoverTool.Alerts.{Alert, State}
  alias Screenplay.Outfront.SFTP
  alias Screenplay.PermanentConfig
  alias Screenplay.Places
  alias Screenplay.Places.Place.ShowtimeScreen
  alias ScreenplayWeb.UserActionLogger

  @spec create(Plug.Conn.t(), map()) :: Plug.Conn.t()
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
    with schedule <- schedule_from_duration(DateTime.utc_now(), duration_in_hours),
         user <- get_session(conn, "username"),
         message_struct <- Alert.message_from_json(message),
         station_names = Map.keys(stations_map),
         alert <- Alert.new(message_struct, station_names, schedule, user),
         params_to_log =
           params
           |> Map.take(["message", "stations", "duration"])
           |> Map.merge(%{"id" => alert.id}),
         :ok <- UserActionLogger.log(user, :create_alert, params_to_log),
         :ok <- remove_overlapping_alerts(params, user),
         :ok <- State.add_alert(alert),
         outfront_stations =
           stations_map
           |> Enum.filter(fn {_name, has_outfront} -> has_outfront end)
           |> Enum.map(fn {name, _has_outfront} -> name end),
         :ok <- add_outfront_takeovers(outfront_stations, images),
         :ok <- add_showtime_takeovers(alert.id, showtime_screen_ids, message_struct, images) do
      json(conn, %{success: true})
    else
      {:error, reason} ->
        conn
        |> put_status(:internal_server_error)
        |> json(%{success: false, error: reason})
    end
  end

  def create(conn, _params) do
    json(conn, %{success: false})
  end

  @spec edit(Plug.Conn.t(), map()) :: Plug.Conn.t()
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
    with alert <- State.get_alert(id),
         schedule <- schedule_from_duration(DateTime.utc_now(), duration_in_hours),
         message_struct <- Alert.message_from_json(message),
         station_names = Map.keys(stations_map),
         changes = %{
           message: message_struct,
           stations: station_names,
           schedule: schedule
         },
         user <- get_session(conn, "username"),
         :ok <- remove_overlapping_alerts(params, user),
         new_alert <- Alert.update(alert, changes, user),
         outfront_stations =
           stations_map
           |> Enum.filter(fn {_name, has_outfront} -> has_outfront end)
           |> Enum.map(fn {name, _has_outfront} -> name end),
         params_to_log =
           Map.take(params, ["message", "stations", "duration", "id"]),
         :ok <- UserActionLogger.log(user, :update_alert, params_to_log),
         :ok <- State.update_alert(id, new_alert),
         :ok <- add_outfront_takeovers(outfront_stations, images),
         :ok <-
           add_showtime_takeovers(
             alert.id,
             showtime_screen_ids,
             message_struct,
             images
           ) do
      json(conn, %{success: true})
    else
      {:error, reason} ->
        conn
        |> put_status(:internal_server_error)
        |> json(%{success: false, error: reason})
    end
  end

  def edit(conn, _params) do
    json(conn, %{success: false})
  end

  @spec clear(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def clear(conn, params = %{"id" => id}) do
    with user <- get_session(conn, "username"),
         :ok <- UserActionLogger.log(user, :clear_alert, params),
         alert <- State.get_alert(id),
         %Alert{stations: stations} = alert,
         cleared_alert <- Alert.clear(alert, user),
         :ok <- State.clear_alert(cleared_alert),
         :ok <- SFTP.clear_takeover_images(stations),
         :ok <- remove_takeovers_from_showtime_screens(stations),
         alerts_fetch_module = Application.get_env(:screenplay, :alerts_fetch_module),
         :ok <- alerts_fetch_module.delete_takeover_images(id) do
      json(conn, %{success: true})
    else
      {:error, reason} ->
        conn
        |> put_status(:internal_server_error)
        |> json(%{success: false, error: reason})
    end
  end

  @spec clear_all(Plug.Conn.t(), any()) :: Plug.Conn.t()
  def clear_all(conn, _params) do
    with user <- get_session(conn, "username"),
         :ok <- UserActionLogger.log(user, :clear_all_alerts),
         alerts = State.get_active_alerts(),
         :ok <-
           Enum.reduce_while(alerts, :ok, fn alert, _ ->
             case clear_single_alert_for_clear_all(alert, user) do
               :ok -> {:cont, :ok}
             end
           end) do
      json(conn, %{success: true})
    else
      {:error, reason} ->
        conn
        |> put_status(:internal_server_error)
        |> json(%{success: false, error: reason})

      _ ->
        conn
        |> put_status(:internal_server_error)
        |> json(%{success: false, error: "An unknown error occurred while clearing all alerts."})
    end
  end

  @spec clear_single_alert_for_clear_all(Alert.t(), String.t()) :: :ok | {:error, String.t()}
  defp clear_single_alert_for_clear_all(alert = %Alert{stations: stations}, user) do
    with cleared_alert <- Alert.clear(alert, user),
         :ok <- State.clear_alert(cleared_alert),
         :ok <- SFTP.clear_takeover_images(stations) do
      :ok
    else
      {:error, reason} -> {:error, reason}
      _ -> {:error, "Unknown error clearing alert #{alert.id}"}
    end
  end

  @spec add_outfront_takeovers(list(String.t()), %{String.t() => String.t()}) :: :ok
  def add_outfront_takeovers(stations, images) do
    with {:ok, portrait_img_data, portrait_format} <- decode_image(images["indoor_portrait"]),
         {:ok, landscape_img_data, landscape_format} <- decode_image(images["outdoor_landscape"]),
         :ok <-
           SFTP.set_takeover_images(
             stations,
             {portrait_img_data, portrait_format},
             {landscape_img_data, landscape_format}
           ) do
      :ok
    else
      {:error, reason} ->
        {:error, reason}
    end
  end

  @spec add_showtime_takeovers(
          String.t(),
          list(String.t()),
          Alert.message(),
          %{String.t() => String.t()}
        ) :: :ok | {:error, String.t()}
  def add_showtime_takeovers(alert_id, screen_ids, message = %{type: :canned}, _images) do
    case PermanentConfig.add_emergency_takeover_configs(alert_id, screen_ids, message) do
      :ok -> :ok
      {:error, reason} -> {:error, "Failed to add canned message takeovers: #{reason}"}
    end
  end

  def add_showtime_takeovers(alert_id, screen_ids, message = %{type: :custom}, images) do
    with :ok <- upload_takeover_images(alert_id, images),
         :ok <- PermanentConfig.add_emergency_takeover_configs(alert_id, screen_ids, message) do
      :ok
    else
      {:error, reason} -> {:error, "Failed to add custom message takeovers: #{reason}"}
    end
  end

  @spec upload_takeover_images(String.t(), %{String.t() => String.t()}) ::
          :ok | {:error, String.t()}
  def upload_takeover_images(alert_id, images) do
    alerts_fetch_module = Application.get_env(:screenplay, :alerts_fetch_module)
    image_types = ["indoor_portrait", "outdoor_portrait", "indoor_landscape", "outdoor_landscape"]

    Enum.reduce_while(image_types, :ok, fn image_type, _acc ->
      case images[image_type] do
        nil ->
          {:cont, :ok}

        image_data_string ->
          case decode_image(image_data_string) do
            {:ok, image_binary, _format} ->
              case alerts_fetch_module.upload_takeover_image(alert_id, image_binary, image_type) do
                :ok -> {:cont, :ok}
                error -> {:halt, error}
              end

            error ->
              {:halt, error}
          end
      end
    end)
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
    try do
      {:ok, Base.decode64!(raw), "png"}
    rescue
      _ -> {:error, "Failed to decode PNG image."}
    end
  end

  defp decode_image("data:image/gif;base64," <> raw) do
    try do
      {:ok, Base.decode64!(raw), "gif"}
    rescue
      _ -> {:error, "Failed to decode GIF image."}
    end
  end

  defp decode_image(_) do
    {:error, "Unsupported image format."}
  end

  @spec remove_overlapping_alerts(map(), String.t()) :: :ok | {:error, String.t()}
  defp remove_overlapping_alerts(params, user) do
    stations_to_delete = State.remove_overlapping_alerts(params, user)

    with :ok <- SFTP.clear_takeover_images(stations_to_delete),
         :ok <- remove_takeovers_from_showtime_screens(stations_to_delete) do
      :ok
    else
      {:error, reason} ->
        {:error, "Failed to remove overlapping alerts: #{reason}"}

      _ ->
        {:error, "An unknown error occurred while removing overlapping alerts."}
    end
  end

  @spec remove_takeovers_from_showtime_screens(list(String.t())) :: :ok
  defp remove_takeovers_from_showtime_screens(station_names) do
    station_names
    |> showtime_screens_at_stations()
    |> PermanentConfig.clear_emergency_takeover_configs()
  end

  @spec showtime_screens_at_stations(list(String.t())) :: list(String.t())
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
