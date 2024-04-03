defmodule Screenplay.Alerts.Cache.Store do
  use GenServer

  alias Screenplay.Alerts.Alert

  # Client

  def start_link(_) do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  @doc """
  Sets the ETS cache to these set of alerts.
  The previous alerts in the cache are all removed.
  """
  @spec update(list(Alert.t()) | nil) :: :ok
  def update(alerts) do
    GenServer.call(__MODULE__, {:update, alerts})
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
  @spec alerts() :: list(Alert.t())
  def alerts() do
    :ets.select(:alerts, [{{:_, :"$1"}, [], [:"$1"]}])
  end

  # Server
  @impl true
  def init(_args) do
    _ = :ets.new(:alerts, [:protected, :named_table, read_concurrency: true])
    {:ok, []}
  end

  @impl true
  def handle_call({:update, alerts}, _from, state) do
    alerts_to_insert =
      Enum.reduce(alerts, [], fn alert, acc ->
        [{alert.id, alert} | acc]
      end)

    :ets.delete_all_objects(:alerts)
    :ets.insert(:alerts, alerts_to_insert)

    {:reply, :ok, state, :hibernate}
  end
end
