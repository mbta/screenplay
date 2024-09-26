defmodule Screenplay.Stops.Behaviour do
  @moduledoc false

  @callback fetch_parent_stops(list(String.t())) :: list(map())
  @callback fetch_all_parent_stations :: list(map())
end
