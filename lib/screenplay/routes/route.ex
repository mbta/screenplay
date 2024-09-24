defmodule Screenplay.Routes.Route do
  alias Screenplay.V3Api

  def fetch_routes_for_stop(stop_id) do
    case V3Api.get_json("/routes", %{
           "filter[stop]" => stop_id
         }) do
      {:ok, %{"data" => data}} -> data
      _ -> []
    end
  end
end
