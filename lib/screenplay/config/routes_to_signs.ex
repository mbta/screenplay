defmodule Screenplay.Config.RoutesToSigns do
  @moduledoc """
  Helper to derive a mapping of route to sign id from "places and screens"
  configuration.
  """

  alias Screenplay.Config.PlaceAndScreens
  alias Screenplay.Config.PlaceAndScreens.PaEssScreen

  @config_fetcher Application.compile_env(:screenplay, :config_fetcher)

  @spec routes_to_signs() :: %{
          (route_id :: String.t()) => [sign_id :: String.t()]
        }
  def routes_to_signs do
    {:ok, places_and_screens, _} = @config_fetcher.get_places_and_screens()

    places_and_screens = Enum.map(places_and_screens, &PlaceAndScreens.from_map/1)

    pa_ess_screens =
      Enum.flat_map(places_and_screens, fn place ->
        Enum.filter(place.screens, &match?(%PaEssScreen{}, &1))
      end)

    routes_to_signs =
      pa_ess_screens
      |> Enum.flat_map(fn screen ->
        Enum.map(screen.route_ids, &{&1, screen.id})
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
