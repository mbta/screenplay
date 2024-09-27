defmodule Screenplay.PlacesAndScreens.Fetch do
  @moduledoc false

  alias Screenplay.PlacesAndScreens.PlaceAndScreens

  @type version_id :: String.t()

  # All logic assumes that the configs will always be a list of maps.
  @callback get_places_and_screens() :: {:ok, list(map()), version_id()} | :error
  @callback get_locations() :: {:ok, list(map()), version_id()} | :error
  @callback get_place_descriptions() :: {:ok, list(map()), version_id()} | :error
  @callback put_config(list(PlaceAndScreens.t())) :: :ok | :error
  @callback commit() :: :ok
  @callback revert(version_id()) :: any()

  def add_labels_to_config(config, labels) do
    update_in(
      config,
      [Access.all(), "screens", Access.filter(&(&1["type"] == "pa_ess"))],
      &Map.put(&1, "label", Map.get(labels, &1["id"]))
    )
  end
end
