defmodule ScreenplayWeb.PaMessagesApiController do
  use ScreenplayWeb, :controller

  alias Screenplay.PaMessages.PaMessage

  def active(conn, _params) do
    json(conn, PaMessage.get_active_messages())
  end
end
