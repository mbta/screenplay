defmodule Screenplay.Alerts.CacheTest do
  use ExUnit.Case

  alias Screenplay.Alerts.{Alert, Cache}

  defp alert_json(id) do
    %{
      "id" => id,
      "attributes" => %{
        "active_period" => [],
        "created_at" => nil,
        "updated_at" => nil,
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

  test "It polls an API and updates the store" do
    get_json_fn = fn "alerts", %{"include" => "routes"} ->
      {:ok, %{"data" => [alert_json("1")], "included" => []}}
    end

    {:ok, fetcher} =
      start_supervised({Cache, get_json_fn: get_json_fn, update_interval_ms: 10_000})

    send(fetcher, :fetch)
    _ = await_updated()

    assert [%Alert{id: "1"}] = Cache.alerts()
    assert %Alert{id: "1"} = Cache.alert("1")
  end

  test "It handles a failed API response and does not update the store" do
    get_json_fn = fn "alerts", %{"include" => "routes"} ->
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
