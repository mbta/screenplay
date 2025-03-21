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
  def state(q, :current, alert_ids, now), do: current(q, alert_ids, now)
  def state(q, :future, _alert_ids, now), do: future(q, now)
  def state(q, :past, alert_ids, now), do: past(q, alert_ids, now)
  def state(q, :all, _, _), do: q

  @doc """
  Limit the query to only PaMessages that are currently active.

  A PaMessage is considered "active" if it is "current" and not suppressed by
  other criteria, like being paused, or being limited to a different day.
  """
  @spec active(
          queryable :: Ecto.Queryable.t(),
          alert_ids :: [String.t()],
          now :: DateTime.t()
        ) ::
          Ecto.Query.t()
  def active(q \\ PaMessage, alert_ids, now) do
    current_service_day = Util.get_current_service_day(now)

    current(q, alert_ids, now)
    |> where([m], (is_nil(m.paused) or not m.paused) and ^current_service_day in m.days_of_week)
  end

  @doc """
  Limit the query to only PaMessages that are current.

  A PaMessage is considered "current" if its start time is in the past and
  either its end time is in the future or it has no end time and its associated
  alert is in passed list of alert IDs.
  """
  @spec active(queryable :: Ecto.Queryable.t(), alert_ids :: [String.t()], now :: DateTime.t()) ::
          Ecto.Query.t()
  def current(q \\ PaMessage, alert_ids, now) do
    from m in q,
      where:
        m.start_datetime <= ^now and
          ((is_nil(m.end_datetime) and m.alert_id in ^alert_ids) or m.end_datetime >= ^now)
  end

  @doc """
  Limit the query to only PaMessages that have an end_datetime in the past or
  are associated with a past alert.
  """
  def past(q \\ PaMessage, alert_ids, now) do
    from m in q,
      where: m.end_datetime < ^now or (is_nil(m.end_datetime) and m.alert_id not in ^alert_ids)
  end

  @doc "Limit the query to only PaMessages that are scheduled for the future"
  def future(q \\ PaMessage, now) do
    from m in q, where: ^now < m.start_datetime
  end

  @doc """
  Limits the query to PaMessages that have sign ids overlapping the list of
  sign ids passed. Passes through the queryable if an empty lists or a non-list
  is passed.
  """
  def signs(q \\ PaMessage, signs)

  def signs(q, sign_ids = [_ | _]) do
    from m in q, where: fragment("? && ?", m.sign_ids, ^sign_ids)
  end

  def signs(q, _), do: q
end
