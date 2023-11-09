defmodule ScreenplayWeb.ConfigController do
  use ScreenplayWeb, :controller

  alias Screenplay.Config.PermanentConfig

  def add(conn, %{"screen_id" => screen_id, "screen" => screen, "etag" => etag}) do
    case PermanentConfig.add_new_screen(screen_id, screen, etag) do
      :ok ->
        send_resp(conn, 200, "OK")

      :error ->
        send_resp(conn, 400, "Unable to add new screen")
    end
  end

  def delete(conn, %{"screen_id" => screen_id, "etag" => etag}) do
    case PermanentConfig.delete_screen(screen_id, etag) do
      :ok ->
        send_resp(conn, 200, "OK")

      :error ->
        send_resp(conn, 400, "Unable to delete screen")
    end
  end
end
