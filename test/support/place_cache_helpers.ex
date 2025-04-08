defmodule Screenplay.PlaceCacheHelpers do
  @moduledoc """
  Helper function for seeding Screenplay.Places
  """

  import ExUnit.Callbacks
  alias Screenplay.Places.{Cache, Place}
  alias Screenplay.Places.Place.PaEssScreen

  def seed_place_cache do
    fixture_path =
      Path.join(~w[#{File.cwd!()} test fixtures places_and_screens_for_routes_to_signs.json])

    contents =
      fixture_path
      |> File.read!()
      |> Jason.decode!(keys: :atoms)
      |> Enum.map(fn %{screens: screens} = place ->
        struct(Place, %{place | screens: Enum.map(screens, &struct(PaEssScreen, &1))})
      end)

    contents
    |> Enum.map(&{&1.id, &1})
    |> Cache.put_all()

    on_exit(fn ->
      Cache.delete_all()
    end)
  end
end
