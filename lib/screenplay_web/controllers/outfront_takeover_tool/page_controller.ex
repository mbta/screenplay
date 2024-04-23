defmodule ScreenplayWeb.OutfrontTakeoverTool.PageController do
  use ScreenplayWeb, :controller

  plug(:sentry_dsn)

  @stations_and_screen_orientations Application.compile_env!(
                                      :screenplay,
                                      :outfront_takeover_tool_screens
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

  def takeover_redirect(conn, _params) do
    redirect(conn, to: ~p"/emergency-takeover")
  end

  def stations_and_screen_orientations(conn, _params) do
    json(conn, @stations_and_screen_orientations)
  end
end
