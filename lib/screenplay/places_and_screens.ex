defmodule Screenplay.Places do
  @moduledoc """
  Supervisor and public interface for fetching and updating Screenplay data.
  """

  use Supervisor

  alias Screenplay.Places.{Builder, Cache, Place}

  @spec start_link(stops_mod: module(), routes_mod: module()) :: Supervisor.on_start()
  def start_link(stops_mod: stops_mod, routes_mod: routes_mod) do
    opts = %{stops_mod: stops_mod, routes_mod: routes_mod}
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(%{stops_mod: stops_mod, routes_mod: routes_mod}) do
    children = [
      Cache,
      {Builder, stops_mod: stops_mod, routes_mod: routes_mod}
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end

  @spec update_places_and_screens(list(Place.t())) :: {:ok, list(Place.t())}
  def update_places_and_screens(places) do
    places
    |> Enum.map(&{&1.id, &1})
    |> Cache.put_all()

    {:ok, get_places_and_screens()}
  end

  @spec get_places_and_screens() :: list(Place.t())
  def get_places_and_screens do
    Cache.all(nil, return: :value)
  end
end
