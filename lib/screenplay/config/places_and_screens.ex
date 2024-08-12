defmodule Screenplay.Config.PlaceAndScreens do
  @moduledoc """
  Module used to define struct for screen configs stored in places_and_screens.json.
  A screen config can either be a `PaEssScreen.t()` or a `ShowtimeScreen.t()`.
  """

  defmodule PaEssScreen do
    @moduledoc """
    Module used to define struct for PA/ESS screen configs stored in `places_and_screens.json`.
    """

    @derive Jason.Encoder

    @type route :: %{id: String.t(), direction_id: 0 | 1}

    @type t :: %__MODULE__{
            id: String.t(),
            label: String.t() | nil,
            station_code: String.t(),
            type: String.t(),
            zone: String.t(),
            routes: [route()]
          }

    @enforce_keys [:id, :label, :station_code, :type, :zone, :routes]
    defstruct @enforce_keys

    def new(map) do
      map
      |> Map.new(fn {k, v} -> {String.to_existing_atom(k), v} end)
      |> then(&struct!(__MODULE__, &1))
    end
  end

  defmodule ShowtimeScreen do
    @moduledoc """
    Module used to define struct for Showtime screen configs stored in `places_and_screens.json`.
    """

    @derive Jason.Encoder

    @type t :: %__MODULE__{
            id: String.t(),
            type: String.t(),
            disabled: boolean()
          }

    @enforce_keys [:id, :type, :disabled]
    defstruct @enforce_keys

    def new(map) do
      map
      |> Enum.map(fn {k, v} -> {String.to_existing_atom(k), v} end)
      |> then(&struct!(__MODULE__, &1))
    end
  end

  @type route :: String.t()

  @type pa_ess_screen :: PaEssScreen.t()

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
        pa_ess_screen = %{"type" => "pa_ess"} -> PaEssScreen.new(pa_ess_screen)
        showtime_screen -> ShowtimeScreen.new(showtime_screen)
      end)

    %__MODULE__{
      id: id,
      name: name,
      routes: routes,
      screens: screens
    }
  end
end
