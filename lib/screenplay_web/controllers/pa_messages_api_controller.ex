defmodule ScreenplayWeb.PaMessagesApiController do
  use ScreenplayWeb, :controller

  action_fallback ScreenplayWeb.FallbackController

  alias Screenplay.PaMessages
  alias Screenplay.PaMessages.ListParams

  def index(conn, params) do
    with {:ok, opts} <- ListParams.parse(params) do
      pa_messages = PaMessages.list_pa_messages(opts)
      json(conn, pa_messages)
    end
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
    with {:ok, _} <- PaMessages.create_message(params) do
      json(conn, %{success: true})
    end
  end
end
