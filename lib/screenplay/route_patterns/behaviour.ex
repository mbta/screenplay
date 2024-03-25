defmodule Screenplay.RoutePatterns.Behaviour do
  @moduledoc false

  @callback fetch_platform_ids_for_route_at_stop(binary(), binary()) :: {binary(), binary()} | nil
end
