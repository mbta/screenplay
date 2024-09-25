defmodule Screenplay.Config.Cache do
  alias Screenplay.Config.Cache
  alias Screenplay.Places.Place

  @type place_id :: String.t()
  @type cache_entry :: {place_id(), Place.t()}

  @spec update_places_and_screens(list(cache_entry())) :: :ok
  def update_places_and_screens(places_and_screens) do
    Cache.PlacesAndScreens.put_all(places_and_screens)

    :ok
  end

  @spec get_places_and_screens() :: list
  def get_places_and_screens do
    Cache.PlacesAndScreens.all(nil, return: :value)
  end
end
