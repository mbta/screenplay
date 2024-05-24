defmodule ScreenplayWeb.PaMessagesController do
  use ScreenplayWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
