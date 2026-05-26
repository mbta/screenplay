defmodule Screenplay.Places.Place do
  @moduledoc """
  Module used to define struct for screen configs stored in `Screenplay.Places.Cache`.
  A screen config can either be a `PaEssScreen.t()`, a `ShowtimeScreen.t()`, or an `OutfrontTakeoverScreen.t()`.
  """

  defmodule PaEssScreen do
    @moduledoc """
    Module used to define struct for PA/ESS screen configs stored in `Screenplay.Places.Cache`.
    """

    @derive Jason.Encoder

    @type route :: %{id: String.t(), direction_id: 0 | 1}

    @type t :: %__MODULE__{
            id: String.t(),
            label: String.t() | nil,
            station_code: String.t(),
            type: String.t(),
            zone: String.t(),
            routes: [route()],
            location: String.t() | nil
          }

    @enforce_keys [:id, :label, :station_code, :type, :zone, :routes]
    defstruct @enforce_keys ++ [:location]

    def new(map) do
      map
      |> Map.new(fn {k, v} -> {String.to_existing_atom(k), v} end)
      |> then(&struct!(__MODULE__, &1))
    end
  end

  defmodule ShowtimeScreen do
    @moduledoc """
    Module used to define struct for Showtime screen configs stored in `Screenplay.Places.Cache`.
    """

    @derive Jason.Encoder

    @type t :: %__MODULE__{
            id: String.t(),
            type: String.t(),
            disabled: boolean(),
            direction_id: String.t(),
            emergency_messaging_location: String.t() | nil,
            location: String.t(),
            hidden?: boolean()
          }

    @enforce_keys [:id, :type, :disabled]
    defstruct @enforce_keys ++
                [:direction_id, emergency_messaging_location: nil, location: "", hidden?: false]

    def new(map) do
      map
      |> Enum.map(fn {k, v} -> {String.to_existing_atom(k), v} end)
      |> then(&struct!(__MODULE__, &1))
    end
  end

  defmodule OutfrontTakeoverScreen do
    @moduledoc """
    Module used to define struct for Outfront Takeover screen configs stored in `Screenplay.Places.Cache`.
    """

    @derive Jason.Encoder

    @type t :: %__MODULE__{
            id: String.t(),
            type: String.t(),
            portrait: boolean(),
            landscape: boolean(),
            sftp_dir_name: String.t()
          }

    @enforce_keys [:id, :type, :portrait, :landscape, :sftp_dir_name]
    defstruct @enforce_keys

    def new(map) do
      map
      |> Map.new(fn {k, v} -> {String.to_existing_atom(k), v} end)
      |> then(&struct!(__MODULE__, &1))
    end
  end

  @type route :: String.t()

  @type screen :: PaEssScreen.t() | ShowtimeScreen.t() | OutfrontTakeoverScreen.t()

  @type t :: %__MODULE__{
          id: String.t(),
          name: String.t(),
          routes: list(route()),
          screens: list(screen()),
          description: String.t() | nil
        }

  @derive Jason.Encoder
  defstruct id: nil, name: nil, routes: [], screens: [], description: nil

  def from_map(place_map) do
    %{"id" => id, "name" => name, "routes" => routes, "screens" => screens} = place_map

    screens =
      Enum.map(screens, fn
        pa_ess_screen = %{"type" => "pa_ess"} ->
          PaEssScreen.new(pa_ess_screen)

        outfront_screen = %{"type" => "outfront_takeover"} ->
          OutfrontTakeoverScreen.new(outfront_screen)

        showtime_screen ->
          ShowtimeScreen.new(showtime_screen)
      end)

    %__MODULE__{
      id: id,
      name: name,
      routes: routes,
      screens: screens
    }
  end
end
