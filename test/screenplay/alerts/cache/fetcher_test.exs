defmodule Screenplay.Alerts.Cache.FetcherTest do
  use ExUnit.Case

  alias Screenplay.Alerts.Alert
  alias Screenplay.Alerts.Cache.Fetcher

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

  test "It periodically polls an API and updates the store" do
    {:ok, fake_store} = Agent.start_link(fn -> [] end)

    update_fn = fn alerts ->
      Agent.update(fake_store, fn updates -> [alerts | updates] end)
      send(self(), :updated)
    end

    get_json_fn = fn "alerts", %{"include" => "routes"} ->
      {:ok, %{"data" => [alert_json("1")], "included" => []}}
    end

    {:ok, fetcher} =
      Fetcher.start_link(
        get_json_fn: get_json_fn,
        update_fn: update_fn,
        update_interval_ms: 10_000
      )

    send(fetcher, :fetch)
    send(fetcher, :fetch)
    send(fetcher, :fetch)
    _ = await_updated()
    _ = await_updated()
    _ = await_updated()

    alerts = Agent.get(fake_store, & &1)

    assert [[%Alert{id: "1"}], [%Alert{id: "1"}], [%Alert{id: "1"}]] = alerts
  end

  test "It handles a failed API response and does not update the store" do
    {:ok, fake_store} = Agent.start_link(fn -> [] end)

    update_fn = fn alerts ->
      Agent.update(fake_store, fn updates -> [alerts | updates] end)
      send(self(), :updated)
    end

    get_json_fn = fn "alerts", %{"include" => "routes"} ->
      :error
    end

    {:ok, fetcher} =
      Fetcher.start_link(
        get_json_fn: get_json_fn,
        update_fn: update_fn,
        update_interval_ms: 10_000
      )

    send(fetcher, :fetch)
    send(fetcher, :fetch)
    _ = await_updated()
    _ = await_updated()

    alerts = Agent.get(fake_store, & &1)
    assert alerts == []
  end

  defp await_updated do
    receive do
      :updated -> :ok
    after
      100 -> :no_msg
    end
  end
end
