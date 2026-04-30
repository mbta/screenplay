defmodule ScreenplayWeb.EmergencyTakeoverTool.PageController do
  use ScreenplayWeb, :controller

  alias Screenplay.Places
  alias Screenplay.Places.Place.OutfrontTakeoverScreen

  plug(:sentry_dsn)

  @outfront_station_and_screens Application.compile_env!(
                                  :screenplay,
                                  :outfront_takeover_screens
                                )

  defp sentry_dsn(conn, _) do
    dsn =
      if Application.get_env(:screenplay, :record_sentry, false) do
        Application.get_env(:screenplay, :sentry_frontend_dsn)
      else
        ""
      end

    assign(conn, :sentry_frontend_dsn, dsn)
  end

  def index(conn, _params) do
    render(conn, "index.html")
  end

  def stations_and_screen_orientations(conn, _params) do
    json(conn, @outfront_station_and_screens)
  end

  def stations_and_screens(conn, _params) do
    places = Places.get_all()

    # Extract all OutfrontTakeoverScreen screens as a simple map
    # This will be expanded to include showtime screens as well
    outfront_screens =
      places
      |> Enum.flat_map(fn place ->
        place.screens
        |> Enum.filter(&match?(%OutfrontTakeoverScreen{}, &1))
        |> Enum.map(fn screen ->
          {place.name,
           %{
             name: place.name,
             portrait: screen.portrait,
             landscape: screen.landscape
           }}
        end)
      end)
      |> Map.new()

    json(conn, outfront_screens)
  end
end
