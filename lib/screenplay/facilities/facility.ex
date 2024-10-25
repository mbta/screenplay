defmodule Screenplay.Facilities.Facility do
  @moduledoc """
  Functions used to fetch facility data from the V3 API.
  """

  alias Screenplay.V3Api

  @callback fetch(String.t()) :: {:ok, map()} | :error
  def fetch(facility_id) do
    case V3Api.get_json("/facilities/#{facility_id}") do
      {:ok, %{"data" => data}} -> {:ok, data}
      _ -> :error
    end
  end
end
