defmodule Screenplay.Places do
  @moduledoc """
  Supervisor and public interface for fetching and updating Screenplay data.
  """

  use Supervisor

  alias Screenplay.Places.{Builder, Cache, Place}
  alias Screenplay.Places.Place.OutfrontTakeoverScreen

  @spec start_link(keyword()) :: Supervisor.on_start()
  def start_link(_) do
    Supervisor.start_link(__MODULE__, [], name: __MODULE__)
  end

  @impl true
  def init(_) do
    children = [
      Cache,
      Builder
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end

  @spec update(list(Place.t())) :: {:ok, list(Place.t())}
  def update(places) do
    places
    |> Enum.map(&{&1.id, &1})
    |> Cache.put_all()

    {:ok, get()}
  end

  @spec get() :: list(Place.t())
  def get do
    # Gets places and excludes screens to be hidden from general Screenplay functionality.
    Cache.all(nil, return: :value)
    |> update_in([Access.all(), Access.key(:screens)], fn screens ->
      Enum.reject(screens, fn screen ->
        match?(%{hidden?: true}, screen) or match?(%OutfrontTakeoverScreen{}, screen)
      end)
    end)
  end

  @spec get_all() :: list(Place.t())
  def get_all do
    Cache.all(nil, return: :value)
  end
end
