defmodule Screenplay.ScreensConfig.Fetch do
  @moduledoc """
  Defines a behaviour for, and delegates to, a module that provides access to
  the screens config file.
  """

  alias ScreensConfig.Config

  @type config_version :: String.t()
  @type fetch_result :: {:ok, String.t(), config_version()} | :unchanged | :error

  @callback fetch_config(config_version()) :: fetch_result
  @callback fetch_config() :: fetch_result
  @callback commit() :: :ok
  @callback revert(String.t()) :: :ok

  @callback put_config(Config.t()) :: :ok | :error

  # The module adopting this behaviour that we use for the current environment.
  @config_fetcher Application.compile_env(:screenplay, :screens_config_fetcher)

  # These delegates let other modules call functions from the appropriate Fetch module
  # without having to know which it is.
  defdelegate fetch_config(config_version), to: @config_fetcher
  defdelegate fetch_config(), to: @config_fetcher
  defdelegate put_config(config), to: @config_fetcher
  defdelegate commit(), to: @config_fetcher
  defdelegate revert(version), to: @config_fetcher
end
