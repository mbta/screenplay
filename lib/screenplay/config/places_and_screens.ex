defmodule Screenplay.Config.PlaceAndScreens do
  @moduledoc false

  @type route :: String.t()

  @type pa_ess_screen :: %{
          id: String.t(),
          label: String.t() | nil,
          station_code: String.t(),
          type: :pa_ess,
          zone: String.t()
        }

  @type showtime_screen :: %{
          id: String.t(),
          type: String.t(),
          disabled: boolean()
        }

  @type screen :: pa_ess_screen() | showtime_screen()

  @type t :: %__MODULE__{
          id: String.t(),
          name: String.t(),
          routes: list(route()),
          screens: list(screen())
        }

  @derive Jason.Encoder
  defstruct id: nil, name: nil, routes: [], screens: []

  def from_map(place_and_screens_map) do
    %{"id" => id, "name" => name, "routes" => routes, "screens" => screens} =
      place_and_screens_map

    screens =
      Enum.map(screens, fn
        screen ->
          screen
          |> Map.new(fn
            {"type", "pa_ess"} -> {:type, :pa_ess}
            {k, v} -> {String.to_existing_atom(k), v}
          end)
      end)

    %__MODULE__{
      id: id,
      name: name,
      routes: routes,
      screens: screens
    }
  end
end
