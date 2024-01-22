defmodule Screenplay.Config.PermanentConfig do
  @moduledoc false
  alias Screenplay.PendingScreensConfig
  alias Screenplay.PendingScreensConfig.Fetch, as: PendingScreensFetch
  alias Screenplay.RoutePatterns.RoutePattern
  alias ScreensConfig.{Config, Screen}
  alias ScreensConfig.V2.{Alerts, Audio, Departures, Footer, GlEink, LineMap}
  alias ScreensConfig.V2.Departures.{Query, Section}
  alias ScreensConfig.V2.Header.Destination

  @type screen_type :: :gl_eink_v2

  @spec put_pending_screens(map(), screen_type(), binary()) ::
          {:error, :etag_mismatch | :config_not_fetched | :config_not_written} | :ok
  def put_pending_screens(places_and_screens, screen_type, etag) do
    case get_current_config(etag) do
      {:ok, config} ->
        %Config{screens: existing_screens} = config

        new_screens_config =
          Enum.reduce(
            places_and_screens,
            existing_screens,
            get_config_reducer(screen_type)
          )

        new_config = %Config{screens: new_screens_config}
        new_config_json = new_config |> Config.to_json() |> Jason.encode!(pretty: true)

        case PendingScreensFetch.put_config(new_config_json) do
          :ok -> :ok
          :error -> {:error, :config_not_written}
        end

      error ->
        error
    end
  end

  def get_config_reducer(:gl_eink_v2), do: &gl_eink_config_reducer/2
  def get_config_reducer(_), do: raise("Not implemented")

  def gl_eink_config_reducer(place_and_screens, acc) do
    {place_id, %{"screens" => screens}} = place_and_screens
    route_id = screens |> List.first() |> get_in(["app_params", "header", "route_id"])
    platform_ids = RoutePattern.fetch_platform_ids_for_route_at_stop(place_id, route_id)

    Enum.reduce(screens, acc, fn
      %{"is_deleted" => true} = screen, acc ->
        Map.delete(acc, screen["id"])

      screen, acc ->
        acc
        |> Map.delete(screen["old_id"])
        |> Map.put(screen["id"], json_to_struct(screen, :gl_eink_v2, place_id, platform_ids))
    end)
  end

  defp get_current_config(etag) do
    case PendingScreensConfig.Cache.config() do
      {:ok, config, ^etag} ->
        {:ok, config}

      :error ->
        {:error, :config_not_fetched}

      _ ->
        {:error, :etag_mismatch}
    end
  end

  defp json_to_struct(screen, :gl_eink_v2, parent_station_id, platform_ids) do
    %{
      "app_params" => %{
        "header" => %{"route_id" => route_id, "direction_id" => direction_id},
        "platform_location" => platform_location
      }
    } = screen

    platform_id = elem(platform_ids, direction_id)

    struct(Screen,
      vendor: :mercury,
      app_id: :gl_eink_v2,
      app_params:
        struct(GlEink,
          audio: default_enabled_audio_config(),
          departures:
            struct(Departures,
              sections: [
                struct(Section,
                  query:
                    struct(Query,
                      params: %Query.Params{
                        stop_ids: [parent_station_id],
                        route_ids: [route_id],
                        direction_id: direction_id
                      }
                    )
                )
              ]
            ),
          alerts: %Alerts{stop_id: platform_id},
          line_map: %LineMap{
            station_id: parent_station_id,
            stop_id: platform_id,
            direction_id: direction_id,
            route_id: route_id
          },
          header: %Destination{route_id: route_id, direction_id: direction_id},
          platform_location: platform_location,
          footer: %Footer{stop_id: parent_station_id}
        )
    )
  end

  defp default_enabled_audio_config do
    %Audio{
      start_time: ~T[00:00:00],
      stop_time: ~T[23:59:59],
      days_active: [1, 2, 3, 4, 5, 6, 7]
    }
  end
end
