defmodule Screenplay.PendingScreensConfig.Fetch do
  @moduledoc """
  Defines a behaviour for, and delegates to, a module that provides access to
  the pending screens config file.
  """
  alias ScreensConfig.PendingConfig

  defmodule Metadata do
    @moduledoc false

    @type t :: %__MODULE__{
            etag: String.t(),
            version_id: String.t(),
            last_modified: DateTime.t()
          }

    @enforce_keys [:etag, :version_id, :last_modified]
    defstruct @enforce_keys
  end

  @type fetch_result ::
          {:ok, json :: String.t(), metadata :: Metadata.t()}
          | :error

  @callback fetch_config() :: fetch_result
  @callback put_config(PendingConfig.t()) :: :ok | :error
  @callback commit() :: :ok
  @callback revert(String.t()) :: :ok

  # The module adopting this behaviour that we use for the current environment.
  @config_fetcher Application.compile_env(:screenplay, :pending_screens_config_fetcher)

  # These delegates let other modules call functions from the appropriate Fetch module
  # without having to know which it is.
  defdelegate fetch_config(), to: @config_fetcher
  defdelegate put_config(config), to: @config_fetcher
  defdelegate commit(), to: @config_fetcher
  defdelegate revert(version), to: @config_fetcher
end
