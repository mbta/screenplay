defmodule Screenplay.Config.Supervisor do
  use Supervisor

  alias Screenplay.Config.{Builder, Cache}

  @spec start_link(any()) :: Supervisor.on_start()
  def start_link(_) do
    Supervisor.start_link(__MODULE__, [], name: __MODULE__)
  end

  @impl true
  def init(_) do
    children = [
      Cache.PlacesAndScreens,
      Builder
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end
end
