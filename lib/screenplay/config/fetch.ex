defmodule Screenplay.Config.Fetch do
  @moduledoc false

  @callback get_config() :: {:ok, term()} | :error
  @callback put_config(String.t()) :: :ok | :error
  @callback commit() :: :ok
  @callback revert(String.t()) :: :ok
end
