defmodule Screenplay.Places.Fetch do
  @moduledoc false

  alias Screenplay.Places.Place

  @type version_id :: String.t()

  @callback get_place_descriptions() :: {:ok, list(map()), version_id()} | :error
  @callback put_config(list(Place.t())) :: :ok | :error
  @callback get_paess_labels() :: {:ok, list(map())} | :error
  @callback commit() :: :ok
  @callback revert(version_id()) :: any()

  @optional_callbacks put_config: 1, commit: 0, revert: 1
end
