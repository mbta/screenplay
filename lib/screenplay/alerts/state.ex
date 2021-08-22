defmodule Screenplay.Alerts.State do
  @moduledoc """
  Keeps an internal state of all the Outfront Takeover Alerts which currently exist.
  """

  use GenServer

  alias Screenplay.Alerts.{Alert, State}

  @enforce_keys [:alerts]
  defstruct @enforce_keys

  @type t :: %__MODULE__{
          alerts: %{Alert.id() => Alert.t()}
        }

  ### Client

  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, :ok, name: opts[:name] || __MODULE__)
  end

  @spec get_all_alerts(GenServer.server()) :: list(Alert.t())
  def get_all_alerts(pid \\ __MODULE__) do
    GenServer.call(pid, :get_all_alerts)
  end

  @spec add_alert(GenServer.server(), Alert.t()) :: :ok | {:error, String.t()}
  def add_alert(pid \\ __MODULE__, alert)

  def add_alert(_pid, %Alert{id: nil}) do
    {:error, "Can't add alert with nil id"}
  end

  def add_alert(pid, new_alert) do
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

  @spec get_unused_alert_id :: Alert.id()
  def get_unused_alert_id do
    current_ids = get_all_alerts() |> Enum.map(& &1.id)

    new_id = Alert.random_id()

    if Enum.member?(current_ids, new_id) do
      get_unused_alert_id()
    else
      new_id
    end
  end

  ### Server

  @impl true
  def init(opts) do
    case opts do
      :ok ->
        fetch_module = Application.get_env(:screenplay, :alerts_fetch_module)
        {:ok, init_state} = fetch_module.get_state()

        {:ok, init_state}

      # Initialize with empty state, for testing purposes
      :empty ->
        {:ok, %State{alerts: %{}}}
    end
  end

  @impl true
  def handle_call(:get_all_alerts, _from, state = %State{alerts: alerts}) do
    {:reply, Map.values(alerts), state}
  end

  def handle_call({:add_alert, new_alert = %{id: new_alert_id}}, _from, %State{alerts: old_alerts}) do
    new_state = %State{alerts: Map.put(old_alerts, new_alert_id, new_alert)}
    :ok = save_state(new_state)
    {:reply, :ok, new_state}
  end

  def handle_call({:update_alert, id, new_alert}, _from, %State{alerts: old_alerts}) do
    new_state = %State{alerts: Map.put(old_alerts, id, new_alert)}
    :ok = save_state(new_state)
    {:reply, :ok, new_state}
  end

  def handle_call({:delete_alert, id}, _from, %State{alerts: old_alerts}) do
    new_state = %State{alerts: Map.delete(old_alerts, id)}
    :ok = save_state(new_state)
    {:reply, :ok, new_state}
  end

  ### Serialize

  @spec to_json(t()) :: map()
  def to_json(%__MODULE__{alerts: alerts}) do
    serialized_alerts = alerts |> Map.values() |> Enum.map(&Alert.to_json/1)
    %{"alerts" => serialized_alerts}
  end

  @spec from_json(map()) :: t()
  def from_json(%{"alerts" => alerts_json}) do
    alerts_map =
      alerts_json
      |> Enum.map(&Alert.from_json/1)
      |> Enum.map(fn alert = %{id: id} -> {id, alert} end)
      |> Enum.into(%{})

    %__MODULE__{alerts: alerts_map}
  end

  defp save_state(new_state) do
    fetch_module = Application.get_env(:screenplay, :alerts_fetch_module)
    fetch_module.put_state(new_state)
  end
end
