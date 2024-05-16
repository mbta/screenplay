defmodule Screenplay.Alerts.Cache do
  @moduledoc """
  Module used to fetch current alerts from the V3 API every 4 seconds. Each set of alerts is saved to an internal ETS table.
  """

  require Logger

  use GenServer

  alias Screenplay.Alerts.Alert
  alias Screenplay.V3Api

  @default_opts [
    get_json_fn: &V3Api.get_json/2,
    update_interval_ms: 4_000
  ]

  # Client
  def start_link(opts) do
    opts = Keyword.merge(@default_opts, opts)
    GenServer.start_link(__MODULE__, opts)
  end

  @doc """
  Retrieves an alert struct given an alert ID.
  """
  @spec alert(String.t()) :: Alert.t()
  def alert(alert_id) do
    case :ets.match(:alerts, {alert_id, :"$1"}) do
      [[alert]] -> alert
      [] -> nil
    end
  end

  @doc """
  Retrieves the full set of alerts.
  """
  @spec alerts :: list(Alert.t())
  def alerts do
    :ets.select(:alerts, [{{:_, :"$1"}, [], [:"$1"]}])
  end

  @doc """
  Retrieves all alert IDs.
  """
  @spec alert_ids :: list(Alert.id())
  def alert_ids do
    :ets.select(:alerts, [{{:"$1", :_}, [], [:"$1"]}])
  end

  # Server
  @impl true
  def init(opts) do
    :ets.new(:alerts, [:protected, :named_table, read_concurrency: true])

    get_json_fn = Keyword.get(opts, :get_json_fn)
    update_interval_ms = Keyword.get(opts, :update_interval_ms)

    schedule_fetch(update_interval_ms)

    {:ok, {get_json_fn, update_interval_ms}}
  end

  @impl true
  def handle_info(:fetch, state = {get_json_fn, update_interval_ms}) do
    case Alert.fetch(get_json_fn) do
      {:ok, alerts} ->
        alerts_to_insert = Enum.map(alerts, fn alert -> {alert.id, alert} end)

        :ets.delete_all_objects(:alerts)
        :ets.insert(:alerts, alerts_to_insert)

      :error ->
        _ = Logger.info("#{__MODULE__} error fetching alerts")
    end

    schedule_fetch(update_interval_ms)

    {:noreply, state, :hibernate}
  end

  defp schedule_fetch(ms) do
    Process.send_after(self(), :fetch, ms)
  end
end
