defmodule Screenplay.Watts.ClientTest do
  use ExUnit.Case

  import Mox

  alias Screenplay.Watts.Client

  describe "fetch_tts/1" do
    setup do
      original_watts_url = Application.get_env(:screenplay, :watts_url)
      Application.put_env(:screenplay, :watts_url, "https://fake-watts-url.com")

      original_api_key = Application.get_env(:screenplay, :watts_api_key)
      Application.put_env(:screenplay, :watts_api_key, "fake-watts-api-key")

      on_exit(fn ->
        Application.put_env(:screenplay, :watts_url, original_watts_url)
        Application.put_env(:screenplay, :watts_api_key, original_api_key)
      end)
    end

    test "sanitizes text sent to watts" do
      input = ~s(<lang xml:lang="es-US">Hello World</lang>)

      expect(HTTPoison.Mock, :post, fn _, request_data, _ ->
        assert request_data ==
                 ~s({"text":"<speak>&lt;lang xml:lang=&quot;es-US&quot;&gt;Hello World&lt;/lang&gt;</speak>","voice_id":"Matthew"})

        {:ok, %HTTPoison.Response{status_code: 200, body: Jason.encode!(input)}}
      end)

      Client.fetch_tts(input)
    end
  end
end
