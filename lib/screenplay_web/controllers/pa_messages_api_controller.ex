defmodule ScreenplayWeb.PaMessagesApiController do
  use ScreenplayWeb, :controller

  require Logger

  alias Screenplay.{PaMessages, Util}

  def index(conn, _params) do
    json(conn, PaMessages.get_all_messages())
  end

  def active(conn, _params) do
    json(conn, PaMessages.get_active_messages())
  end

  def preview_audio(conn, %{"text" => text}) do
    case Screenplay.Watts.fetch_tts(text) do
      {:ok, audio_data} ->
        send_download(conn, {:binary, audio_data}, filename: "preview.mp3")

      :error ->
        send_resp(conn, 500, "Could not fetch audio preview")
    end
  end

  def create(conn, params) do
    case PaMessages.create_message(params) do
      {:ok, _} ->
        json(conn, %{success: true})

      {:error, changeset} ->
        Logger.error("[pa_message create] #{Util.format_changeset_errors(changeset)}")
        send_resp(conn, 500, "Could not create message")
    end
  end
end
