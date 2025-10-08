defmodule Screenplay.PaMessages.Fetch do
  @moduledoc false

  @http_client Application.compile_env!(:screenplay, :http_client)

  def fetch_audio(audioUrl) do
    case @http_client.get(audioUrl) do
      {:ok, %{status_code: 200, body: body}} ->
        {:success, body}

      error ->
        {:error, error}
    end
  end
end
