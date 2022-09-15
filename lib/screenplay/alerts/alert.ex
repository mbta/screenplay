defmodule Screenplay.Alerts.Alert do
  @moduledoc false

  alias Screenplay.V3Api

  @derive Jason.Encoder

  defstruct id: nil,
            cause: nil,
            effect: nil,
            severity: nil,
            header: nil,
            informed_entities: nil,
            active_period: nil,
            lifecycle: nil,
            timeframe: nil,
            created_at: nil,
            updated_at: nil,
            url: nil,
            description: nil,
            affected_list: nil

  @type informed_entity :: %{
          stop: String.t() | nil,
          route: String.t() | nil,
          route_type: non_neg_integer() | nil
        }

  @type t :: %__MODULE__{
          id: String.t(),
          cause: String.t(),
          effect: String.t(),
          severity: integer,
          header: String.t(),
          informed_entities: list(informed_entity()),
          active_period: list(),
          lifecycle: String.t(),
          timeframe: String.t(),
          created_at: DateTime.t(),
          updated_at: DateTime.t(),
          description: String.t(),
          affected_list: list(atom())
        }

  def fetch(get_json_fn \\ &V3Api.get_json/2) do
    case get_json_fn.("alerts", %{
           "include" => "routes"
         }) do
      {:ok, result} ->
        {:ok, Screenplay.Alerts.Parser.parse_result(result)}

      _ ->
        :error
    end
  end

  def to_full_map(alert) do
    aps = Enum.map(alert.active_period, &ap_to_map/1)

    %{
      id: alert.id,
      effect: alert.effect,
      severity: alert.severity,
      header: alert.header,
      informed_entities: alert.informed_entities,
      active_period: aps,
      lifecycle: alert.lifecycle,
      timeframe: alert.timeframe,
      created_at: DateTime.to_iso8601(alert.created_at),
      updated_at: DateTime.to_iso8601(alert.updated_at),
      affected_list: alert.affected_list
    }
  end

  def ap_to_map({nil, end_t}) do
    %{"start" => nil, "end" => DateTime.to_iso8601(end_t)}
  end

  def ap_to_map({start_t, nil}) do
    %{"start" => DateTime.to_iso8601(start_t), "end" => nil}
  end

  def ap_to_map({start_t, end_t}) do
    %{"start" => DateTime.to_iso8601(start_t), "end" => DateTime.to_iso8601(end_t)}
  end
end
