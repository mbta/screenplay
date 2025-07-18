defmodule Screenplay.Places.Builder do
  @moduledoc """
  Module used to build the Screenplay config from
  Showtime and PA/ESS screen configurations. Final configuration is
  saved to a Nebulex cache.

  Config is rebuilt periodically.
  """

  alias Screenplay.Places
  alias Screenplay.Places.Place
  alias Screenplay.Places.Place.{PaEssScreen, ShowtimeScreen}
  alias Screenplay.ScreensConfig, as: ScreensConfigStore
  alias ScreensConfig.{Alerts, Departures, Footer, Header, MultiStopAlerts, Screen}
  alias ScreensConfig.Departures.{Query, Section}
  alias ScreensConfig.Screen.{Dup, Elevator}

  use GenServer

  @sl_route_ids ~w[741 742 743 746 749 751]

  @polling_interval :timer.minutes(5)
  @config_fetcher Application.compile_env!(:screenplay, :config_fetcher)
  @stops_mod Application.compile_env(:screenplay, :stops_mod, Screenplay.Stops.Stop)
  @routes_mod Application.compile_env(:screenplay, :routes_mod, Screenplay.Routes.Route)
  @facilities_mod Application.compile_env(
                    :screenplay,
                    :facilities_mod,
                    Screenplay.Facilities.Facility
                  )
  @github_api_client Application.compile_env(
                       :screenplay,
                       :github_api_client,
                       Screenplay.GithubApi.Client
                     )

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(state) do
    update_and_schedule()
    {:ok, state}
  end

  @impl true
  def handle_info(:build, state) do
    update_and_schedule()
    {:noreply, state}
  end

  defp update_and_schedule do
    {:ok, _} =
      build()
      |> Places.update()

    Process.send_after(self(), :build, @polling_interval)
  end

  defp build do
    live_showtime_screens = get_showtime_screens()
    paess_places = get_paess_places()
    {:ok, parent_stations} = @stops_mod.fetch_all_parent_stations()

    # All parent stations should be displayed in Screenplay,
    # but we only want to show bus stops that have screens
    parent_stations
    # Add showtime screens to parent stations
    |> Enum.map(fn %{"id" => id, "attributes" => %{"name" => name}} ->
      screens_at_stop = live_showtime_screens[id]

      if is_nil(screens_at_stop) do
        %{id: id, name: name, screens: []}
      else
        %{id: id, name: name, screens: Enum.uniq(screens_at_stop)}
      end
    end)
    # Add on bus stops
    |> Enum.concat(get_child_stops(live_showtime_screens))
    |> Enum.group_by(fn %{id: id} -> id end)
    |> Enum.map(&merge_duplicate_places/1)
    # Get the routes at each stop
    |> append_routes_to_places()
    # Add on PA/ESS signs
    |> Enum.map(fn %{id: id, screens: screens} = place ->
      Map.put(place, :screens, screens ++ (paess_places[id] || []))
    end)
    # Get rid of CR and Bus stops with no screens
    |> Enum.reject(fn %{routes: routes, screens: screens} ->
      cr_or_bus_only?(routes) and Enum.empty?(screens)
    end)
    |> Enum.map(&struct(Place, &1))
  end

  defp get_showtime_screens do
    ScreensConfigStore.screens()
    |> Enum.reject(&hidden_screen?/1)
    |> Enum.flat_map(fn {id, screen} -> screen |> stop_ids() |> Enum.map(&{&1, {id, screen}}) end)
    |> Enum.group_by(&elem(&1, 0), fn
      {_stop_id,
       {id,
        %Screen{app_id: app_id, disabled: disabled, app_params: app_params, location: location}}} ->
        direction_id =
          case app_params do
            %_app{direction_id: direction_id} -> direction_id
            _ -> nil
          end

        %ShowtimeScreen{
          id: id,
          type: app_id,
          disabled: disabled,
          direction_id: direction_id,
          location: location || ""
        }
    end)
  end

  defp hidden_screen?({_id, %Screen{app_id: :on_bus_v2}}), do: true
  defp hidden_screen?({_id, %Screen{hidden_from_screenplay: true}}), do: true
  defp hidden_screen?(_), do: false

  defp append_routes_to_places(places) do
    places
    |> Task.async_stream(
      fn %{id: id} = stop ->
        # Not a big fan of this. Goes through each station one by one.
        # Could not figure out how to get stops with route info all in one query.
        {:ok, data} = @routes_mod.fetch_routes_for_stop(id)

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

  defp get_child_stops(screens) do
    bus_stops_with_screens =
      Enum.filter(screens, fn
        {stop_id, _} ->
          string_is_number?(stop_id)
      end)

    {:ok, parent_stops} =
      bus_stops_with_screens
      |> Enum.map(fn {stop_id, _} -> stop_id end)
      |> @stops_mod.fetch_by_ids()

    Enum.map(parent_stops, fn
      %{
        "id" => id,
        "attributes" => %{"name" => name},
        "relationships" => %{"parent_station" => %{"data" => %{"id" => parent_stop_id}}}
      } ->
        {_, screens_at_stop} =
          Enum.find(bus_stops_with_screens, {nil, []}, fn {stop_id, _} -> id == stop_id end)

        %{id: parent_stop_id, name: name, screens: screens_at_stop}

      %{"id" => id, "attributes" => %{"name" => name}} ->
        {_, screens_at_stop} =
          Enum.find(bus_stops_with_screens, {nil, []}, fn {stop_id, _} -> id == stop_id end)

        %{id: id, name: name, screens: screens_at_stop}
    end)
  end

  defp stop_ids(%Screen{app_params: %Elevator{elevator_id: elevator_id}}) do
    {:ok, facility} = @facilities_mod.fetch(elevator_id)
    %{"relationships" => %{"stop" => %{"data" => %{"id" => stop_id}}}} = facility
    [stop_id]
  end

  defp stop_ids(%Screen{app_params: %_app{header: %Header.StopId{stop_id: stop_id}}})
       when not is_nil(stop_id),
       do: [stop_id]

  defp stop_ids(%Screen{app_params: %_app{footer: %Footer{stop_id: stop_id}}})
       when not is_nil(stop_id),
       do: [stop_id]

  defp stop_ids(%Screen{app_params: %_app{alerts: %Alerts{stop_id: stop_id}}})
       when not is_nil(stop_id),
       do: [stop_id]

  defp stop_ids(%Screen{app_params: %_app{alerts: %MultiStopAlerts{stop_ids: stop_ids}}}),
    do: stop_ids

  defp stop_ids(%Screen{app_params: %_app{departures: %Departures{sections: sections}}}),
    do: stop_ids_from_sections(sections)

  defp stop_ids(%Screen{
         app_params: %Dup{
           primary_departures: %Departures{sections: primary_sections},
           secondary_departures: %Departures{sections: secondary_sections}
         }
       }),
       do: stop_ids_from_sections(primary_sections ++ secondary_sections)

  defp stop_ids_from_sections(sections) do
    sections
    |> Enum.flat_map(fn %Section{query: %Query{params: %Query.Params{stop_ids: stop_ids}}} ->
      stop_ids
    end)
    |> Enum.uniq()
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

    Enum.sort_by(routes, fn route -> Enum.find_index(route_order, &(&1 == route)) end)
  end

  defp get_paess_places do
    signs = fetch_signs_json()
    sources = Enum.flat_map(signs, &get_paess_sources/1)

    {:ok, parent_stops} =
      sources
      |> get_stop_id_from_sources()
      |> @stops_mod.fetch_by_ids()

    stops_to_parent_station_ids =
      parent_stops
      |> Enum.map(fn %{"id" => id} = stop ->
        {id, stop["relationships"]["parent_station"]["data"]["id"] || id}
      end)
      |> Enum.into(%{})

    hidden_signs = get_hidden_signs()

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

  # sobelow_skip ["Traversal.FileModule"]
  defp get_hidden_signs do
    hidden_signs_path =
      Path.join([:code.priv_dir(:screenplay), "config", "hidden_paess_signs.json"])

    case File.read(hidden_signs_path) do
      {:ok, contents} ->
        Jason.decode!(contents)

      _ ->
        []
    end
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
    |> List.first()
  end

  defp fetch_signs_json do
    case @github_api_client.get_file_contents_from_repo("realtime_signs", "priv/signs.json") do
      {:ok, contents} ->
        contents

      _ ->
        []
    end
  end
end
