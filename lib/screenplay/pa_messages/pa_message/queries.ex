defmodule Screenplay.PaMessages.PaMessage.Queries do
  @moduledoc """
  Composable queries of `Screenplay.PaMessages.PaMessage`

  NOTE: Do not evaluate queries in this module. All functions should take an
  `t:Ecto.Queryable.t/0` as the first argument and return an `t:Ecto.Query.t/0`.
  """
  import Ecto.Query

  alias Screenplay.PaMessages.PaMessage
  alias Screenplay.Util

  def state(q \\ PaMessage, state, alert_ids, now)
  def state(q, :past, alert_ids, now), do: past(q, alert_ids, now)
  def state(q, :active, alert_ids, now), do: active(q, alert_ids, now)
  def state(q, :future, _alert_ids, now), do: future(q, now)
  def state(q, :all, _, _), do: q

  @doc """
  Limit the query to only PaMessages that are currently active.

  A PaMessage is considered "active" if its start time is in the past and
  either its end time is in the future or it has no end time and its associated
  alert is in passed list of alert IDs.
  """
  @spec active(queryable :: Ecto.Queryable.t(), alert_ids :: [String.t()], now :: DateTime.t()) ::
          Ecto.Query.t()
  def active(q \\ PaMessage, alert_ids, now) do
    current_service_day_of_week = Util.get_current_service_day(now)

    from m in q,
      where:
        ^current_service_day_of_week in m.days_of_week and
          m.start_time <= ^now and
          ((is_nil(m.end_time) and m.alert_id in ^alert_ids) or m.end_time >= ^now)
  end

  @doc "Limit the query to only PaMessages that are in the past"
  def past(q \\ PaMessage, alert_ids, now) do
    from m in q, where: m.end_time < ^now or (is_nil(m.end_time) and m.alert_id not in ^alert_ids)
  end

  @doc "Limit the query to only PaMessages that are scheduled for the future"
  def future(q \\ PaMessage, now) do
    from m in q, where: ^now < m.start_time
  end
end
