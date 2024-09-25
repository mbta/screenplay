defmodule Screenplay.Places.RoutesToSigns do
  @moduledoc """
  Helper to derive a mapping of route to sign id from "places and screens"
  configuration.
  """

  alias Screenplay.Config.Cache
  alias Screenplay.Places.Place.PaEssScreen

  @spec routes_to_signs() :: %{
          (route_id :: String.t()) => [sign_id :: String.t()]
        }
  def routes_to_signs do
    pa_ess_screens =
      Cache.get_places_and_screens()
      |> Enum.flat_map(fn place ->
        Enum.filter(place.screens, &match?(%PaEssScreen{}, &1))
      end)

    routes_to_signs =
      pa_ess_screens
      |> Enum.flat_map(fn screen ->
        Enum.map(screen.routes, &{&1["id"], screen.id})
      end)
      |> Enum.group_by(&elem(&1, 0), &elem(&1, 1))

    routes_to_signs
  end

  @spec signs_for_routes([route_id :: String.t()]) :: [sign_id :: String.t()]
  def signs_for_routes(routes = [_ | _]) do
    routes_to_signs()
    |> Map.take(routes)
    |> Map.values()
    |> List.flatten()
    |> Enum.uniq()
  end

  def signs_for_routes(_), do: []
end
