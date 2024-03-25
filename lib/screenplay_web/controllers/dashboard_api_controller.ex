defmodule ScreenplayWeb.DashboardApiController do
  use ScreenplayWeb, :controller

  @config_fetcher Application.compile_env(:screenplay, :config_fetcher)

  def index(conn, _params) do
    {:ok, config, _} = @config_fetcher.get_places_and_screens()
    {:ok, locations, _} = @config_fetcher.get_locations()
    {:ok, descriptions, _} = @config_fetcher.get_place_descriptions()

    updated_config =
      config
      |> update_config_with_locations(locations)
      |> update_config_with_place_descriptions(descriptions)

    json(conn, updated_config)
  end

  defp update_config_with_locations(config, locations) do
    Enum.reduce(locations, config, fn %{"id" => id, "location" => location}, acc ->
      update_in(
        acc,
        [
          Access.filter(fn %{"screens" => screens} ->
            Enum.find(screens, &match?(%{"id" => ^id}, &1))
          end),
          "screens",
          Access.filter(&match?(%{"id" => ^id}, &1))
        ],
        &Map.put(&1, "location", location)
      )
    end)
  end

  defp update_config_with_place_descriptions(config, descriptions) do
    Enum.reduce(descriptions, config, fn %{"id" => id, "description" => description}, acc ->
      update_in(
        acc,
        [Access.filter(&match?(%{"id" => ^id}, &1))],
        &Map.put(&1, "description", description)
      )
    end)
  end
end
