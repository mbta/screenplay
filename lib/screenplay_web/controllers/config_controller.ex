defmodule ScreenplayWeb.ConfigController do
  use ScreenplayWeb, :controller

  alias Screenplay.Config.PermanentConfig

  def add(conn, %{"screen_id" => screen_id, "screen" => screen, "etag" => etag}) do
    case PermanentConfig.add_new_screen(screen_id, screen, etag) do
      :ok ->
        send_resp(conn, 200, "OK")

      {:error, :etag_mismatch} ->
        send_resp(conn, 400, "Config version mismatch")

      {:error, :config_not_fetched} ->
        send_resp(conn, 400, "S3 Operation Failed: Get")

      {:error, :config_not_written} ->
        send_resp(conn, 400, "S3 Operation Failed: Put")
    end
  end

  def delete(conn, %{"screen_id" => screen_id, "etag" => etag}) do
    case PermanentConfig.delete_screen(screen_id, etag) do
      :ok ->
        send_resp(conn, 200, "OK")

      {:error, :etag_mismatch} ->
        send_resp(conn, 400, "Config version mismatch")

      {:error, :config_not_fetched} ->
        send_resp(conn, 400, "S3 Operation Failed: Get")

      {:error, :config_not_written} ->
        send_resp(conn, 400, "S3 Operation Failed: Put")
    end
  end
end
