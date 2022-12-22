defmodule Screenplay.Alerts.Parser do
  @moduledoc false

  def parse_result(%{"data" => data, "included" => included}) when is_list(data) do
    data
    |> Enum.map(&parse_alert(&1, included))
    |> Enum.reject(&is_nil/1)
  end

  def parse_alert(alert = %{"id" => id, "attributes" => attributes}, included) do
    relationships = Map.get(alert, "relationships")

    case attributes do
      %{
        "active_period" => active_period,
        "created_at" => created_at,
        "updated_at" => updated_at,
        "cause" => cause,
        "effect" => effect,
        "header" => header,
        "informed_entity" => informed_entities,
        "lifecycle" => lifecycle,
        "severity" => severity,
        "timeframe" => timeframe,
        "url" => url,
        "description" => description
      } ->
        %Screenplay.Alerts.Alert{
          id: id,
          cause: cause,
          effect: effect,
          severity: severity,
          header: header,
          informed_entities: parse_informed_entities(informed_entities),
          active_period: parse_and_sort_active_periods(active_period),
          lifecycle: lifecycle,
          timeframe: timeframe,
          created_at: parse_time(created_at),
          updated_at: parse_time(updated_at),
          url: url,
          description: description,
          affected_list: get_affected_list(relationships, included)
        }

      _ ->
        nil
    end
  end

  defp parse_informed_entities(ies) do
    Enum.map(ies, &parse_informed_entity/1)
  end

  defp parse_informed_entity(ie) do
    %{
      stop: get_in(ie, ["stop"]),
      route: get_in(ie, ["route"]),
      route_type: get_in(ie, ["route_type"]),
      direction_id: get_in(ie, ["direction_id"]),
      facility: get_in(ie, ["facility"])
    }
  end

  defp parse_and_sort_active_periods(periods) do
    periods
    |> Enum.map(&parse_active_period/1)
    |> Enum.sort_by(fn {start, _} -> start end, fn dt1, dt2 ->
      DateTime.compare(dt1, dt2) in [:lt, :eq]
    end)
  end

  defp parse_active_period(%{"start" => nil, "end" => end_str}) do
    end_t = parse_time(end_str)
    {nil, end_t}
  end

  defp parse_active_period(%{"start" => start_str, "end" => nil}) do
    start_t = parse_time(start_str)
    {start_t, nil}
  end

  defp parse_active_period(%{"start" => start_str, "end" => end_str}) do
    start_t = parse_time(start_str)
    end_t = parse_time(end_str)
    {start_t, end_t}
  end

  defp parse_time(nil), do: nil

  defp parse_time(s) do
    {:ok, time, _} = DateTime.from_iso8601(s)
    time
  end

  defp get_affected_list(nil, _), do: [:access]

  defp get_affected_list(%{"routes" => %{"data" => routes}}, included) do
    route_map =
      Enum.map(included, fn
        %{"id" => id, "attributes" => %{"short_name" => "SL" <> _}} ->
          {id, "silver"}

        %{"id" => id, "attributes" => %{"type" => route_type}} ->
          {id, route_type}
      end)
      |> Enum.into(%{})

    affected_list =
      Enum.map(routes, fn %{"id" => id} ->
        case Map.get(route_map, id) do
          nil -> nil
          route_type when route_type in [0, 1] -> String.downcase(id)
          2 -> "cr"
          3 -> "bus"
          4 -> "ferry"
          route_type -> String.downcase(route_type)
        end
      end)
      |> Enum.reject(&is_nil/1)
      |> Enum.uniq()

    # If all GL branches are affected, replace with string for entire GL.
    if MapSet.subset?(
         MapSet.new(["green-b", "green-c", "green-d", "green-e"]),
         MapSet.new(affected_list)
       ) do
      Enum.reject(affected_list, &String.starts_with?(&1, "green-")) ++ ["green"]
    else
      affected_list
    end
  end
end
