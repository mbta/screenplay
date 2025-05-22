defmodule ScreenplayWeb.DashboardApiController do
  use ScreenplayWeb, :controller

  alias Screenplay.Places
  alias Screenplay.Places.Place

  @config_fetcher Application.compile_env(:screenplay, :config_fetcher)

  def index(conn, _params) do
    config = Places.get()
    {:ok, descriptions, _} = @config_fetcher.get_place_descriptions()

    updated_config =
      config
      |> update_config_with_place_descriptions(descriptions)

    json(conn, updated_config)
  end

  def line_stops(conn, _params) do
    json(conn, %{data: Screenplay.PredictionSuppression.line_stops()})
  end

  defp update_config_with_place_descriptions(config, descriptions) do
    Enum.map(config, fn %Place{id: id} = place ->
      description =
        Enum.find_value(descriptions, "", fn
          %{"id" => ^id, "description" => description} -> description
          _ -> nil
        end)

      %{place | description: description}
    end)
  end
end
