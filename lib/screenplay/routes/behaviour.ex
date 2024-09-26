defmodule Screenplay.Routes.Behaviour do
  @moduledoc false

  @callback fetch_routes_for_stop(String.t()) :: list(map())
end
