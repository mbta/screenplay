defmodule Screenplay.Config.PermanentConfig do
  @moduledoc false

  # Suppress dialyzer warning until more app_ids are implemented.
  @dialyzer [{:nowarn_function, get_route_id: 3}, {:nowarn_function, json_to_struct: 4}]

  alias Screenplay.Config.PlaceAndScreens
  alias Screenplay.PendingScreensConfig.Fetch, as: PendingScreensFetch
  alias Screenplay.RoutePatterns.RoutePattern
  alias Screenplay.ScreensConfig.Cache, as: ScreensConfigCache
  alias Screenplay.ScreensConfig.Fetch, as: PublishedScreensFetch
  alias ScreensConfig.{Config, PendingConfig, Screen}
  alias ScreensConfig.V2.{Alerts, Audio, Departures, Footer, GlEink, LineMap}
  alias ScreensConfig.V2.Departures.{Query, Section}
  alias ScreensConfig.V2.Header.Destination

  @config_fetcher Application.compile_env(:screenplay, :config_fetcher)

  @type screen_type :: :gl_eink_v2

  @spec get_existing_screens_at_places_with_pending_screens() :: %{
          places_and_screens: %{
            (place_id_app_id_pair :: String.t()) => %{
              place_id: String.t(),
              app_id: atom(),
              live_screens: %{Config.screen_id() => Screen.t()},
              pending_screens: %{Config.screen_id() => Screen.t()}
            }
          },
          etag: String.t(),
          version_id: String.t(),
          last_modified_ms: integer
        }
  def get_existing_screens_at_places_with_pending_screens do
    {pending_screens_config, metadata} =
      case PendingScreensFetch.fetch_config() do
        {:ok, config, metadata} ->
          %PendingConfig{screens: pending_screens} =
            config
            |> Jason.decode!()
            |> PendingConfig.from_json()

          {pending_screens, metadata}

        _ ->
          raise(
            "Could not fetch pending screens config in existing_screens_at_places_with_pending_screens/2"
          )
      end

    existing =
      pending_screens_config
      |> Enum.group_by(fn {_, screen} -> {screen_to_place_id(screen), screen.app_id} end)
      |> Map.new(fn {{place_id, app_id}, pending_screens_at_place} ->
        filter_fn = fn {_, screen} ->
          screen.app_id == app_id and screen_to_place_id(screen) == place_id
        end

        live_screens_of_same_type_at_place =
          for {id, screen} <- ScreensConfigCache.screens(filter_fn),
              into: %{},
              do: {id, Screen.to_json(screen)}

        pending_screens_at_place =
          for {id, screen} <- pending_screens_at_place,
              into: %{},
              do: {id, Screen.to_json(screen)}

        live_and_pending = %{
          live_screens: live_screens_of_same_type_at_place,
          pending_screens: pending_screens_at_place,
          place_id: place_id,
          app_id: app_id
        }

        json_key = "#{place_id}/#{app_id}"

        {json_key, live_and_pending}
      end)

    %{
      places_and_screens: existing,
      etag: metadata.etag,
      version_id: metadata.version_id,
      last_modified_ms: DateTime.to_unix(metadata.last_modified, :millisecond)
    }
  end

  @spec put_pending_screens(map(), screen_type(), binary()) ::
          {:error,
           :version_mismatch
           | :config_not_fetched
           | :config_not_written
           | {:duplicate_screen_ids, list()}}
          | :ok
  def put_pending_screens(places_and_screens, screen_type, version_id) do
    with {:ok, config_string} <- get_current_pending_config(version_id),
         {:ok, deserialized} <- Jason.decode(config_string),
         {published_config, _published_version_id} <- get_current_published_config(),
         {:ok, published_config_deserialized} <- Jason.decode(published_config),
         {:ok, existing_screens} <-
           check_for_duplicate_screen_ids(
             deserialized,
             places_and_screens,
             published_config_deserialized
           ) do
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

  def publish_pending_screens(place_id, app_id, hidden_from_screenplay_ids) do
    {pending_config, pending_version_id} = get_current_pending_config()

    %PendingConfig{screens: pending_screens} =
      pending_config |> Jason.decode!() |> PendingConfig.from_json()

    {published_config, published_version_id} = get_current_published_config()
    {places_and_screens_config, places_and_screens_version_id} = get_current_places_and_screens()

    {screens_to_publish, new_pending_screens} =
      pending_screens
      |> Enum.filter(fn {_screen_id, screen} -> screen.app_id == app_id end)
      |> Enum.map(fn
        {screen_id, %Screen{} = screen} ->
          if screen_id in hidden_from_screenplay_ids do
            {screen_id, %{screen | hidden_from_screenplay: true}}
          else
            {screen_id, screen}
          end
      end)
      |> Enum.split_with(&place_has_screen(&1, place_id))

    new_pending_screens_config =
      %PendingConfig{screens: Enum.into(new_pending_screens, %{})}

    new_published_screens_config = get_new_published_screens(published_config, screens_to_publish)

    new_places_and_screens_config =
      get_new_places_and_screens_config(places_and_screens_config, screens_to_publish)

    with :ok <- PendingScreensFetch.put_config(new_pending_screens_config),
         :ok <- PublishedScreensFetch.put_config(new_published_screens_config),
         :ok <- @config_fetcher.put_config(new_places_and_screens_config) do
      PendingScreensFetch.commit()
      PublishedScreensFetch.commit()
      @config_fetcher.commit()
      :ok
    else
      _ ->
        PendingScreensFetch.revert(pending_version_id)
        PublishedScreensFetch.revert(published_version_id)
        @config_fetcher.revert(places_and_screens_version_id)
        :error
    end
  end

  defp check_for_duplicate_screen_ids(
         deserialized,
         places_and_screens,
         published_config_deserialized
       ) do
    %PendingConfig{screens: existing_screens} = PendingConfig.from_json(deserialized)
    %Config{screens: published_screens} = Config.from_json(published_config_deserialized)

    {new_screen_ids, changed_screen_ids, deleted_screen_ids} =
      Enum.flat_map(places_and_screens, fn {_place_id,
                                            %{
                                              "new_pending_screens" => new_screens,
                                              "updated_pending_screens" => updated_pending_screens
                                            }} ->
        new_screens ++ updated_pending_screens
      end)
      |> Enum.reduce({[], [], []}, fn screen,
                                      {new_screen_ids, changed_screen_ids, deleted_screen_ids} =
                                        acc ->
        cond do
          screen["is_deleted"] ->
            {new_screen_ids, changed_screen_ids, [screen["screen_id"] | deleted_screen_ids]}

          # new screen
          screen["new_id"] != nil and screen["screen_id"] == nil ->
            {[screen["new_id"] | new_screen_ids], changed_screen_ids, deleted_screen_ids}

          # screen is existing but had its ID changed.
          screen["new_id"] != nil and screen["screen_id"] != nil ->
            {[screen["new_id"] | new_screen_ids], [screen["screen_id"] | changed_screen_ids],
             deleted_screen_ids}

          # existing screen is being updated but did not change IDs
          true ->
            acc
        end
      end)

    all_screen_ids =
      (Map.keys(existing_screens) -- deleted_screen_ids -- changed_screen_ids) ++
        new_screen_ids ++ Map.keys(published_screens)

    duplicate_screen_ids =
      all_screen_ids
      |> Enum.group_by(& &1)
      |> Enum.filter(fn {_string, occurrences} -> length(occurrences) > 1 end)
      |> Enum.map(&elem(&1, 0))

    if Enum.empty?(duplicate_screen_ids),
      do: {:ok, existing_screens},
      else: {:error, {:duplicate_screen_ids, duplicate_screen_ids}}
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

    updated_pending_screens =
      Enum.reject(updated_pending_screens, &is_nil(&1))

    route_id = get_route_id(:gl_eink_v2, updated_pending_screens, new_pending_screens)

    # Need to fetch platform IDs because these screens are direction specific
    platform_ids = route_pattern_mod().fetch_platform_ids_for_route_at_stop(place_id, route_id)

    # Update/remove existing pending configs.
    new_config =
      update_existing_pending_screens(place_id, platform_ids, updated_pending_screens, acc)

    # Add new pending screens
    add_new_pending_screens(place_id, platform_ids, new_pending_screens, new_config)
  end

  defp get_current_pending_config do
    case PendingScreensFetch.fetch_config() do
      {:ok, config, metadata} -> {config, metadata.version_id}
      error -> error
    end
  end

  defp get_current_pending_config(version_id) do
    # Get config directly from source so we have an up-to-date version_id
    case PendingScreensFetch.fetch_config() do
      {:ok, config, %{version_id: ^version_id}} ->
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
      %{"is_deleted" => true, "screen_id" => screen_id}, acc ->
        # Only delete screen if "is_deleted" is true AND platform is at current place.
        # If a screen ID is deleted at one place and moved to another,
        # we need to make sure we are removing the correct screen.

        Map.reject(acc, fn
          {^screen_id, %Screen{app_params: %GlEink{alerts: %Alerts{stop_id: platform_id}}}} ->
            platform_id in Tuple.to_list(platform_ids)

          _ ->
            false
        end)

      # screen_id was updated
      # Delete the old configuration and treat new ID as a new configuration
      %{"new_id" => new_id, "screen_id" => screen_id} = config, acc ->
        acc
        |> Map.delete(screen_id)
        |> Map.put(
          new_id,
          json_to_struct(config, :gl_eink_v2, place_id, platform_ids)
        )

      %{"screen_id" => screen_id} = config, acc ->
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
    |> Enum.map(fn config -> config end)
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

  defp get_current_published_config do
    case PublishedScreensFetch.fetch_config() do
      {:ok, config, version_id} -> {config, version_id}
      error -> error
    end
  end

  defp get_new_published_screens(published_config, screens_to_publish) do
    %Config{screens: published_screens, devops: devops} =
      published_config |> Jason.decode!() |> Config.from_json()

    screens =
      screens_to_publish
      |> Enum.into(%{})
      |> Map.merge(published_screens)

    %Config{screens: screens, devops: devops}
  end

  defp get_current_places_and_screens do
    case @config_fetcher.get_places_and_screens() do
      {:ok, places_and_screens_config, version_id} ->
        {places_and_screens_config, version_id}

      _ ->
        {:error, "Could not fetch places_and_screens"}
    end
  end

  defp get_new_places_and_screens_config(places_and_screens_config, new_published_screens) do
    places_and_screens_config =
      Enum.map(places_and_screens_config, &PlaceAndScreens.from_map/1)

    grouped_places_and_screens =
      new_published_screens
      |> Enum.into(%{})
      |> Enum.reject(fn {_, screen} -> screen.hidden_from_screenplay end)
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

  defp screen_to_place_id(screen = %Screen{app_id: :gl_eink_v2}) do
    screen.app_params.footer.stop_id
  end

  defp screen_to_place_id(screen = %Screen{app_id: :pre_fare_v2}) do
    screen.app_params.header.stop_id
  end

  defp screen_to_place_id(screen = %Screen{app_id: :bus_eink_v2}) do
    screen.app_params.header.stop_id
  end

  defp screen_to_place_id(screen = %Screen{app_id: :bus_shelter_v2}) do
    screen.app_params.footer.stop_id
  end

  defp screen_to_place_id(screen = %Screen{app_id: :dup_v2}) do
    screen.app_params.alerts.stop_id
  end

  defp screen_to_place_id(screen = %Screen{app_id: :gl_eink_single}) do
    screen.app_params.stop_id
  end

  defp screen_to_place_id(%Screen{app_id: solari_v1_app})
       when solari_v1_app in [:solari, :solari_large] do
    # Solari screens frequently show info for multiple stop IDs in different sections.
    # (Try `jq '.screens | map_values(select(.app_id == "solari")) | map_values(.app_params.sections | map(.query.params.stop_ids))' git/screens/priv/local.json` in your shell to see)
    # So there isn't a straightforward implementation for that case, at the moment.
    raise("screen_to_place_id/1 not implemented for app_id: #{solari_v1_app}")
  end

  defp screen_to_place_id(%Screen{app_id: app_id}),
    do: raise("screen_to_place_id/1 not implemented for app_id: #{app_id}")
end
