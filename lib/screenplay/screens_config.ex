defmodule Screenplay.ScreensConfig do
  @moduledoc """
  Supervisor and public interface for fetching and updating Screens data.
  """

  use Supervisor

  alias Screenplay.ScreensConfig.Cache
  alias Screenplay.ScreensConfig.Fetch.Fetcher
  alias ScreensConfig.Screen

  @spec start_link(any()) :: Supervisor.on_start()
  def start_link(_) do
    Supervisor.start_link(__MODULE__, [], name: __MODULE__)
  end

  @impl true
  def init(_) do
    children = [
      Cache,
      Fetcher
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end

  @spec screens() :: list(Screen.t())
  def screens do
    Cache.all(nil, return: {:key, :value})
  end

  @spec update_cache(list({String.t(), Screen.t()})) :: :ok
  def update_cache(screens) do
    delete_old_screens(screens)
    Cache.put_all(screens)
  end

  defp delete_old_screens(screens) do
    existing_screen_ids = Cache.all(nil, return: :key)
    new_screen_ids = Enum.map(screens, &elem(&1, 0))
    Enum.each(existing_screen_ids -- new_screen_ids, &Cache.delete/1)
  end
end
