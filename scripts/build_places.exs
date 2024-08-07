#!/usr/bin/env mix run
# Script to populate `places_and_screens.json`.
require Logger

{opts, _, _} =
  System.argv()
  |> OptionParser.parse(strict: [env: :string, path: :string])

environment = Keyword.get(opts, :env)
local_path = Keyword.get(opts, :path)

if is_nil(environment) and is_nil(local_path) do
  IO.puts(:stderr, """
  Usage: mix run scripts/build_places.exs [options]

  Requires a valid `API_V3_KEY` in environment variables.

  Options:

    --env <ENV>
    Load screen configuration from S3 using the specified Screens environment.
    Requires ExAWS to have valid credentials, e.g. from `AWS_` environment variables.

    --path <PATH>
    Load screen configuration from a local file.
  """)

  exit({:shutdown, 1})
end

api_v3_key = System.fetch_env!("API_V3_KEY")
headers = [{"x-api-key", api_v3_key}]

string_is_number? = fn string ->
  case Integer.parse(string) do
    {_, ""} -> true
    _ -> false
  end
end

get_config = fn bucket, path ->
  get_operation = ExAws.S3.get_object(bucket, path)

  case ExAws.request!(get_operation) do
    %{body: body, headers: _headers, status_code: 200} ->
      {:ok, body}

    err ->
      IO.inspect(err)
      :error
  end
end

sl_route_ids = ~w[741 742 743 746 749 751]

cr_or_bus_only? = fn route_ids_or_labels ->
  Enum.all?(route_ids_or_labels, &(&1 in ["Bus", "Silver", "CR"]))
end

replace_routes_with_label = fn
  all_routes, [], _ ->
    all_routes

  all_routes, routes_to_remove, label ->
    all_routes |> Enum.reject(&(&1 in routes_to_remove)) |> Enum.concat([label])
end

format_routes = fn routes ->
  bus_routes =
    routes
    |> Enum.filter(fn
      %{"id" => id, "attributes" => %{"type" => route_type}} ->
        route_type == 3 and id not in sl_route_ids
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
    |> Enum.filter(&(&1["id"] in sl_route_ids))
    |> Enum.map(& &1["id"])

  routes
  |> Enum.map(& &1["id"])
  |> replace_routes_with_label.(bus_routes, "Bus")
  |> replace_routes_with_label.(sl_routes, "Silver")
  |> replace_routes_with_label.(cr_routes, "CR")
end

sort_routes = fn routes ->
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

# Get live config from S3
config =
  if environment do
    Logger.info("Fetching config from S3")
    {:ok, body} = get_config.("mbta-ctd-config", "screens/screens-#{environment}.json")
    body
  else
    Logger.info("Reading config from file")
    File.read!(local_path)
  end

parsed = Jason.decode!(config)

Logger.info("Formatting screens")

formatted_screens =
  parsed["screens"]
  # Certain screens (test screens, ones we've configured for non-MBTA locations) are intentionally
  # not included in Screenplay, and marked as such with the `hidden_from_screenplay` boolean.
  |> Enum.reject(&match?({_id, %{"hidden_from_screenplay" => true}}, &1))
  # This flat_map allows us to split out a single config into multiple places.
  |> Enum.flat_map(fn
    {id,
     %{
       "app_id" => "dup",
       "app_params" => %{
         "primary" => %{"sections" => [%{"stop_ids" => primary_stop_ids} | _]},
         "secondary" => %{"sections" => []}
       }
     } = stuff} ->
      primary =
        Enum.map(primary_stop_ids, fn stop_id ->
          {id, Map.put(stuff, "stop", stop_id)}
        end)

      primary

    {id,
     %{
       "app_id" => "dup",
       "app_params" => %{
         "primary" => %{"sections" => [%{"stop_ids" => primary_stop_ids} | _]},
         "secondary" => %{"sections" => [%{"stop_ids" => secondary_stop_ids} | _]}
       }
     } = stuff} ->
      primary =
        Enum.map(primary_stop_ids, fn stop_id ->
          {id, Map.put(stuff, "stop", stop_id)}
        end)

      secondary =
        Enum.map(secondary_stop_ids, fn stop_id ->
          {id, Map.put(stuff, "stop", stop_id)}
        end)

      primary ++ secondary

    {id,
     %{
       "app_id" => "dup_v2",
       "app_params" => %{
         "primary_departures" => %{
           "sections" => [%{"query" => %{"params" => %{"stop_ids" => primary_stop_ids}}} | _]
         },
         "secondary_departures" => %{"sections" => []}
       }
     } = stuff} ->
      primary =
        Enum.map(primary_stop_ids, fn stop_id ->
          {id, Map.put(stuff, "stop", stop_id)}
        end)

      primary

    {id,
     %{
       "app_id" => "dup_v2",
       "app_params" => %{
         "primary_departures" => %{
           "sections" => [%{"query" => %{"params" => %{"stop_ids" => primary_stop_ids}}} | _]
         },
         "secondary_departures" => %{
           "sections" => [%{"query" => %{"params" => %{"stop_ids" => secondary_stop_ids}}} | _]
         }
       }
     } = stuff} ->
      primary =
        Enum.map(primary_stop_ids, fn stop_id ->
          {id, Map.put(stuff, "stop", stop_id)}
        end)

      secondary =
        Enum.map(secondary_stop_ids, fn stop_id ->
          {id, Map.put(stuff, "stop", stop_id)}
        end)

      primary ++ secondary

    {id,
     %{
       "app_id" => "busway_v2",
       "app_params" => %{
         "departures" => %{"sections" => sections}
       }
     } = screen} ->
      stops =
        Enum.flat_map(sections, fn %{"query" => %{"params" => %{"stop_ids" => stop_ids}}} ->
          stop_ids
        end)
        |> Enum.map(fn stop_id ->
          {id, Map.put(screen, "stop", stop_id)}
        end)

      stops

    {id,
     %{
       "app_id" => "solari",
       "app_params" => %{
         "sections" => sections
       }
     } = stuff} ->
      stops =
        Enum.flat_map(sections, fn %{"query" => %{"params" => %{"stop_ids" => stop_ids}}} ->
          stop_ids
        end)
        |> Enum.map(fn stop_id ->
          {id, Map.put(stuff, "stop", stop_id)}
        end)

      stops

    screen ->
      [screen]
  end)

# Most screen types store their stop_id in a different place. Broke all types out in case anything changes.
live_screens =
  formatted_screens
  |> Enum.group_by(
    fn
      {_id, %{"app_id" => "bus_eink", "app_params" => %{"stop_id" => stop_id}}} ->
        stop_id

      {_id,
       %{
         "app_id" => "bus_eink_v2",
         "app_params" => %{"footer" => %{"stop_id" => stop_id}}
       }} ->
        stop_id

      {_id,
       %{
         "app_id" => "bus_shelter_v2",
         "app_params" => %{"footer" => %{"stop_id" => stop_id}}
       }} ->
        stop_id

      {_id,
       %{
         "app_id" => "pre_fare_v2",
         "app_params" => %{"header" => %{"stop_id" => stop_id}}
       }} ->
        stop_id

      {_id,
       %{
         "app_id" => "gl_eink_single",
         "app_params" => %{"stop_id" => stop_id}
       }} ->
        stop_id

      {_id,
       %{
         "app_id" => "gl_eink_double",
         "app_params" => %{"stop_id" => stop_id}
       }} ->
        stop_id

      {_id,
       %{
         "app_id" => "solari",
         "stop" => stop_id
       }} ->
        stop_id

      {_id,
       %{
         "app_id" => "busway_v2",
         "stop" => stop_id
       }} ->
        stop_id

      {_id,
       %{
         "app_id" => "gl_eink_v2",
         "app_params" => %{"footer" => %{"stop_id" => stop_id}}
       }} ->
        stop_id

      {_id,
       %{
         "app_id" => "triptych_v2",
         "app_params" => %{"train_crowding" => %{"station_id" => stop_id}}
       }} ->
        stop_id

      {_id,
       %{
         "app_id" => app_id,
         "stop" => stop_id
       }}
      when app_id in ["dup", "dup_v2"] ->
        stop_id
    end,
    fn
      {id, %{"app_id" => app_id, "disabled" => disabled}} ->
        %{id: id, type: app_id, disabled: disabled}

      {id,
       %{
         "app_id" => app_id,
         "disabled" => disabled,
         "app_params" => %{"direction_id" => direction_id}
       }} ->
        %{id: id, type: app_id, disabled: disabled, direction_id: direction_id}
    end
  )
  |> Map.new(fn {id, screen_list} ->
    one_triptych_per_platform =
      Enum.filter(screen_list, fn screen ->
        screen.type != "triptych_v2" or String.last(screen.id) == "1"
      end)

    {id, one_triptych_per_platform}
  end)

# We only need to store bus stops in places if there is a screen there.
bus_stops_with_screens =
  Enum.filter(live_screens, fn
    {stop_id, _} ->
      string_is_number?.(stop_id)
  end)

params =
  URI.encode_query(%{
    "filter[id]" => Enum.map_join(bus_stops_with_screens, ",", fn {stop_id, _} -> stop_id end)
  })

Logger.info("Fetching info for bus stops with screens")
# Get stop info for bus stops with screens
url = "https://api-v3.mbta.com/stops?#{params}"
%{status_code: 200, body: body} = HTTPoison.get!(url, headers)
bus_stops_parsed = Jason.decode!(body)
%{"data" => bus_data} = bus_stops_parsed

# Transform data into model we need
bus_stops =
  bus_data
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

Logger.info("Fetching all parent stations")
# Go get all parent stations
url = "https://api-v3.mbta.com/stops?filter[location_type]=1"
%{status_code: 200, body: body} = HTTPoison.get!(url, headers)
parsed = Jason.decode!(body)

%{"data" => data} = parsed

Logger.info("Transforming data, fetching each stop as needed")

contents =
  data
  # Transform data
  |> Enum.map(fn %{"id" => id, "attributes" => %{"name" => name}} ->
    screens_at_stop = live_screens[id]

    if not is_nil(screens_at_stop) do
      %{id: id, name: name, screens: Enum.dedup(screens_at_stop)}
    else
      %{id: id, name: name, screens: []}
    end
  end)
  |> Enum.reject(&(&1.id === "place-WML-0252"))
  # Add on bus stops
  |> Enum.concat(bus_stops)
  |> Enum.group_by(fn %{id: id} -> id end)
  |> Enum.map(fn
    {_id, [place]} ->
      place

    {_id, places} ->
      # Combine entries that reference the same stop by merging their list of screens.
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
  end)
  # Get the routes at each stop
  |> Task.async_stream(
    fn %{id: id} = stop ->
      # Not a big fan of this. Goes through each station one by one.
      # Could not figure out how to get stops with route info all in one query.
      url = "https://api-v3.mbta.com/routes?filter[stop]=#{id}"
      %{status_code: 200, body: body} = HTTPoison.get!(url, headers)
      %{"data" => data} = Jason.decode!(body)

      formatted_routes =
        data |> format_routes.() |> Enum.uniq()

      # If a place's stop shows Ferry departures from a separate nearby stop, add it here.
      formatted_routes =
        if id == "place-aqucl" do
          formatted_routes ++ ["Ferry"]
        else
          formatted_routes
        end

      Map.put(stop, :routes, sort_routes.(formatted_routes))
    end,
    ordered: false
  )
  |> Enum.map(fn {:ok, result} -> result end)

Logger.info("Fetching realtime_signs config from GitHub")

# Because the realtime_signs config lives in the realtime_signs repo, go get it so we are always reading the latest.
url = "https://api.github.com/repos/mbta/realtime_signs/contents/priv/signs.json"
%{status_code: 200, body: body} = HTTPoison.get!(url, headers)
gh_response = Jason.decode!(body)

%{"content" => signs_json_file} = gh_response
parsed = signs_json_file |> String.replace("\n", "") |> Base.decode64!() |> Jason.decode!()

# Get stop info for stations with countdown clocks
stop_ids =
  parsed
  |> Enum.flat_map(fn
    %{"source_config" => %{"sources" => sources}} ->
      sources

    %{"source_config" => [%{"sources" => top_sources}, %{"sources" => bottom_sources}]} ->
      top_sources ++ bottom_sources

    %{"sources" => sources} ->
      sources

    %{"configs" => configs} ->
      Enum.flat_map(configs, fn %{"sources" => sources} -> sources end)

    %{"top_configs" => top_configs, "bottom_configs" => bottom_configs} ->
      Enum.flat_map(top_configs, fn %{"sources" => sources} -> sources end) ++
        Enum.flat_map(bottom_configs, fn %{"sources" => sources} -> sources end)

    %{
      "top_sources" => top_sources,
      "bottom_sources" => bottom_sources
    } ->
      top_sources ++ bottom_sources
  end)
  |> Enum.map(fn %{"stop_id" => stop_id} -> stop_id end)
  |> Enum.uniq()

Logger.info("Refetching all stops")
params = URI.encode_query(%{"filter[id]" => Enum.join(stop_ids, ",")})
url = "https://api-v3.mbta.com/stops?#{params}"
%{status_code: 200, body: body} = HTTPoison.get!(url)
%{"data" => stops_parsed} = Jason.decode!(body)

stops_to_parent_station_ids =
  Enum.map(stops_parsed, fn %{"id" => id} = stop ->
    {id,
     get_in(stop, [
       "relationships",
       "parent_station",
       "data",
       "id"
     ])}
  end)
  |> Enum.into(%{})

get_first_parent_station = fn sources ->
  sources
  |> Enum.map(fn %{"stop_id" => platform_id} ->
    stops_to_parent_station_ids[platform_id]
  end)
  |> Enum.uniq()
  |> Enum.reject(&is_nil/1)
  |> hd()
end

{:ok, labels} = File.read("scripts/paess_labels.json")
labels = Jason.decode!(labels)

get_sources = fn
  %{"source_config" => %{"sources" => sources}} ->
    sources

  %{"source_config" => [%{"sources" => top_sources}, %{"sources" => bottom_sources}]} ->
    top_sources ++ bottom_sources

  %{"sources" => sources} ->
    sources

  %{"configs" => configs} ->
    Enum.flat_map(configs, & &1["sources"])

  %{"top_configs" => top_configs, "bottom_configs" => bottom_configs} ->
    Enum.flat_map(top_configs, & &1["sources"]) ++
      Enum.flat_map(bottom_configs, & &1["sources"])

  %{
    "top_sources" => top_sources,
    "bottom_sources" => bottom_sources
  } ->
    top_sources ++ bottom_sources
end

get_routes_for_pa_ess = fn config ->
  for source <- get_sources.(config),
      route <- source["routes"] || List.wrap(source["route_id"]),
      uniq: true do
    route
  end
end

pa_ess_label = fn %{"pa_ess_loc" => station_code, "text_zone" => zone} ->
  # Allow specifying `null` in `paess_labels.json` to hide a sign from Screenplay
  case Map.get(labels, "#{station_code}-#{zone}", :undefined) do
    :undefined -> nil
    nil -> :hidden
    label -> label
  end
end

Logger.info("Getting all countdown clocks")
# Get all countdown clocks
pa_ess_screens =
  parsed
  |> Enum.map(fn %{"id" => id, "pa_ess_loc" => station_code, "text_zone" => zone} = config ->
    {
      config |> get_sources.() |> get_first_parent_station.(),
      %{
        id: id,
        station_code: station_code,
        zone: zone,
        type: "pa_ess",
        label: pa_ess_label.(config),
        route_ids: get_routes_for_pa_ess.(config)
      }
    }
  end)
  |> Enum.filter(fn
    {_parent_station, %{label: :hidden}} -> false
    _ -> true
  end)
  |> Enum.group_by(&elem(&1, 0), &elem(&1, 1))

# Merge screens and pa/ess
merged_paess =
  contents
  |> Enum.map(fn %{id: id, screens: screens} = place ->
    Map.put(place, :screens, screens ++ (pa_ess_screens[id] || []))
  end)
  # Get rid of CR and Bus stops with no screens
  |> Enum.reject(fn %{routes: routes, screens: screens} ->
    cr_or_bus_only?.(routes) and Enum.empty?(screens)
  end)

Logger.info("Writing result to priv/config/places_and_screens.json")

File.write!("priv/config/places_and_screens.json", Jason.encode!(merged_paess, pretty: true), [
  :binary
])

Logger.info("Done!")
