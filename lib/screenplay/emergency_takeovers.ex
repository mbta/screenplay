defmodule Screenplay.EmergencyTakeovers do
  @moduledoc """
    Context module for managing Emergency Takeover Alerts.
  """

  import Ecto.Query

  alias Screenplay.EmergencyTakeoverTool.EmergencyTakeover
  alias Screenplay.Repo
  alias Screenplay.Util

  @type alert_update :: %{
          message: EmergencyTakeover.message(),
          station_ids: list(EmergencyTakeover.station_id()),
          schedule: EmergencyTakeover.schedule()
        }

  @spec get_alerts() :: {[EmergencyTakeover.t()], [EmergencyTakeover.t()]}
  def get_alerts do
    EmergencyTakeover
    |> order_by(desc: :start_time)
    |> Repo.all()
    |> Enum.group_by(fn %{cleared_at: cleared_at} ->
      if cleared_at, do: :past, else: :active
    end)
    |> then(fn groups -> {groups[:active] || [], groups[:past] || []} end)
  end

  @spec get_alert(integer()) :: EmergencyTakeover.t() | nil
  def get_alert(id) do
    Repo.get(EmergencyTakeover, id)
  end

  @spec get_active_alerts() :: [EmergencyTakeover.t()]
  def get_active_alerts do
    EmergencyTakeover
    |> where([alert], is_nil(alert.cleared_at))
    |> order_by(desc: :start_time)
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

  @spec create_alert(EmergencyTakeover.t()) ::
          {:ok, EmergencyTakeover.t()} | {:error, Ecto.Changeset.t()}
  def create_alert(alert) do
    %EmergencyTakeover{}
    |> EmergencyTakeover.changeset(Map.from_struct(alert))
    |> Repo.insert()
  end

  @spec update_alert(integer(), alert_update(), String.t()) ::
          {:ok, EmergencyTakeover.t()} | {:error, String.t()}
  def update_alert(id, changes, user) do
    alert = Repo.get(EmergencyTakeover, id)

    changeset =
      EmergencyTakeover.changeset(alert, %{
        message: changes.message,
        station_ids: changes.station_ids,
        start_time: changes.schedule.start_time,
        end_time: changes.schedule.end_time,
        edited_by: user
      })

    case Repo.update(changeset) do
      {:ok, updated_alert} ->
        {:ok, updated_alert}

      {:error, changeset} ->
        {:error,
         "Failed to edit alert #{alert.id} with the changes: #{inspect(changeset.errors)}"}
    end
  end

  @spec clear_alert(EmergencyTakeover.t(), String.t()) ::
          {:ok, EmergencyTakeover.t()} | {:error, String.t()}
  def clear_alert(alert, user) do
    changeset =
      EmergencyTakeover.changeset(alert, %{
        cleared_by: user,
        cleared_at: DateTime.utc_now()
      })

    case Repo.update(changeset) do
      {:ok, updated_alert} ->
        {:ok, updated_alert}

      {:error, changeset} ->
        {:error,
         "Failed to clear alert #{alert.id} with the changes: #{inspect(changeset.errors)}"}
    end
  end

  @spec remove_overlapping_alerts(integer() | nil, list(String.t()), String.t()) ::
          list(String.t())
  def remove_overlapping_alerts(id, new_stations, user) do
    get_overlapping_alerts(new_stations, id)
    |> Enum.reduce([], fn alert, acc ->
      stations_no_overlap =
        Enum.reject(alert.station_ids, fn station -> station in new_stations end)

      if Enum.empty?(stations_no_overlap) do
        # Clear entire alert if all the existing alert's stations overlap with the new alert
        {:ok, _cleared_alert} = clear_alert(alert, user)
        acc ++ alert.station_ids
      else
        {:ok, _updated_alert} =
          update_alert(
            alert.id,
            %{
              station_ids: stations_no_overlap,
              message: alert.message,
              schedule: %{
                start_time: alert.start_time,
                end_time: alert.end_time
              }
            },
            user
          )

        # Return the full list of stations to have their current takeovers cleared.
        acc ++ (alert.station_ids -- stations_no_overlap)
      end
    end)
  end

  @spec get_overlapping_alerts(list(String.t()), integer() | nil) :: list(EmergencyTakeover.t())
  defp get_overlapping_alerts(new_stations, alert_id) do
    # Find all active alerts that have any station overlap with the new alert,
    # excluding the alert being edited when editing an existing alert.
    excluded_alert_id = alert_id || -1

    EmergencyTakeover
    |> where(
      [alert],
      is_nil(alert.cleared_at) and alert.id != ^excluded_alert_id and
        fragment("? && ?", alert.station_ids, ^new_stations)
    )
    |> Repo.all()
  end

  @spec to_json(EmergencyTakeover.t()) :: map()
  def to_json(alert = %EmergencyTakeover{}) do
    %{
      "id" => to_string(alert.id),
      "message" => alert.message,
      "station_ids" => alert.station_ids,
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
end
