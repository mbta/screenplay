defmodule ScreenplayWeb.EmergencyTakeoverTool.AlertController do
  use ScreenplayWeb, :controller

  alias Screenplay.EmergencyTakeovers
  alias Screenplay.EmergencyTakeoverTool.EmergencyTakeover
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
          "stations" => stations,
          "showtimeScreenIds" => showtime_screen_ids,
          "duration" => duration_in_hours,
          "images" => images
        }
      ) do
    schedule = schedule_from_duration(DateTime.utc_now(), duration_in_hours)
    user = get_session(conn, "username")
    alert = EmergencyTakeover.new(message, stations, schedule, user)
    params_to_log = Map.take(params, ["message", "stations", "duration"])

    with :ok <- UserActionLogger.log(user, :create_alert, params_to_log),
         :ok <- remove_overlapping_alerts(nil, params, user),
         {:ok, db_alert} <- EmergencyTakeovers.create_alert(alert),
         :ok <- add_outfront_takeovers(stations, images),
         :ok <-
           add_showtime_takeovers(
             Integer.to_string(db_alert.id),
             showtime_screen_ids,
             alert.message,
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

  def create(conn, _params) do
    json(conn, %{success: false})
  end

  @spec update(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def update(
        conn,
        params = %{
          "id" => id_str,
          "message" => message,
          "stations" => stations,
          "showtimeScreenIds" => showtime_screen_ids,
          "duration" => duration_in_hours,
          "images" => images
        }
      ) do
    schedule = schedule_from_duration(DateTime.utc_now(), duration_in_hours)
    changes = %{message: message, stations: stations, schedule: schedule}
    user = get_session(conn, "username")
    id = String.to_integer(id_str)
    params_to_log = Map.take(params, ["message", "stations", "duration", "id"])

    with :ok <- remove_overlapping_alerts(id, params, user),
         :ok <- UserActionLogger.log(user, :update_alert, params_to_log),
         {:ok, updated_alert} <- EmergencyTakeovers.update_alert(id, changes, user),
         :ok <- add_outfront_takeovers(stations, images),
         :ok <- add_showtime_takeovers(id_str, showtime_screen_ids, updated_alert.message, images) do
      json(conn, %{success: true})
    else
      {:error, reason} ->
        conn
        |> put_status(:internal_server_error)
        |> json(%{success: false, error: reason})
    end
  end

  def update(conn, _params) do
    json(conn, %{success: false})
  end

  @spec clear(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def clear(conn, params = %{"id" => id}) do
    user = get_session(conn, "username")
    alert = EmergencyTakeovers.get_alert(id)
    %EmergencyTakeover{stations: stations} = alert

    with :ok <- UserActionLogger.log(user, :clear_alert, params),
         {:ok, _cleared_alert} <- EmergencyTakeovers.clear_alert(alert, user),
         :ok <- SFTP.clear_takeover_images(stations),
         :ok <- remove_takeovers_from_showtime_screens(stations) do
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
    user = get_session(conn, "username")
    alerts = EmergencyTakeovers.get_active_alerts() |> Enum.map(&EmergencyTakeovers.to_json/1)

    with :ok <- UserActionLogger.log(user, :clear_all_alerts),
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

  @spec clear_single_alert_for_clear_all(map(), String.t()) :: :ok | {:error, String.t()}
  defp clear_single_alert_for_clear_all(alert = %EmergencyTakeover{stations: stations}, user) do
    with {:ok, _cleared_alert} <- EmergencyTakeovers.clear_alert(alert, user),
         :ok <- SFTP.clear_takeover_images(stations) do
      :ok
    else
      {:error, reason} -> {:error, reason}
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
          EmergencyTakeover.message(),
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
    image_store_module = Application.get_env(:screenplay, :image_store_module)
    image_types = ["indoor_portrait", "outdoor_portrait", "indoor_landscape", "outdoor_landscape"]

    Enum.reduce_while(image_types, :ok, fn image_type, _acc ->
      case images[image_type] do
        nil ->
          {:cont, :ok}

        image_data_string ->
          case decode_image(image_data_string) do
            {:ok, image_binary, _format} ->
              case image_store_module.upload_takeover_image(alert_id, image_binary, image_type) do
                :ok -> {:cont, :ok}
                error -> {:halt, error}
              end

            error ->
              {:halt, error}
          end
      end
    end)
  end

  @spec alerts(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def alerts(conn, _params) do
    {active_alerts, past_alerts} = EmergencyTakeovers.get_alerts()

    json(conn, %{
      "active" => Enum.map(active_alerts, &EmergencyTakeovers.to_json/1),
      "past" => Enum.map(past_alerts, &EmergencyTakeovers.to_json/1)
    })
  end

  @spec active_alerts(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def active_alerts(conn, _params) do
    alerts_json =
      EmergencyTakeovers.get_active_alerts() |> Enum.map(&EmergencyTakeovers.to_json/1)

    json(conn, alerts_json)
  end

  defp schedule_from_duration(start_dt, duration) do
    end_dt =
      case duration do
        "Open ended" -> nil
        _ -> DateTime.add(start_dt, 60 * 60 * duration, :second)
      end

    %{start_time: start_dt, end_time: end_dt}
  end

  defp decode_image("data:image/png;base64," <> raw) do
    {:ok, Base.decode64!(raw), "png"}
  rescue
    _ -> {:error, "Failed to decode PNG image."}
  end

  defp decode_image("data:image/gif;base64," <> raw) do
    {:ok, Base.decode64!(raw), "gif"}
  rescue
    _ -> {:error, "Failed to decode GIF image."}
  end

  defp decode_image(_) do
    {:error, "Unsupported image format."}
  end

  @spec remove_overlapping_alerts(integer() | nil, map(), String.t()) ::
          :ok | {:error, String.t()}
  defp remove_overlapping_alerts(id, params, user) do
    with stations_to_delete <-
           EmergencyTakeovers.remove_overlapping_alerts(id, params["stations"], user),
         :ok <- SFTP.clear_takeover_images(stations_to_delete),
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
