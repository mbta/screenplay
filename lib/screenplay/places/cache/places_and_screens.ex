defmodule Screenplay.Config.Cache.PlacesAndScreens do
  alias Screenplay.Places.Place

  use Nebulex.Cache,
    otp_app: :screenplay,
    adapter: Nebulex.Adapters.Local

  @type key :: place_id :: String.t()
  @type value :: place_and_screens :: Place.t()
end
