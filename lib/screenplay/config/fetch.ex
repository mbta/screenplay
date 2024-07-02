defmodule Screenplay.Config.Fetch do
  @moduledoc false

  alias Screenplay.Config.PlaceAndScreens

  @type version_id :: String.t()

  @callback get_places_and_screens() :: {:ok, list(map()), String.t()} | :error
  @callback get_locations() :: {:ok, list(map()), version_id()} | :error
  @callback get_place_descriptions() :: {:ok, list(map()), version_id()} | :error
  @callback put_config(list(PlaceAndScreens.t())) :: :ok | :error
  @callback commit() :: :ok
  @callback revert(version_id()) :: any()
end
