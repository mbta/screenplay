defmodule Screenplay.Alerts.State do
  @moduledoc """
  Keeps an internal state of all the Outfront Takeover Alerts which currently exist.
  """

  use GenServer

  alias Screenplay.Alerts.{Alert, State}

  @enforce_keys [:alerts, :cleared_alerts]
  defstruct @enforce_keys

  @type t :: %__MODULE__{
          alerts: %{Alert.id() => Alert.t()},
          cleared_alerts: %{Alert.id() => Alert.t()}
        }

  ### Client

  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, :ok, name: opts[:name] || __MODULE__)
  end

  @spec get_all_alerts(GenServer.server()) :: list(Alert.t())
  def get_all_alerts(pid \\ __MODULE__) do
    GenServer.call(pid, :get_all_alerts)
  end

  @spec get_alert(Alert.id()) :: Alert.t() | nil
  def get_alert(id) do
    Enum.find(get_all_alerts(), fn %{id: alert_id} -> id == alert_id end)
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

  @spec clear_alert(GenServer.server(), Alert.t()) :: :ok
  def clear_alert(pid \\ __MODULE__, alert) do
    GenServer.call(pid, {:clear_alert, alert})
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

  def remove_overlapping_alerts(
        pid \\ __MODULE__,
        %{
          "id" => id,
          "stations" => stations
        },
        user
      ) do
    GenServer.call(pid, {:remove_overlapping_alerts, id, stations, user})
  end

  @spec get_outdated_alerts() :: list(Alert.t())
  def get_outdated_alerts(now \\ DateTime.utc_now()) do
    Enum.filter(get_all_alerts(), fn %{schedule: %{end: end_dt}} ->
      DateTime.compare(now, end_dt) == :gt
    end)
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
        {:ok, %State{alerts: %{}, cleared_alerts: %{}}}
    end
  end

  @impl true
  def handle_call(:get_all_alerts, _from, state = %State{alerts: alerts}) do
    {:reply, Map.values(alerts), state}
  end

  def handle_call({:add_alert, new_alert = %{id: new_alert_id}}, _from, %State{
        alerts: old_alerts,
        cleared_alerts: cleared_alerts
      }) do
    new_state = %State{
      alerts: Map.put(old_alerts, new_alert_id, new_alert),
      cleared_alerts: cleared_alerts
    }

    :ok = save_state(new_state)
    {:reply, :ok, new_state}
  end

  def handle_call({:update_alert, id, new_alert}, _from, %State{
        alerts: old_alerts,
        cleared_alerts: cleared_alerts
      }) do
    new_state = %State{alerts: Map.put(old_alerts, id, new_alert), cleared_alerts: cleared_alerts}
    :ok = save_state(new_state)
    {:reply, :ok, new_state}
  end

  def handle_call({:clear_alert, alert = %Alert{id: id}}, _from, %State{
        alerts: old_alerts,
        cleared_alerts: cleared_alerts
      }) do
    new_state = %State{
      alerts: Map.delete(old_alerts, id),
      cleared_alerts: Map.put(cleared_alerts, id, alert)
    }

    :ok = save_state(new_state)
    {:reply, :ok, new_state}
  end

  def handle_call(
        {:remove_overlapping_alerts, id, stations, user},
        _from,
        %State{
          alerts: old_alerts,
          cleared_alerts: cleared_alerts
        }
      ) do
    # Get all active alerts and find any that share a station with the new alert (excluding self if editing)

    %{
      alerts: new_alerts,
      cleared_alerts: new_cleared_alerts,
      stations_to_delete: stations_to_delete
    } =
      old_alerts
      |> get_overlapping_stations(id, stations)
      |> Enum.reduce(
        %{alerts: old_alerts, cleared_alerts: cleared_alerts, stations_to_delete: []},
        fn
          # If existing alert has only one station, just delete it
          %Alert{id: existing_id, stations: [_single_station]} = a, acc ->
            %{
              alerts: Map.delete(acc.alerts, existing_id),
              cleared_alerts: Map.put(acc.cleared_alerts, existing_id, a),
              stations_to_delete: Enum.concat(acc.stations_to_delete, a.stations)
            }

          # If existing alert has multiple stations: remove the overlapping stations,
          # update the alert, clear the overlapping images.
          %Alert{id: existing_id, stations: _stations} = a, acc ->
            stations_no_overlap = Enum.reject(a.stations, fn station -> station in stations end)

            # Existing alert and new alert have the same station list
            if Enum.empty?(stations_no_overlap) do
              %{
                alerts: Map.delete(acc.alerts, existing_id),
                cleared_alerts: Map.put(acc.cleared_alerts, existing_id, a),
                stations_to_delete: Enum.concat(acc.stations_to_delete, a.stations)
              }
            else
              changes = %{message: a.message, stations: stations_no_overlap, schedule: a.schedule}

              %{
                alerts: Map.put(acc.alerts, existing_id, Alert.update(a, changes, user)),
                cleared_alerts: acc.cleared_alerts,
                stations_to_delete:
                  Enum.concat(acc.stations_to_delete, stations -- stations_no_overlap)
              }
            end
        end
      )

    new_state = %State{
      alerts: new_alerts,
      cleared_alerts: new_cleared_alerts
    }

    {:reply, stations_to_delete, new_state}
  end

  ### Serialize

  @spec to_json(t()) :: map()
  def to_json(%__MODULE__{alerts: alerts, cleared_alerts: cleared_alerts}) do
    serialized_alerts = alerts |> Map.values() |> Enum.map(&Alert.to_json/1)
    serialized_cleared_alerts = cleared_alerts |> Map.values() |> Enum.map(&Alert.to_json/1)
    %{"alerts" => serialized_alerts, "cleared_alerts" => serialized_cleared_alerts}
  end

  @spec from_json(map()) :: t()
  def from_json(%{"alerts" => alerts_json, "cleared_alerts" => cleared_alerts_json}) do
    alerts_map =
      alerts_json
      |> Enum.map(&Alert.from_json/1)
      |> Enum.map(fn alert = %{id: id} -> {id, alert} end)
      |> Enum.into(%{})

    cleared_alerts_map =
      cleared_alerts_json
      |> Enum.map(&Alert.from_json/1)
      |> Enum.map(fn alert = %{id: id} -> {id, alert} end)
      |> Enum.into(%{})

    %__MODULE__{alerts: alerts_map, cleared_alerts: cleared_alerts_map}
  end

  def from_json(%{"alerts" => alerts_json}) do
    alerts_map =
      alerts_json
      |> Enum.map(&Alert.from_json/1)
      |> Enum.map(fn alert = %{id: id} -> {id, alert} end)
      |> Enum.into(%{})

    %__MODULE__{alerts: alerts_map, cleared_alerts: %{}}
  end

  defp save_state(new_state) do
    fetch_module = Application.get_env(:screenplay, :alerts_fetch_module)
    fetch_module.put_state(new_state)
  end

  defp get_overlapping_stations(existing_alerts, new_id, new_stations) do
    existing_alerts
    |> Map.values()
    |> Enum.filter(fn %Alert{id: active_id, stations: active_alert_stations} ->
      (new_id == nil or new_id != active_id) and
        MapSet.intersection(
          MapSet.new(new_stations),
          MapSet.new(active_alert_stations)
        )
        |> MapSet.size() > 0
    end)
  end
end
