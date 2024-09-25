defmodule Screenplay.Config.Builder do
  alias Screenplay.Config.Cache
  alias Screenplay.ScreensConfig, as: ScreensConfigStore
  alias Screenplay.Places.Place.{PaEssScreen, ShowtimeScreen}
  alias Screenplay.Routes.Route
  alias Screenplay.Stops.Stop
  alias ScreensConfig.{Screen, Solari}
  alias ScreensConfig.V2.Departures.{Query, Section}

  alias ScreensConfig.V2.{
    BusEink,
    BusShelter,
    Busway,
    Departures,
    Dup,
    Footer,
    GlEink,
    Header,
    PreFare
  }

  use GenServer

  @sl_route_ids ~w[741 742 743 746 749 751]

  @polling_interval :timer.minutes(15)
  @config_fetcher Application.compile_env(:screenplay, :config_fetcher)

  def start_link(_) do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  @impl true
  def init(state) do
    send(self(), :poll)

    {:ok, state}
  end

  @impl true
  def handle_info(:poll, state) do
    {:ok, _} =
      build()
      |> Cache.update_places_and_screens()

    Process.send_after(self(), :poll, @polling_interval)

    {:noreply, state}
  end

  defp build do
    live_showtime_screens =
      ScreensConfigStore.screens()
      |> Enum.filter(fn {_, config} -> not config.hidden_from_screenplay end)
      |> Enum.flat_map(&split_multi_place_screens/1)
      |> Enum.group_by(&get_stop_id/1, fn
        {id, %ScreensConfig.Screen{app_id: app_id, disabled: disabled}} ->
          %ShowtimeScreen{id: id, type: app_id, disabled: disabled}

        {id,
         %ScreensConfig.Screen{
           app_id: app_id,
           disabled: disabled,
           app_params: %_app{direction_id: direction_id}
         }} ->
          %ShowtimeScreen{
            id: id,
            type: app_id,
            disabled: disabled,
            direction_id: direction_id
          }
      end)

    paess_places = get_paess_places()

    Stop.fetch_all_parent_stations()
    # Transform data
    |> Enum.map(fn %{"id" => id, "attributes" => %{"name" => name}} ->
      screens_at_stop = live_showtime_screens[id]

      if is_nil(screens_at_stop) do
        %{id: id, name: name, screens: []}
      else
        %{id: id, name: name, screens: Enum.dedup(screens_at_stop)}
      end
    end)
    # Add on bus stops
    |> Enum.concat(get_bus_stops(live_showtime_screens))
    |> Enum.group_by(fn %{id: id} -> id end)
    |> Enum.map(&merge_duplicate_places/1)
    # Get the routes at each stop
    |> append_routes_to_places()
    |> Enum.map(fn %{id: id, screens: screens} = place ->
      Map.put(place, :screens, screens ++ (paess_places[id] || []))
    end)
    # Get rid of CR and Bus stops with no screens
    |> Enum.reject(fn %{routes: routes, screens: screens} ->
      cr_or_bus_only?(routes) and Enum.empty?(screens)
    end)
    |> Enum.map(&struct(PlaceAndScreens, &1))
  end

  defp append_routes_to_places(places) do
    places
    |> Task.async_stream(
      fn %{id: id} = stop ->
        # Not a big fan of this. Goes through each station one by one.
        # Could not figure out how to get stops with route info all in one query.
        data = Route.fetch_routes_for_stop(id)

        formatted_routes =
          data |> format_routes() |> Enum.uniq()

        # If a place's stop shows Ferry departures from a separate nearby stop, add it here.
        formatted_routes =
          if id == "place-aqucl" do
            formatted_routes ++ ["Ferry"]
          else
            formatted_routes
          end

        Map.put(stop, :routes, sort_routes(formatted_routes))
      end,
      ordered: false
    )
    |> Enum.map(fn {:ok, result} -> result end)
  end

  defp merge_duplicate_places({_id, [place]}), do: place
  # Combine entries that reference the same stop by merging their list of screens.
  defp merge_duplicate_places({_id, places}) do
    Enum.reduce(places, fn x, y ->
      Map.merge(x, y, fn
        # Always try to use the station id. If there isn't one, just use the id from the first entry
        :id, "place-" <> _ = v1, _v2 ->
          v1

        :id, _v1, "place-" <> _ = v2 ->
          v2

        :id, v1, _v2 ->
          v1

        :name, v1, _ ->
          v1

        # Combine the list of screens
        :screens, v1, v2 ->
          Enum.uniq(v1 ++ v2)

        _k, v1, _v2 ->
          v1
      end)
    end)
  end

  defp get_bus_stops(screens) do
    bus_stops_with_screens =
      Enum.filter(screens, fn
        {stop_id, _} ->
          string_is_number?(stop_id)
      end)

    bus_stops_with_screens
    |> Enum.map_join(",", fn {stop_id, _} -> stop_id end)
    |> Stop.fetch_stops()
    |> Enum.map(fn
      %{
        "id" => id,
        "attributes" => %{"name" => name},
        "relationships" => %{"parent_station" => %{"data" => %{"id" => parent_stop_id}}}
      } ->
        {_, screens_at_stop} =
          Enum.find(bus_stops_with_screens, [], fn {stop_id, _} -> id == stop_id end)

        %{id: parent_stop_id, name: name, screens: screens_at_stop}

      %{"id" => id, "attributes" => %{"name" => name}} ->
        {_, screens_at_stop} =
          Enum.find(bus_stops_with_screens, [], fn {stop_id, _} -> id == stop_id end)

        %{id: id, name: name, screens: screens_at_stop}
    end)
  end

  defp get_stop_id({_id, %{app_params: %app{footer: %Footer{stop_id: stop_id}}}})
       when app in [BusEink, BusShelter, GlEink] do
    stop_id
  end

  defp get_stop_id(
         {_id, %{app_params: %PreFare{header: %Header.CurrentStopId{stop_id: stop_id}}}}
       ) do
    stop_id
  end

  defp get_stop_id({_id, %{app_params: %ScreensConfig.Gl{stop_id: stop_id}}}) do
    stop_id
  end

  defp get_stop_id({_id, %{app_id: app_id, stop: stop_id}})
       when app_id in [:solari, :busway_v2, :dup_v2] do
    stop_id
  end

  defp split_multi_place_screens(
         {id,
          %Screen{
            app_params: %Dup{
              primary_departures: %Departures{
                sections: [
                  %Section{
                    query: %Query{params: %Query.Params{stop_ids: primary_stop_ids}}
                  }
                  | _
                ]
              },
              secondary_departures: %Departures{sections: []}
            }
          } = stuff}
       ) do
    primary =
      Enum.map(primary_stop_ids, fn stop_id ->
        {id, Map.put(stuff, :stop, stop_id)}
      end)

    primary
  end

  defp split_multi_place_screens(
         {id,
          %Screen{
            app_id: :dup_v2,
            app_params: %Dup{
              primary_departures: %Departures{
                sections: [
                  %Section{query: %Query{params: %Query.Params{stop_ids: primary_stop_ids}}}
                  | _
                ]
              },
              secondary_departures: %Departures{
                sections: [
                  %Section{query: %Query{params: %Query.Params{stop_ids: secondary_stop_ids}}} | _
                ]
              }
            }
          } = stuff}
       ) do
    primary =
      Enum.map(primary_stop_ids, fn stop_id ->
        {id, Map.put(stuff, :stop, stop_id)}
      end)

    secondary =
      Enum.map(secondary_stop_ids, fn stop_id ->
        {id, Map.put(stuff, :stop, stop_id)}
      end)

    primary ++ secondary
  end

  defp split_multi_place_screens(
         {id, %Screen{app_params: %Busway{departures: %Departures{sections: sections}}} = screen}
       ) do
    stops =
      Enum.flat_map(sections, fn %Section{
                                   query: %Query{params: %Query.Params{stop_ids: stop_ids}}
                                 } ->
        stop_ids
      end)
      |> Enum.map(fn stop_id ->
        {id, Map.put(screen, :stop, stop_id)}
      end)

    stops
  end

  defp split_multi_place_screens(
         {id,
          %Screen{
            app_id: :solari,
            app_params: %Solari{
              sections: sections
            }
          } = stuff}
       ) do
    stops =
      Enum.flat_map(sections, fn %Solari.Section{
                                   query: %ScreensConfig.Query{
                                     params: %ScreensConfig.Query.Params{stop_ids: stop_ids}
                                   }
                                 } ->
        stop_ids
      end)
      |> Enum.map(fn stop_id ->
        {id, Map.put(stuff, :stop, stop_id)}
      end)

    stops
  end

  defp split_multi_place_screens(screen) do
    [screen]
  end

  defp string_is_number?(string) do
    case Integer.parse(string) do
      {_, ""} -> true
      _ -> false
    end
  end

  defp cr_or_bus_only?(route_ids_or_labels) do
    Enum.all?(route_ids_or_labels, &(&1 in ["Bus", "Silver", "CR"]))
  end

  defp replace_routes_with_label(all_routes, [], _), do: all_routes

  defp replace_routes_with_label(all_routes, routes_to_remove, label) do
    all_routes |> Enum.reject(&(&1 in routes_to_remove)) |> Enum.concat([label])
  end

  defp format_routes(routes) do
    bus_routes =
      routes
      |> Enum.filter(fn
        %{"id" => id, "attributes" => %{"type" => route_type}} ->
          route_type == 3 and id not in @sl_route_ids
      end)
      |> Enum.map(& &1["id"])

    cr_routes =
      routes
      |> Enum.filter(fn
        %{"attributes" => %{"type" => route_type}} ->
          route_type == 2
      end)
      |> Enum.map(& &1["id"])

    sl_routes =
      routes
      |> Enum.filter(&(&1["id"] in @sl_route_ids))
      |> Enum.map(& &1["id"])

    routes
    |> Enum.map(& &1["id"])
    |> replace_routes_with_label(bus_routes, "Bus")
    |> replace_routes_with_label(sl_routes, "Silver")
    |> replace_routes_with_label(cr_routes, "CR")
  end

  defp sort_routes(routes) do
    route_order = [
      "Bus",
      "CR",
      "Ferry",
      "Mattapan",
      "Silver",
      "Blue",
      "Green-B",
      "Green-C",
      "Green-D",
      "Green-E",
      "Orange",
      "Red"
    ]

    Enum.sort(
      routes,
      fn a, b ->
        Enum.find_index(route_order, fn x -> x == a end) <
          Enum.find_index(route_order, fn x -> x == b end)
      end
    )
  end

  defp get_paess_places do
    signs = fetch_signs_json()
    sources = Enum.flat_map(signs, &get_paess_sources/1)

    stops_to_parent_station_ids =
      sources
      |> get_stop_id_from_sources()
      |> Enum.join(",")
      |> Stop.fetch_stops()
      |> Enum.map(fn %{"id" => id} = stop ->
        {id,
         get_in(stop, [
           "relationships",
           "parent_station",
           "data",
           "id"
         ])}
      end)
      |> Enum.into(%{})

    hidden_signs_path =
      Path.join([:code.priv_dir(:screenplay), "config", "hidden_paess_signs.json"])

    hidden_signs =
      case File.read(hidden_signs_path) do
        {:ok, contents} ->
          Jason.decode!(contents)

        _ ->
          []
      end

    labels =
      case @config_fetcher.get_paess_labels() do
        {:ok, labels} -> labels
        _ -> %{}
      end

    signs
    |> Enum.map(fn %{"id" => id, "pa_ess_loc" => station_code, "text_zone" => zone} = config ->
      sources_for_sign = get_paess_sources(config)

      {
        get_first_parent_station_from_sources(sources_for_sign, stops_to_parent_station_ids),
        %PaEssScreen{
          id: id,
          station_code: station_code,
          zone: zone,
          type: "pa_ess",
          routes: get_routes_for_paess(sources_for_sign),
          label: Map.get(labels, id)
        }
      }
    end)
    |> Enum.filter(fn
      {_parent_station, %{id: id}} -> id not in hidden_signs
    end)
    |> Enum.group_by(&elem(&1, 0), &elem(&1, 1))
  end

  defp get_stop_id_from_sources(sources) do
    sources
    |> Enum.map(fn %{"stop_id" => stop_id} -> stop_id end)
    |> Enum.uniq()
  end

  defp get_paess_sources(%{"source_config" => %{"sources" => sources}}), do: sources
  defp get_paess_sources(%{"sources" => sources}), do: sources

  defp get_paess_sources(%{
         "source_config" => [%{"sources" => top_sources}, %{"sources" => bottom_sources}]
       }),
       do: top_sources ++ bottom_sources

  defp get_paess_sources(%{"configs" => configs}), do: Enum.flat_map(configs, & &1["sources"])

  defp get_paess_sources(%{"top_configs" => top_configs, "bottom_configs" => bottom_configs}) do
    Enum.flat_map(top_configs, & &1["sources"]) ++
      Enum.flat_map(bottom_configs, & &1["sources"])
  end

  defp get_paess_sources(%{
         "top_sources" => top_sources,
         "bottom_sources" => bottom_sources
       }),
       do: top_sources ++ bottom_sources

  defp get_routes_for_paess(sources) do
    for source <- sources,
        route <- source["routes"] || List.wrap(source["route_id"]),
        uniq: true do
      %{id: route, direction_id: source["direction_id"]}
    end
  end

  defp get_first_parent_station_from_sources(sources, stops_to_parent_station_ids) do
    sources
    |> Enum.map(fn %{"stop_id" => platform_id} ->
      stops_to_parent_station_ids[platform_id]
    end)
    |> Enum.uniq()
    |> Enum.reject(&is_nil/1)
    |> hd()
  end

  defp fetch_signs_json do
    url = "https://api.github.com/repos/mbta/realtime_signs/contents/priv/signs.json"

    case HTTPoison.get(url) do
      {:ok, %{status_code: 200, body: body}} ->
        %{"content" => signs_json_file} = Jason.decode!(body)
        signs_json_file |> String.replace("\n", "") |> Base.decode64!() |> Jason.decode!()

      _ ->
        []
    end
  end
end
