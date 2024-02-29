defmodule Screenplay.Config.PermanentConfig do
  @moduledoc false

  alias Screenplay.PendingScreensConfig.Fetch, as: PendingScreensFetch
  alias Screenplay.RoutePatterns.RoutePattern
  alias ScreensConfig.{Config, Screen}
  alias ScreensConfig.V2.{Alerts, Audio, Departures, Footer, GlEink, LineMap}
  alias ScreensConfig.V2.Departures.{Query, Section}
  alias ScreensConfig.V2.Header.Destination

  @type screen_type :: :gl_eink_v2

  @spec put_pending_screens(map(), screen_type(), binary()) ::
          {:error, :etag_mismatch | :config_not_fetched | :config_not_written | {:duplicate_screen_ids, list()}} | :ok
  def put_pending_screens(places_and_screens, screen_type, etag) do
    with {:ok, config_string} <- get_current_config(etag),
         {:ok, deserialized} <- Jason.decode(config_string),
         {:ok, existing_screens} <-
           check_for_duplicate_screen_ids(deserialized, places_and_screens) do
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
    else
      error ->
        error
    end
  end

  defp check_for_duplicate_screen_ids(deserialized, places_and_screens) do
    %Config{screens: existing_screens} = Config.from_json(deserialized)

    all_screen_ids =
      Enum.flat_map(places_and_screens, fn {_place_id, %{"new_screens" => new_screens}} ->
        Enum.map(new_screens, fn %{"new_id" => new_id} -> new_id end)
      end) ++ Map.keys(existing_screens)

    duplicate_screen_ids =
      all_screen_ids
      |> Enum.group_by(& &1)
      |> Enum.filter(fn {_string, occurrences} -> length(occurrences) > 1 end)
      |> Enum.map(&elem(&1, 0))

    if Enum.empty?(duplicate_screen_ids),
      do: {:ok, existing_screens},
      else: {:error, {:duplicate_screen_ids, duplicate_screen_ids}}
  end

  defp get_config_reducer(:gl_eink_v2), do: &gl_eink_config_reducer/2
  defp get_config_reducer(_), do: raise("Not implemented")

  defp gl_eink_config_reducer(place_and_screens, acc) do
    {place_id, %{"updated_screens" => updated_screens, "new_screens" => new_screens}} =
      place_and_screens

    route_id = get_route_id(updated_screens, new_screens)
    platform_ids = route_pattern_mod().fetch_platform_ids_for_route_at_stop(place_id, route_id)

    # Update/remove existing configs
    new_config = update_existing_pending_screens(place_id, platform_ids, updated_screens, acc)

    # Add new pending screens
    add_new_pending_screens(place_id, platform_ids, new_screens, new_config)
  end

  defp get_current_config(etag) do
    # Get config directly from source so we have an up-to-date etag
    case PendingScreensFetch.fetch_config() do
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

  defp update_existing_pending_screens(place_id, platform_ids, updated_screens, acc) do
    Enum.reduce(updated_screens, acc, fn
      {screen_id, %{"is_deleted" => true}}, acc ->
        Map.delete(acc, screen_id)

      # screen_id was updated
      {screen_id, %{"new_id" => new_id} = config}, acc ->
        acc
        |> Map.delete(screen_id)
        |> Map.put(
          new_id,
          json_to_struct(config, :gl_eink_v2, place_id, platform_ids)
        )

      {screen_id, config}, acc ->
        Map.put(acc, screen_id, json_to_struct(config, :gl_eink_v2, place_id, platform_ids))
    end)
  end

  defp add_new_pending_screens(place_id, platform_ids, new_screens, acc) do
    Enum.reduce(new_screens, acc, fn
      config, acc ->
        Map.put(
          acc,
          config["new_id"],
          json_to_struct(config, :gl_eink_v2, place_id, platform_ids)
        )
    end)
  end

  defp default_enabled_audio_config do
    %Audio{
      start_time: ~T[00:00:00],
      stop_time: ~T[23:59:59],
      days_active: [1, 2, 3, 4, 5, 6, 7]
    }
  end

  defp get_route_id(updated_screens, new_screens) do
    updated_screens
    |> Enum.map(fn {_screen_id, config} -> config end)
    |> Enum.concat(new_screens)
    |> List.first()
    |> get_in(["app_params", "header", "route_id"])
  end

  defp route_pattern_mod do
    Application.get_env(:screenplay, :route_pattern_mod, RoutePattern)
  end
end
