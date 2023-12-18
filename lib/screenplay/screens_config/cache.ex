defmodule Screenplay.ScreensConfig.Cache do
  @moduledoc """
  Functions to read data from a cached copy of the screens config.
  """

  alias ScreensConfig.{Config, Devops}

  use Screenplay.Cache.Client, table: :screens_config

  @type table_contents :: list(table_entry)

  @type table_entry ::
          {{:screen, screen_id :: String.t()}, ScreensConfig.Screen.t()}
          | {:devops, ScreensConfig.Devops.t()}

  def ok?, do: table_exists?()

  def disabled?(screen_id) do
    with_table default: false do
      case :ets.match(@table, {{:screen, screen_id}, %{disabled: :"$1"}}) do
        [[disabled]] -> disabled
        [] -> false
      end
    end
  end

  def screen(screen_id) do
    with_table default: nil do
      case :ets.match(@table, {{:screen, screen_id}, :"$1"}) do
        [[screen]] -> screen
        [] -> nil
      end
    end
  end

  def app_params(screen_id) do
    with_table default: nil do
      case :ets.match(@table, {{:screen, screen_id}, %{app_params: :"$1"}}) do
        [[app_params]] -> app_params
        [] -> nil
      end
    end
  end

  def devops do
    with_table default: nil do
      case :ets.match(@table, {:devops, :"$1"}) do
        [[devops]] -> devops
        [] -> nil
      end
    end
  end

  @doc """
  Returns a list of all screen IDs.
  """
  def screen_ids do
    with_table default: [] do
      @table
      |> :ets.match({{:screen, :"$1"}, :_})
      |> List.flatten()
    end
  end

  @doc """
  Returns a list of all screen IDs that satisfy the given filter.
  The filter function will be passed a tuple of {screen_id, screen_config} and should return true if that screen ID should be included in the results.
  """
  def screen_ids(filter_fn) do
    with_table default: [] do
      filter_reducer = fn
        {{:screen, screen_id}, screen_config}, acc ->
          if filter_fn.({screen_id, screen_config}), do: [screen_id | acc], else: acc

        _, acc ->
          acc
      end

      :ets.foldl(filter_reducer, [], @table)
    end
  end

  @doc """
  Gets the full map of screen configurations.

  👉 WARNING: This function is expensive to run and returns a large amount of data.

  Unless you really need to get the entire map, try to use one of the other client functions, or define a new one
  that relies more on :ets.match / :ets.select to limit the size of data returned.
  """
  def screens do
    with_table do
      match_screen_entries = {{:screen, :"$1"}, :"$2"}
      no_guards = []
      output_entry_as_screen_id_screen_config_tuple = [{{:"$1", :"$2"}}]

      match_spec = [
        {match_screen_entries, no_guards, output_entry_as_screen_id_screen_config_tuple}
      ]

      @table
      |> :ets.select(match_spec)
      |> Map.new()
    end
  end

  @doc """
  Gets the entire config struct.

  👉 WARNING: This function is expensive to run and returns a large amount of data.

  Unless you really need to get the entire config, try to use one of the other client functions, or define a new one
  that relies more on :ets.match / :ets.select to limit the size of data returned.
  """
  def config do
    with screens_map when is_map(screens_map) <- screens(),
         %Devops{} = devops_struct <- devops() do
      %Config{screens: screens_map, devops: devops_struct}
    else
      _ -> :error
    end
  end
end
