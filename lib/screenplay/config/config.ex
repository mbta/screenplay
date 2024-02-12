defmodule Screenplay.Config.PermanentConfig do
  @moduledoc false

  alias Screenplay.Config.PlaceAndScreens
  alias Screenplay.PendingScreensConfig.Fetch, as: PendingScreensFetch
  alias Screenplay.RoutePatterns.RoutePattern
  alias Screenplay.ScreensConfig.Fetch, as: PublishedScreensFetch
  alias ScreensConfig.{Config, PendingConfig, Screen}
  alias ScreensConfig.V2.{Alerts, Audio, Departures, Footer, GlEink, LineMap}
  alias ScreensConfig.V2.Departures.{Query, Section}
  alias ScreensConfig.V2.Header.Destination

  @config_fetcher Application.compile_env(:screenplay, :config_fetcher)

  @type screen_type :: :gl_eink_v2

  @spec put_pending_screens(map(), screen_type(), binary()) ::
          {:error, :version_mismatch | :config_not_fetched | :config_not_written} | :ok
  def put_pending_screens(places_and_screens, screen_type, version_id) do
    with {:ok, config_string} <- get_current_pending_config(version_id),
         {:ok, deserialized} <- Jason.decode(config_string) do
      %PendingConfig{screens: existing_screens} = PendingConfig.from_json(deserialized)

      new_screens_config =
        Enum.reduce(
          places_and_screens,
          existing_screens,
          get_config_reducer(screen_type)
        )

      case PendingScreensFetch.put_config(%PendingConfig{screens: new_screens_config}) do
        :ok -> :ok
        :error -> {:error, :config_not_written}
      end
    else
      error ->
        error
    end
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

  def publish_pending_screens(place_id) do
    {config, version} = get_current_pending_config()

    %PendingConfig{screens: pending_screens} =
      config |> Jason.decode!() |> PendingConfig.from_json()

    {screens_to_publish, new_pending_screens} =
      Enum.split_with(pending_screens, &place_has_screen(&1, place_id))

    new_pending_screens_config =
      %PendingConfig{screens: Enum.into(new_pending_screens, %{})}

    new_published_screens_config = get_new_published_screens(screens_to_publish)
    new_places_and_screens_config = get_new_places_and_screens_config(screens_to_publish)

    with :ok <- PendingScreensFetch.put_config(new_pending_screens_config),
         :ok <- PublishedScreensFetch.put_config(new_published_screens_config),
         :ok <- @config_fetcher.put_config(new_places_and_screens_config) do
      PendingScreensFetch.commit()
      # PublishedScreensFetch.commit()
      # @config_fetcher.commit()
      :ok
    else
      _ ->
        PendingScreensFetch.revert(version)
        # PublishedScreensFetch.revert(version)
        # @config_fetcher.revert(version)
        :error
    end
  end

  defp get_current_pending_config do
    case PendingScreensFetch.fetch_config() do
      {:ok, config, version} -> {config, version}
      error -> error
    end
  end

  defp get_current_pending_config(version) do
    # Get config directly from source so we have an up-to-date version_id
    case PendingScreensFetch.fetch_config() do
      {:ok, config, ^version} ->
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
        Map.put(acc, screen_id, config)
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

  defp get_current_published_config do
    case PublishedScreensFetch.fetch_config() do
      {:ok, config, _version_id} -> config
      error -> error
    end
  end

  defp get_new_published_screens(screens_to_publish) do
    %Config{screens: published_screens, devops: devops} =
      get_current_published_config() |> Jason.decode!() |> Config.from_json()

    screens =
      screens_to_publish
      |> Enum.into(%{})
      |> Map.merge(published_screens)

    %Config{screens: screens, devops: devops}
  end

  defp get_new_places_and_screens_config(new_published_screens) do
    places_and_screens_config =
      case @config_fetcher.get_config() do
        {:ok, places_and_screens_config, _, _} ->
          places_and_screens_config

        _ ->
          {:error, "Could not fetch places_and_screens"}
      end

    places_and_screens_config =
      Enum.map(places_and_screens_config, &PlaceAndScreens.from_map/1)

    grouped_places_and_screens =
      new_published_screens
      |> Enum.into(%{})
      |> Enum.group_by(
        fn
          {_, %Screen{app_id: :gl_eink_v2} = config} ->
            config.app_params.footer.stop_id

          _ ->
            raise("Not implemented")
        end,
        fn {screen_id, config} ->
          %Screen{app_id: app_id, disabled: disabled} = config
          %{id: screen_id, type: app_id, disabled: disabled}
        end
      )

    Enum.reduce(places_and_screens_config, [], fn
      %{id: place_id} = place_and_screens, acc
      when is_map_key(grouped_places_and_screens, place_id) ->
        new_screens = grouped_places_and_screens[place_id]
        %{screens: existing_screens} = place_and_screens

        [%{place_and_screens | screens: existing_screens ++ new_screens} | acc]

      map, acc ->
        [map | acc]
    end)
  end

  defp place_has_screen(
         {_screen_id, %Screen{app_id: :gl_eink_v2} = screen},
         place_id
       ) do
    %Screen{app_params: %GlEink{footer: %Footer{stop_id: stop_id}}} = screen
    stop_id == place_id
  end

  defp place_has_screen(_screen, _place_id), do: false

  defp route_pattern_mod, do: Application.get_env(:screenplay, :route_pattern_mod, RoutePattern)
end
