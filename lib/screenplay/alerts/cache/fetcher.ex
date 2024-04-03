defmodule Screenplay.Alerts.Cache.Fetcher do
  require Logger

  use GenServer

  alias Screenplay.Alerts.Alert
  alias Screenplay.Alerts.Cache.Store

  @update_interval_ms 4_000

  # Client
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts)
  end

  # Server
  @impl true
  def init(state) do
    schedule_fetch(@update_interval_ms)

    {:ok, state}
  end

  @impl true
  def handle_info(:fetch, state) do
    case Alert.fetch() do
      {:ok, alerts} ->
        Store.update(alerts)

      :error ->
        _ = Logger.info("#{__MODULE__} error fetching alerts")
    end

    schedule_fetch(@update_interval_ms)

    {:noreply, state, :hibernate}
  end

  def handle_info(_, state) do
    {:noreply, state}
  end

  defp schedule_fetch(ms) do
    Process.send_after(self(), :fetch, ms)
  end
end
