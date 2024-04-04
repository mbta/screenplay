defmodule Screenplay.Alerts.Cache.Fetcher do
  require Logger

  use GenServer

  alias Screenplay.V3Api
  alias Screenplay.Alerts.Alert
  alias Screenplay.Alerts.Cache.Store

  @default_opts [
    get_json_fn: &V3Api.get_json/2,
    update_interval_ms: 4_000,
    update_fn: &Store.update/1
  ]

  # Client
  def start_link(opts \\ []) do
    opts = Keyword.merge(@default_opts, opts)
    GenServer.start_link(__MODULE__, opts)
  end

  # Server
  @impl true
  def init(opts) do
    get_json_fn = Keyword.get(opts, :get_json_fn)
    update_interval_ms = Keyword.get(opts, :update_interval_ms)
    update_fn = Keyword.get(opts, :update_fn)

    schedule_fetch(update_interval_ms)

    {:ok, {get_json_fn, update_interval_ms, update_fn}}
  end

  @impl true
  def handle_info(:fetch, {get_json_fn, update_interval_ms, update_fn} = state) do
    case Alert.fetch(get_json_fn) do
      {:ok, alerts} ->
        update_fn.(alerts)

      :error ->
        _ = Logger.info("#{__MODULE__} error fetching alerts")
    end

    schedule_fetch(update_interval_ms)

    {:noreply, state, :hibernate}
  end

  def handle_info(_, state) do
    {:noreply, state}
  end

  defp schedule_fetch(ms) do
    Process.send_after(self(), :fetch, ms)
  end
end
