defmodule Screenplay.Places.Cache do
  alias Screenplay.Places.Place

  use Nebulex.Cache,
    otp_app: :screenplay,
    adapter: Nebulex.Adapters.Local

  @type key :: place_id :: String.t()
  @type value :: place :: Place.t()
end
