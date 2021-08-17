defmodule Screenplay.Alerts.State do
  @moduledoc """
  Keeps an internal state of all the Outfront Takeover Alerts which currently exist.
  """

  use GenServer

  alias Screenplay.Alerts.{Alert, State}

  @enforce_keys [:alerts, :next_id]
  defstruct @enforce_keys

  @type t :: %__MODULE__{
          alerts: %{Alert.id() => Alert.t()},
          next_id: non_neg_integer()
        }

  ### Client

  def start_link([]) do
    GenServer.start_link(__MODULE__, :ok, name: __MODULE__)
  end

  @spec get_all_alerts(GenServer.server()) :: list(Alert.t())
  def get_all_alerts(pid \\ __MODULE__) do
    GenServer.call(pid, :get_all_alerts)
  end

  @spec add_alert(GenServer.server(), Alert.t()) :: :ok
  def add_alert(pid \\ __MODULE__, new_alert) do
    GenServer.call(pid, {:add_alert, new_alert})
  end

  @spec update_alert(GenServer.server(), Alert.id(), Alert.t()) :: :ok
  def update_alert(pid \\ __MODULE__, id, new_alert) do
    GenServer.call(pid, {:update_alert, id, new_alert})
  end

  @spec delete_alert(GenServer.server(), Alert.id()) :: :ok
  def delete_alert(pid \\ __MODULE__, id) do
    GenServer.call(pid, {:delete_alert, id})
  end

  ### Server

  @impl true
  def init(:ok) do
    # A later PR will fetch init_state from S3
    init_state = %State{alerts: %{}, next_id: 0}

    {:ok, init_state}
  end

  @impl true
  def handle_call(:get_all_alerts, _from, %State{alerts: alerts} = state) do
    {:reply, Map.values(alerts), state}
  end

  def handle_call({:add_alert, new_alert}, _from, %State{alerts: old_alerts, next_id: next_id}) do
    new_alerts = Map.put(old_alerts, next_id, %{new_alert | id: next_id})
    new_state = %State{alerts: new_alerts, next_id: next_id + 1}
    {:reply, :ok, new_state}
  end

  def handle_call({:update_alert, id, new_alert}, _from, %State{alerts: old_alerts} = state) do
    new_alerts = Map.put(old_alerts, id, %{new_alert | id: id})
    {:reply, :ok, %{state | alerts: new_alerts}}
  end

  def handle_call({:delete_alert, id}, _from, %State{alerts: old_alerts} = state) do
    new_alerts = Map.delete(old_alerts, id)
    {:reply, :ok, %{state | alerts: new_alerts}}
  end
end
