defmodule Screenplay.Routes.Route do
  @moduledoc """
  Functions used to fetch route data from the V3 API.
  """

  alias Screenplay.V3Api

  @callback fetch_routes_for_stop(String.t()) :: {:ok, list(map())} | :error
  def fetch_routes_for_stop(stop_id) do
    case V3Api.get_json("/routes", %{
           "filter[stop]" => stop_id
         }) do
      {:ok, %{"data" => data}} -> {:ok, data}
      _ -> :error
    end
  end
end
