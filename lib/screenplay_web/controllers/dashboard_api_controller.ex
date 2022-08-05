defmodule ScreenplayWeb.DashboardApiController do
  use ScreenplayWeb, :controller

  @config_fetcher Application.compile_env(:screenplay, :config_fetcher)

  def index(conn, _params) do
    {:ok, config, locations} = @config_fetcher.get_config()
    json(conn, update_config_with_locations(config, locations))
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
end
