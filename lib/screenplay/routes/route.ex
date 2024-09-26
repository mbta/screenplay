defmodule Screenplay.Routes.Route do
  @moduledoc """
  Functions used to fetch route data from the V3 API.
  """

  @behaviour Screenplay.Routes.Behaviour

  alias Screenplay.V3Api

  @impl true
  def fetch_routes_for_stop(stop_id) do
    case V3Api.get_json("/routes", %{
           "filter[stop]" => stop_id
         }) do
      {:ok, %{"data" => data}} -> data
      _ -> []
    end
  end
end
