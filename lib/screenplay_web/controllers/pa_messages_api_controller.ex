defmodule ScreenplayWeb.PaMessagesApiController do
  use ScreenplayWeb, :controller

  def active_pa_messages(conn, _params) do
    json(conn, [])
  end
end
