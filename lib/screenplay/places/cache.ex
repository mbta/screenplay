defmodule Screenplay.Config.Cache do
  alias Screenplay.Config.Cache
  alias Screenplay.Places.Place

  @type place_id :: String.t()
  @type cache_entry :: {place_id(), Place.t()}

  @spec update_places_and_screens(list(Place.t())) :: {:ok, list(Place.t())}
  def update_places_and_screens(places_and_screens) do
    places_and_screens
    |> Enum.map(&{&1.id, &1})
    |> Cache.PlacesAndScreens.put_all()

    {:ok, get_places_and_screens()}
  end

  @spec get_places_and_screens() :: list(Place.t())
  def get_places_and_screens do
    Cache.PlacesAndScreens.all(nil, return: :value)
  end
end
