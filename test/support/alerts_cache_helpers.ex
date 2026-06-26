defmodule Screenplay.AlertsCacheHelpers do
  @moduledoc """
  Helper functions for seeding Screenplay.Alerts.Cache.
  """

  use ExUnit.CaseTemplate

  alias Screenplay.Alerts.Cache, as: AlertsCache

  def seed_alerts_cache(num_alerts, start_dt, end_dt, now_fn \\ nil) do
    # Alerts whose end time occurs before "now" will be filtered out by
    # the `AlertsCache`. Have `now_fn` default to just before the end
    # time of the new Alert to prevent filtering by default in tests
    now_fn = now_fn || fn -> DateTime.add(end_dt, -1, :minute) end

    get_json_fn = fn "/alerts", %{"include" => "routes"} ->
      {:ok,
       %{
         "data" =>
           Enum.map(
             1..num_alerts,
             &alert_json(
               Integer.to_string(&1),
               start_dt,
               end_dt
             )
           ),
         "included" => []
       }}
    end

    {:ok, fetcher} = start_supervised({AlertsCache, get_json_fn: get_json_fn, now_fn: now_fn})
    send(fetcher, :fetch)
  end

  defp alert_json(id, start_dt, end_dt) do
    start_iso8601 = DateTime.to_iso8601(start_dt)
    end_iso8601 = DateTime.to_iso8601(end_dt)

    %{
      "id" => id,
      "attributes" => %{
        "active_period" => [
          %{"start" => start_iso8601, "end" => end_iso8601}
        ],
        "created_at" => start_iso8601,
        "updated_at" => start_iso8601,
        "cause" => nil,
        "effect" => nil,
        "header" => nil,
        "informed_entity" => [],
        "lifecycle" => nil,
        "severity" => nil,
        "timeframe" => nil,
        "url" => nil,
        "description" => nil
      }
    }
  end
end
