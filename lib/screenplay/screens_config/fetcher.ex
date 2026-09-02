defmodule Screenplay.ScreensConfig.Fetcher do
  @moduledoc """
  GenServer that fetches and caches the Screens app config
  """
  use GenServer

  require Logger

  alias Screenplay.ScreensConfig, as: ScreensConfigStore
  alias Screenplay.ScreensConfig.Api, as: ConfigApi
  @update_interval :timer.seconds(5)

  def start_link(_) do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  @impl true
  def init(state) do
    update()

    Process.send_after(self(), :update, @update_interval)

    {:ok, state}
  end

  @impl true
  def handle_info(:update, state) do
    update()

    Process.send_after(self(), :update, @update_interval)

    {:noreply, state}
  end

  defp update do
    case ConfigApi.fetch_config() do
      {:ok, config} ->
        config
        |> config_to_cache_entries()
        |> ScreensConfigStore.update_cache()

      {:error, reason} ->
        Logger.error("Failed to fetch from Screens API: #{inspect(reason)}")
    end
  end

  defp config_to_cache_entries(config) do
    Map.to_list(config.screens)
  end
end
