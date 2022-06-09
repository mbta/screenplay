defmodule ScreenplayWeb.DashboardApiController do
  use ScreenplayWeb, :controller

  @config_fetcher Application.compile_env(:screenplay, :config_fetcher)

  def index(conn, _params) do
    {:ok, config} = @config_fetcher.get_config()
    json(conn, config)
  end
end
