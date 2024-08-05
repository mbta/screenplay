defmodule Screenplay.PaMessages.PaMessage.Queries do
  @moduledoc """
  Composable queries of `Screenplay.PaMessages.PaMessage`

  NOTE: Do not evaluate queries in this module. All functions should take an
  `t:Ecto.Queryable.t/0` as the first argument and return an `t:Ecto.Query.t/0`.
  """
  import Ecto.Query

  alias Screenplay.PaMessages.PaMessage
  alias Screenplay.Util

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
end
