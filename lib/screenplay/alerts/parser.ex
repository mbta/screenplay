defmodule Screenplay.Alerts.Parser do
  @moduledoc false

  def parse_result(%{"data" => data}) when is_list(data) do
    data
    |> Enum.map(&parse_alert/1)
    |> Enum.reject(&is_nil/1)
  end

  def parse_alert(%{"id" => id, "attributes" => attributes}) do
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
          description: description
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
end
