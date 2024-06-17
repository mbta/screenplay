defmodule Screenplay.Watts do
  @moduledoc """
  Module used to fetch TTS audio files from the Watts app.
  """

  require Logger

  def fetch_tts(text) do
    watts_url = Application.fetch_env!(:screenplay, :watts_url)
    watts_api_key = Application.fetch_env!(:screenplay, :watts_api_key)
    request_data = Jason.encode!(%{text: "<speak>#{text}</speak>", voice_id: "Matthew"})

    case HTTPoison.post(
           "#{watts_url}/tts",
           request_data,
           [
             {"Content-type", "application/json"},
             {"x-api-key", watts_api_key}
           ]
         ) do
      {:ok, %{status_code: 200, body: body}} ->
        {:ok, body}

      {:ok, response} ->
        log_error({:bad_response_code, response})

      {:error, httpoison_error} ->
        log_error({:http_post_error, httpoison_error})
    end
  end

  defp log_error({error_type, error_data}) do
    Logger.error(
      "[watts_request_error] error_type=#{error_type} error_data=#{inspect(error_data)}"
    )

    :error
  end
end
