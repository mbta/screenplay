defmodule Screenplay.Places do
  @moduledoc """
  Supervisor and public interface for fetching and updating Screenplay data.
  """

  use Supervisor

  alias Screenplay.Places.{Builder, Cache, Place}

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
    Cache.all(nil, return: :value)
  end
end
