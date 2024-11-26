defmodule ScreenplayWeb.PaMessagesApiController do
  use ScreenplayWeb, :controller

  action_fallback ScreenplayWeb.FallbackController

  alias Screenplay.PaMessages
  alias Screenplay.PaMessages.ListParams

  @watts_client Application.compile_env(:screenplay, :watts_client, Screenplay.Watts.Client)

  def active(conn, _params) do
    json(conn, PaMessages.get_active_messages())
  end

  def preview_audio(conn, %{"text" => text}) do
    case @watts_client.fetch_tts(text) do
      {:ok, audio_data} ->
        send_download(conn, {:binary, audio_data}, filename: "preview.mp3")

      :error ->
        send_resp(conn, 500, "Could not fetch audio preview")
    end
  end

  def index(conn, params) do
    with {:ok, opts} <- ListParams.parse(params) do
      pa_messages = PaMessages.list_pa_messages(opts)
      json(conn, pa_messages)
    end
  end

  def create(conn, params) do
    with {:ok, message} <- PaMessages.create_message(params) do
      log_pa_message("pa_message_created", message, conn)
      json(conn, %{success: true})
    end
  end

  def update(conn, params = %{"id" => id}) do
    if pa_message = PaMessages.get_message(id) do
      with {:ok, updated_pa_message} <- PaMessages.update_message(pa_message, params) do
        log_pa_message("pa_message_updated", updated_pa_message, conn)
        json(conn, updated_pa_message)
      end
    else
      conn
      |> put_status(404)
      |> json(%{error: "not_found"})
    end
  end

  def show(conn, %{"id" => id}) do
    if pa_message = PaMessages.get_message(id) do
      json(conn, pa_message)
    else
      conn
      |> put_status(404)
      |> json(%{error: "not_found"})
    end
  end

  defp log_pa_message(event, message, conn) do
    Screenplay.Util.log(event,
      visual_text: message.visual_text,
      audio_text: message.audio_text,
      sign_ids: message.sign_ids,
      start_datetime: message.start_datetime,
      end_datetime: message.end_datetime,
      priority: message.priority,
      interval: message.interval_in_minutes,
      alert_id: message.alert_id,
      user: get_session(conn, "username") |> Screenplay.Util.trim_username()
    )
  end
end
