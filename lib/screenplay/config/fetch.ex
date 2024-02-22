defmodule Screenplay.Config.Fetch do
  @moduledoc false

  @callback get_places_and_screens() :: {:ok, term()} | :error
  @callback get_locations() :: {:ok, term()} | :error
  @callback get_place_descriptions() :: {:ok, term()} | :error
  @callback put_config(String.t()) :: :ok | :error
  @callback commit() :: :ok
  @callback revert(String.t()) :: :ok
end
