defmodule Screenplay.Alerts.CacheTest do
  use ExUnit.Case

  alias Screenplay.Alerts.{Alert, Cache}
  alias Screenplay.AlertsCacheHelpers

  test "It polls an API and updates the store" do
    now = DateTime.utc_now()
    AlertsCacheHelpers.seed_alerts_cache(1, now, now)
    _ = await_updated()

    assert [%Alert{id: "1"}] = Cache.alerts()
    assert %Alert{id: "1"} = Cache.alert("1")
  end

  test "It handles a failed API response and does not update the store" do
    get_json_fn = fn "/alerts", %{"include" => "routes"} ->
      :error
    end

    {:ok, fetcher} =
      start_supervised({Cache, get_json_fn: get_json_fn, update_interval_ms: 10_000})

    send(fetcher, :fetch)
    _ = await_updated()

    alerts = Cache.alerts()
    assert alerts == []
    refute Cache.alert("1")
  end

  defp await_updated do
    receive do
      :updated -> :ok
    after
      100 -> :no_msg
    end
  end
end
