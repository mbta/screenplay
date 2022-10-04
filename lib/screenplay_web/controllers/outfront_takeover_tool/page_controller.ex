defmodule ScreenplayWeb.OutfrontTakeoverTool.PageController do
  use ScreenplayWeb, :controller

  plug(:sentry_dsn)

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
    redirect(conn, to: Routes.page_path(conn, :index))
  end
end
