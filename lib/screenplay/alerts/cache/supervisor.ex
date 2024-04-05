defmodule Screenplay.Alerts.Cache.Supervisor do
  @moduledoc """
  Module used to spin up processes need to cache current alerts fetched from the V3 API.
  """

  use Supervisor

  def start_link(_) do
    Supervisor.start_link(__MODULE__, [])
  end

  @impl Supervisor
  def init(_arg) do
    children = [Screenplay.Alerts.Cache.Store, Screenplay.Alerts.Cache.Fetcher]

    Supervisor.init(children, strategy: :rest_for_one)
  end
end
