defmodule Screenplay.Config.PermanentConfig do
  @moduledoc false

  # Suppress dialyzer warning until more app_ids are implemented.
  @dialyzer [{:nowarn_function, get_route_id: 3}, {:nowarn_function, json_to_struct: 4}]

  alias Screenplay.PendingScreensConfig.Fetch, as: PendingScreensFetch
  alias Screenplay.RoutePatterns.RoutePattern
  alias ScreensConfig.{PendingConfig, Screen}
  alias ScreensConfig.V2.{Alerts, Audio, Departures, Footer, GlEink, LineMap}
  alias ScreensConfig.V2.Departures.{Query, Section}
  alias ScreensConfig.V2.Header.Destination

  @type screen_type :: :gl_eink_v2

  @spec put_pending_screens(map(), screen_type(), binary()) ::
          {:error, :version_mismatch | :config_not_fetched | :config_not_written} | :ok
  def put_pending_screens(places_and_screens, screen_type, version_id) do
    with {:ok, config_string} <- get_current_config(version_id),
         {:ok, deserialized} <- Jason.decode(config_string) do
      %PendingConfig{screens: existing_screens} = PendingConfig.from_json(deserialized)

      new_pending_screens_config =
        Enum.reduce(
          places_and_screens,
          existing_screens,
          get_config_reducer(screen_type)
        )

      case PendingScreensFetch.put_config(%PendingConfig{screens: new_pending_screens_config}) do
        :ok -> :ok
        :error -> {:error, :config_not_written}
      end
    else
      error ->
        error
    end
  end

  # Config reducers do 3 things:
  # 1. Make necessary data requests for retrieving stop related data for screen configurations
  # 2. Update any existing pending configurations that were changed.
  # 3. Add new pending screen configurations
  # Return on each reducer should be all pending configurations, including configurations that were not modified:
  # %{ screen_id => Screen.t() }
  defp get_config_reducer(:gl_eink_v2), do: &gl_eink_config_reducer/2

  defp get_config_reducer(app_id),
    do: raise("get_config_reducer/1 not implemented for app_id: #{app_id}")

  defp gl_eink_config_reducer(place_and_screens, acc) do
    {place_id,
     %{
       "updated_pending_screens" => updated_pending_screens,
       "new_pending_screens" => new_pending_screens
     }} =
      place_and_screens

    route_id = get_route_id(:gl_eink_v2, updated_pending_screens, new_pending_screens)

    # Need to fetch platform IDs because these screens are direction specific
    platform_ids = route_pattern_mod().fetch_platform_ids_for_route_at_stop(place_id, route_id)

    # Update/remove existing pending configs.
    new_config =
      update_existing_pending_screens(place_id, platform_ids, updated_pending_screens, acc)

    # Add new pending screens
    add_new_pending_screens(place_id, platform_ids, new_pending_screens, new_config)
  end

  defp get_current_config(version_id) do
    # Get config directly from source so we have an up-to-date version_id
    case PendingScreensFetch.fetch_config() do
      {:ok, config, ^version_id} ->
        {:ok, config}

      :error ->
        {:error, :config_not_fetched}

      _ ->
        {:error, :version_mismatch}
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

  defp json_to_struct(_, app_id, _, _),
    do: raise("json_to_struct/4 not implemented for app_id: #{app_id}")

  defp update_existing_pending_screens(place_id, platform_ids, updated_pending_screens, acc) do
    Enum.reduce(updated_pending_screens, acc, fn
      {screen_id, %{"is_deleted" => true}}, acc ->
        Map.delete(acc, screen_id)

      # screen_id was updated
      # Delete the old configuration and treat new ID as a new configuration
      {screen_id, %{"new_id" => new_id} = config}, acc ->
        acc
        |> Map.delete(screen_id)
        |> Map.put(
          new_id,
          json_to_struct(config, :gl_eink_v2, place_id, platform_ids)
        )

      {screen_id, config}, acc ->
        Map.put(acc, screen_id, Screen.from_json(config))
    end)
  end

  defp add_new_pending_screens(place_id, platform_ids, new_pending_screens, acc) do
    Enum.reduce(new_pending_screens, acc, fn
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

  # Each screen type will look in a different part of the configuration to find it's physical location
  defp get_route_id(:gl_eink_v2, updated_pending_screens, new_pending_screens) do
    updated_pending_screens
    |> Enum.map(fn {_screen_id, config} -> config end)
    |> Enum.concat(new_pending_screens)
    |> List.first()
    |> get_in(["app_params", "header", "route_id"])
  end

  defp get_route_id(app_id, _, _),
    do: raise("get_route_id/3 not implemented for app_id: #{app_id}")

  # Necessary for new mock framework.
  # Tests will use a mocked module when calling functions meant for the RoutePattern module.
  defp route_pattern_mod do
    Application.get_env(:screenplay, :route_pattern_mod, RoutePattern)
  end
end
