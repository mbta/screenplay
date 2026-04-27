defmodule ScreenplayWeb.DashboardApiController do
  use ScreenplayWeb, :controller

  alias Screenplay.Places
  alias Screenplay.Places.Place

  @config_fetcher Application.compile_env(:screenplay, :config_fetcher)

  def index(conn, _params) do
    json(conn, Places.get())
  end

  def line_stops(conn, _params) do
    json(conn, %{data: Screenplay.PredictionSuppression.line_stops()})
  end
end
