defmodule Screenplay.ScreensConfig.Api do
  @moduledoc """
  Fetches screen configurations from the external Screens app API.
  """

  require Logger

  alias ScreensConfig.Config

  @spec fetch_config(list(String.t()) | nil) :: {:ok, String.t()} | {:error, term()}
  def fetch_config(ids \\ nil) do
    url = get_config_url(ids)
    headers = auth_headers()

    case http_client().get(url, headers) do
      {:ok, %{status_code: 200, body: body}} ->
        {:ok, transform_api_response(body)}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @spec put_config(Config.t()) :: :ok | {:error, term()}
  def put_config(config) do
    case build_screen_configs_payload(config) do
      {:ok, payload} ->
        payload
        |> JSON.encode!()
        |> post_to_api()

      _ ->
        {:error, :invalid_payload}
    end
  end

  @spec post_to_api(String.t()) :: :ok | {:error, term()}
  defp post_to_api(request_body) do
    url = screens_api_url()
    headers = auth_headers()

    case http_client().post(url, request_body, headers) do
      {:ok, %{body: body}} ->
        if body_success?(body) do
          :ok
        else
          Logger.error("Screens API POST returned unexpected response")
          {:error, :unexpected_response}
        end

      {:error, reason} ->
        Logger.error("Failed to post to Screens API: #{inspect(reason)}")
        {:error, reason}
    end
  end

  @spec build_screen_configs_payload(Config.t()) :: {:ok, map()} | :error
  defp build_screen_configs_payload(config) do
    screens = config |> Config.to_json() |> Map.get(:screens)

    case screens do
      screens when is_map(screens) ->
        screen_configs =
          Enum.map(screens, fn {screen_id, screen_config} ->
            %{"id" => to_string(screen_id), "config" => screen_config}
          end)

        {:ok, %{"screen_configs" => screen_configs}}

      _ ->
        Logger.error("Unexpected config format: missing screens map")
        :error
    end
  end

  @spec transform_api_response(String.t()) :: String.t()
  defp transform_api_response(body) do
    # Parse the API response and convert it to the format expected by screens_config
    with {:ok, %{"config" => config}} <- JSON.decode(body),
         {:ok, %{"screens" => screens}} <- JSON.decode(config) do
      JSON.encode!(%{"screens" => screens})
    else
      {:ok, _unexpected} ->
        Logger.error("Unexpected API response format")
        empty_screens_json()

      {:error, reason} ->
        Logger.error("Failed to parse API response: #{inspect(reason)}")
        empty_screens_json()
    end
  end

  defp empty_screens_json, do: "{\"screens\": {}}"

  @spec get_config_url(list(String.t()) | nil) :: String.t()
  defp get_config_url(nil) do
    screens_api_url()
  end

  defp get_config_url(ids) when is_list(ids) do
    query_string = URI.encode_query(%{"ids" => Enum.join(ids, ",")})
    "#{screens_api_url()}?#{query_string}"
  end

  @spec screens_api_url() :: String.t()
  defp screens_api_url do
    base_url = Application.fetch_env!(:screenplay, :screens_url)
    "#{base_url}/api/screen_configs"
  end

  @spec auth_headers() :: [{String.t(), String.t()}]
  defp auth_headers do
    token = Application.fetch_env!(:screenplay, :screens_api_key)
    [{"Authorization", "Bearer #{token}"}, {"Content-Type", "application/json"}]
  end

  defp http_client do
    Application.fetch_env!(:screenplay, :http_client)
  end

  @spec body_success?(String.t()) :: boolean()
  defp body_success?(body) do
    case JSON.decode(body) do
      {:ok, %{"success" => true}} -> true
      _ -> false
    end
  end
end
