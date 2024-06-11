defmodule ScreenplayWeb.PaMessagesApiController do
  use ScreenplayWeb, :controller

  alias Screenplay.PaMessages.PaMessage

  def index(conn, _params) do
    json(conn, PaMessage.get_all_messages())
  end

  def active(conn, _params) do
    json(conn, PaMessage.get_active_messages())
  end

  def preview_audio(conn, %{"text" => text}) do
    case Screenplay.Watts.fetch_tts(text) do
      {:ok, audio_data} ->
        send_download(conn, {:binary, audio_data}, filename: "preview.mp3")

      :error ->
        send_resp(conn, 404, "Not found")
    end
  end
end
