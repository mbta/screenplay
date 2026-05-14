defmodule ScreenplayWeb.EmergencyTakeoverTool.PageController do
  use ScreenplayWeb, :controller

  alias Screenplay.EmergencyTakeoverTool.CannedMessages
  alias Screenplay.Places
  alias Screenplay.Places.Place.{OutfrontTakeoverScreen, ShowtimeScreen}

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
    # Only show stations with Outfront Takeover screen configs, since we only want
    # stations defined in `config/outfront_takeover_screens.exs` to be selectable in the tool.
    stations_to_screens_map =
      Places.get_all()
      |> Enum.filter(fn place ->
        Enum.any?(place.screens, &match?(%OutfrontTakeoverScreen{}, &1))
      end)
      |> Enum.map(fn place ->
        outfront_screen =
          Enum.find(place.screens, &match?(%OutfrontTakeoverScreen{}, &1))

        # Filter ShowtimeScreens to only include those with a specified emergency_messaging_location.
        # These are the only screens we allow to be overtaken by the ETT.
        showtime_screen_ids =
          place.screens
          |> Enum.filter(fn screen ->
            match?(
              %ShowtimeScreen{type: type} when type in [:pre_fare_v2, :dup_v2, :busway_v2],
              screen
            ) and
              screen.emergency_messaging_location in [:inside, :outside]
          end)
          |> Enum.map(& &1.id)

        {place.name,
         %{
           name: place.name,
           landscape: outfront_screen.landscape,
           portrait: outfront_screen.portrait,
           showtime_screen_ids: showtime_screen_ids
         }}
      end)
      |> Map.new()

    json(conn, stations_to_screens_map)
  end

  def canned_messages(conn, _params) do
    messages = CannedMessages.all()
    json(conn, messages)
  end
end
