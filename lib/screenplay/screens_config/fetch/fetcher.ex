defmodule Screenplay.ScreensConfig.Fetch.Fetcher do
  @moduledoc """
  GenServer that fetches and caches the Screens app config
  """
  use GenServer

  alias Screenplay.ScreensConfig, as: ScreensConfigUpdater
  alias Screenplay.ScreensConfig.Fetch
  alias ScreensConfig.Config

  @update_interval :timer.seconds(5)

  def start_link(_) do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  @impl true
  def init(state) do
    send(self(), :update)

    {:ok, state}
  end

  @impl true
  def handle_info(:update, state) do
    {:ok, body, _new_version} = Fetch.fetch_config()
    {:ok, deserialized} = Jason.decode(body)

    deserialized
    |> Config.from_json()
    |> config_to_cache_entries()
    |> ScreensConfigUpdater.update_cache()

    Process.send_after(self(), :update, @update_interval)

    {:noreply, state}
  end

  defp config_to_cache_entries(config) do
    Enum.map(config.screens, fn {screen_id, screen_config} ->
      {screen_id, screen_config}
    end)
  end
end
