# Script to gather screenplay places and screens.
#
# Example usage: API_V3_KEY=<your_key_here> mix run scripts/places_and_screens.exs

api_v3_key = System.get_env("API_V3_KEY")
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

cr_or_bus_only? = fn routes ->
  Enum.all?(routes, fn route ->
    route == "CR" or route == "Bus"
  end)
end

format_bus_routes = fn routes ->
  if Enum.any?(routes, &string_is_number?.(&1)) do
    routes |> Enum.reject(&string_is_number?.(&1)) |> Enum.concat(["Bus"])
  else
    routes
  end
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
{:ok, file} = get_config.("mbta-ctd-config", "screens/screens-prod.json")
parsed = Jason.decode!(file)

# Most screen types store their stop_id in a different place. Broke all types out in case anything changes.
live_screens =
  parsed["screens"]
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
         "app_params" => %{"station_name" => stop_id}
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
         "app_id" => "dup",
         "app_params" => %{"primary" => %{"sections" => [%{"stop_ids" => stop_ids} | _]}}
       }} ->
        hd(stop_ids)
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

# Get stop info for bus stops with screens
url = "https://api-v3.mbta.com/stops?#{params}"
%{status_code: 200, body: body} = HTTPoison.get!(url, headers)
bus_stops_parsed = Jason.decode!(body)
%{"data" => bus_data} = bus_stops_parsed

# Transform data into model we need
bus_stops =
  bus_data
  |> Enum.map(fn %{"id" => id, "attributes" => %{"name" => name}} ->
    {_, screens_at_stop} =
      Enum.find(bus_stops_with_screens, [], fn {stop_id, _} -> id == stop_id end)

    %{id: id, name: name, screens: screens_at_stop}
  end)

# Go get all parent stations
url = "https://api-v3.mbta.com/stops?filter[location_type]=1"
%{status_code: 200, body: body} = HTTPoison.get!(url, headers)
parsed = Jason.decode!(body)

%{"data" => data} = parsed

contents =
  data
  # Transform data
  |> Enum.map(fn %{"id" => id, "attributes" => %{"name" => name}} ->
    screens_at_stop = live_screens[id]

    if not is_nil(screens_at_stop) do
      %{id: id, name: name, screens: screens_at_stop}
    else
      %{id: id, name: name, screens: []}
    end
  end)
  # Add on bus stops
  |> Enum.concat(bus_stops)
  # Just in case
  |> Enum.uniq()
  # Get the routes at each stop
  |> Enum.map(fn %{id: id} = stop ->
    # Not a big fan of this. Goes through each station one by one.
    # Could not figure out how to get stops with route info all in one query.
    url = "https://api-v3.mbta.com/routes?filter[stop]=#{id}"
    %{status_code: 200, body: body} = HTTPoison.get!(url, headers)
    %{"data" => data} = Jason.decode!(body)

    if id == "place-sstat" do
      IO.inspect(data)
    end

    routes =
      data
      |> Enum.map(fn
        %{"attributes" => %{"short_name" => "SL" <> _}} -> "Silver"
        %{"id" => "CR-" <> _} -> "CR"
        # Bus edge case I found in the data.
        %{"id" => "34E"} -> "Bus"
        %{"id" => route_id} -> route_id
      end)
      |> Enum.dedup()
      |> format_bus_routes.()
      |> sort_routes.()

    Map.put(stop, :routes, routes)
  end)
  # Get rid of CR stops with no screens
  |> Enum.reject(fn %{id: id, routes: routes, screens: screens} ->
    (String.starts_with?(id, "place-CM-") or cr_or_bus_only?.(routes)) and length(screens) == 0
  end)

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
    %{"source_config" => [both]} ->
      Enum.map(both, fn %{"stop_id" => stop_id} -> stop_id end)

    %{"source_config" => [top, bottom]} ->
      Enum.map(top, fn %{"stop_id" => stop_id} -> stop_id end) ++
        Enum.map(bottom, fn %{"stop_id" => stop_id} -> stop_id end)
  end)
  |> Enum.uniq()

params = URI.encode_query(%{"filter[id]" => Enum.join(stop_ids, ",")})
url = "https://api-v3.mbta.com/stops?#{params}"
%{status_code: 200, body: body} = HTTPoison.get!(url)
stops_parsed = Jason.decode!(body)

%{"data" => data} = stops_parsed

platform_to_stop_map =
  Enum.map(data, fn %{"id" => id} = stop ->
    {id,
     get_in(stop, [
       "relationships",
       "parent_station",
       "data",
       "id"
     ])}
  end)
  |> Enum.into(%{})

# Get all countdown clocks
pa_ess_screens =
  parsed
  |> Enum.group_by(
    fn %{"source_config" => source_config} ->
      case source_config do
        [both] ->
          Enum.map(both, fn %{"stop_id" => platform_id} -> platform_to_stop_map[platform_id] end)

        [top, bottom] ->
          Enum.map(top, fn %{"stop_id" => platform_id} -> platform_to_stop_map[platform_id] end) ++
            Enum.map(bottom, fn %{"stop_id" => platform_id} ->
              platform_to_stop_map[platform_id]
            end)
      end
      |> Enum.uniq()
      |> Enum.reject(&is_nil/1)
      |> hd()
    end,
    fn %{
         "id" => id,
         "pa_ess_loc" => station_code,
         "text_zone" => zone
       } ->
      %{id: id, station_code: station_code, zone: zone, type: "pa_ess"}
    end
  )
  |> Enum.into(%{})

# Merge screens and pa/ess
merged =
  Enum.map(contents, fn %{id: id, screens: screens} = place ->
    Map.put(place, :screens, screens ++ (pa_ess_screens[id] || []))
  end)
  |> Enum.sort_by(& &1.name)

File.write!("priv/places_and_screens.json", Jason.encode!(merged), [:binary])
