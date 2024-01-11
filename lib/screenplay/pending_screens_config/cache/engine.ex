defmodule Screenplay.PendingScreensConfig.Cache.Engine do
  @moduledoc """
  Engine for the pending screens config cache.
  """

  alias ScreensConfig.Config
  alias Screenplay.PendingScreensConfig.{Cache, Fetch}

  @behaviour Screenplay.Cache.Engine

  @impl true
  def name, do: Cache.table()

  @impl true
  @spec update_table(any()) ::
          :error
          | :unchanged
          | {:replace, [{:devops | {any(), any()}, map()}, ...],
             integer() | {{any(), any(), any()}, {any(), any(), any()}}}
  def update_table(current_version) do
    # last_deploy_timestamp = @last_deploy_fetcher.get_last_deploy_time()

    with {:ok, body, new_version} <- Fetch.fetch_config(current_version),
         {:ok, deserialized} <- Jason.decode(body) do
      config = Config.from_json(deserialized)

      # It's inefficient to store the entire config under one key--every time we read any entry from an ETS table,
      # a full copy of that entry is made.
      # So, we need to split the config into separate entries for each screen, plus a couple metadata items.
      table_entries = config_to_table_entries(config)

      {:replace, table_entries, new_version}
    else
      :unchanged -> :unchanged
      _ -> :error
    end
  end

  @impl true
  def update_interval_ms, do: 5_000

  @impl true
  def update_failure_error_log_threshold_minutes, do: 2

  @spec config_to_table_entries(Config.t()) :: Cache.table_contents()
  defp config_to_table_entries(config) do
    screen_entries =
      Enum.map(config.screens, fn {screen_id, screen_config} ->
        {{:screen, screen_id}, screen_config}
      end)

    metadata_entries = [devops: config.devops]

    metadata_entries ++ screen_entries
  end
end
