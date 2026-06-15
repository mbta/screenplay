defmodule Screenplay.EmergencyTakeovers do
  @moduledoc """
  Module
  """

  import Ecto.Query

  alias Screenplay.EmergencyTakeoverTool.EmergencyTakeover
  alias Screenplay.Repo
  alias Screenplay.Util

  @type alert_update :: %{
          message: EmergencyTakeover.message(),
          stations: list(EmergencyTakeover.station()),
          schedule: EmergencyTakeover.schedule()
        }

  @spec get_active_and_past_alerts() :: {[map()], [map()]}
  def get_active_and_past_alerts do
    EmergencyTakeover
    |> order_by([alert], desc: alert.start_time)
    |> Repo.all()
    |> Enum.map(&to_json/1)
    |> Enum.group_by(fn %{"cleared_at" => cleared_at} ->
      if cleared_at, do: :past, else: :current
    end)
    |> then(fn groups -> {groups[:current] || [], groups[:past] || []} end)
  end

  @spec get_alert(integer()) :: map() | nil
  def get_alert(id) do
    Repo.get(EmergencyTakeover, id)
  end

  @spec get_overlapping_alerts(list(String.t()), integer() | nil) :: list(EmergencyTakeover.t())
  def get_overlapping_alerts(new_stations, alert_id) do
    # Find all active alerts that have any station overlap with the new alert,
    # excluding the alert being edited when editing an existing alert.
    EmergencyTakeover
    |> where(
      [alert],
      is_nil(alert.cleared_at) and alert.id != ^alert_id and
        fragment("? && ?", alert.stations, ^new_stations)
    )
    |> Repo.all()
  end

  @spec get_active_alerts() :: [map()]
  def get_active_alerts do
    EmergencyTakeover
    |> where([alert], is_nil(alert.cleared_at))
    |> order_by([alert], desc: alert.start_time)
    |> Repo.all()
    |> Enum.map(&to_json/1)
  end

  @spec get_active_alerts_non_json() :: [EmergencyTakeover.t()]
  def get_active_alerts_non_json do
    EmergencyTakeover
    |> where([alert], is_nil(alert.cleared_at))
    |> order_by([alert], desc: alert.start_time)
    |> Repo.all()
  end

  @spec get_outdated_alerts() :: [EmergencyTakeover.t()]
  def get_outdated_alerts do
    now = DateTime.utc_now()

    EmergencyTakeover
    |> where(
      [alert],
      is_nil(alert.cleared_at) and not is_nil(alert.end_time) and alert.end_time < ^now
    )
    |> Repo.all()
  end

  @spec create_alert(map()) :: {:ok, EmergencyTakeover.t()} | {:error, Ecto.Changeset.t()}
  def create_alert(params) do
    %EmergencyTakeover{}
    |> EmergencyTakeover.changeset(params)
    |> Repo.insert()
  end

  @spec edit_alert(integer(), alert_update(), String.t()) :: :ok | :error
  def edit_alert(id, changes, user) do
    alert = Repo.get(EmergencyTakeover, id)

    changeset =
      EmergencyTakeover.changeset(alert, %{
        message: changes.message,
        stations: changes.stations,
        start_time: changes.schedule.start_time,
        end_time: changes.schedule.end_time,
        edited_by: user
      })

    case Repo.update(changeset) do
      {:ok, _updated_alert} ->
        :ok

      {:error, _changeset} ->
        :error
        # TODO:  Handle validation errors
    end
  end

  @spec clear_alert(EmergencyTakeover.t(), String.t()) :: :ok | :error
  def clear_alert(alert, user) do
    changeset =
      EmergencyTakeover.changeset(alert, %{
        cleared_by: user,
        cleared_at: DateTime.utc_now()
      })

    case Repo.update(changeset) do
      {:ok, _updated_alert} ->
        :ok

      {:error, _changeset} ->
        :error
    end
  end

  @spec to_json(EmergencyTakeover.t()) :: map()
  def to_json(%EmergencyTakeover{} = alert) do
    %{
      "id" => to_string(alert.id),
      "message" => stringify_keys(alert.message),
      "stations" => alert.stations,
      "schedule" => %{
        "start" => serialize_datetime(alert.start_time),
        "end" => serialize_datetime(alert.end_time)
      },
      "created_by" => Util.trim_username(alert.created_by),
      "edited_by" => Util.trim_username(alert.edited_by),
      "cleared_at" => serialize_datetime(alert.cleared_at),
      "cleared_by" => Util.trim_username(alert.cleared_by)
    }
  end

  defp serialize_datetime(nil), do: nil
  defp serialize_datetime(dt = %DateTime{}), do: DateTime.to_iso8601(dt)

  defp stringify_keys(value) when is_map(value) do
    value
    |> Enum.map(fn {k, v} -> {to_string(k), stringify_keys(v)} end)
    |> Enum.into(%{})
  end

  defp stringify_keys(value) when is_list(value), do: Enum.map(value, &stringify_keys/1)
  defp stringify_keys(value), do: value

  @spec remove_overlapping_alerts(integer() | nil, list(String.t()), String.t()) ::
          list(String.t())
  def remove_overlapping_alerts(id, new_stations, user) do
    get_overlapping_alerts(new_stations, id)
    |> Enum.reduce([], fn alert, acc ->
      stations_no_overlap =
        Enum.reject(alert.stations, fn station -> station in new_stations end)

      if Enum.empty?(stations_no_overlap) do
        # Clear entire alert if all the existing alert's stations overlap with the new alert
        :ok = clear_alert(alert, user)
        acc
      else
        :ok =
          edit_alert(
            alert.id,
            %{
              stations: stations_no_overlap,
              message: alert.message,
              schedule: %{
                start_time: alert.start_time,
                end_time: alert.end_time
              }
            },
            user
          )

        # Return the full list of stations in existing alerts to have their images cleared, since even if some stations are removed from the alert, the alert might still have takeover images for those stations that need to be cleared.
        acc ++ (alert.stations -- stations_no_overlap)
      end
    end)
  end
end
