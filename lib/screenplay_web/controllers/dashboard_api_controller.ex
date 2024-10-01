defmodule ScreenplayWeb.DashboardApiController do
  use ScreenplayWeb, :controller

  alias Screenplay.Places
  alias Screenplay.Places.Place

  @config_fetcher Application.compile_env(:screenplay, :config_fetcher)

  def index(conn, _params) do
    config = Places.get_places()
    {:ok, locations, _} = @config_fetcher.get_locations()
    {:ok, descriptions, _} = @config_fetcher.get_place_descriptions()

    updated_config =
      config
      |> update_config_with_locations(locations)
      |> update_config_with_place_descriptions(descriptions)

    json(conn, updated_config)
  end

  defp update_config_with_locations(config, locations) do
    Enum.map(config, fn %Place{screens: screens} = place ->
      new_screens =
        Enum.map(screens, fn %{id: id} = screen ->
          location = Enum.find(locations, "", &match?(%{"id" => ^id}, &1))
          %{screen | location: location}
        end)

      %{place | screens: new_screens}
    end)
  end

  defp update_config_with_place_descriptions(config, descriptions) do
    Enum.map(config, fn %Place{id: id} = place ->
      description = Enum.find(descriptions, "", &match?(%{"id" => ^id}, &1))
      %{place | description: description}
    end)
  end
end
