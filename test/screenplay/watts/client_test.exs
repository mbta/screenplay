defmodule Screenplay.Watts.ClientTest do
  use ExUnit.Case

  import Mox

  alias Screenplay.Watts.Client

  setup :verify_on_exit!

  describe "fetch_tts/2" do
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

    test "sanitizes text when ssml flag is not set" do
      input = ~s(<lang xml:lang="es-US">Hello World</lang>)

      expect(HTTPoison.Mock, :post, fn _, request_data, _ ->
        assert request_data ==
                 ~s({"text":"<speak><amazon:effect name=\\"drc\\"><prosody rate=\\"90%\\">&lt;lang xml:lang=&quot;es-US&quot;&gt;Hello World&lt;/lang&gt;</prosody></amazon:effect></speak>","voice_id":"Matthew"})

        {:ok, %HTTPoison.Response{status_code: 200, body: Jason.encode!(input)}}
      end)

      Client.fetch_tts(input, false)
    end

    test "does not sanitize text when ssml flag is set" do
      input = ~s(<lang xml:lang="es-US">Hello World</lang>)

      expect(HTTPoison.Mock, :post, fn _, request_data, _ ->
        assert request_data ==
                 ~s({"text":"<speak><amazon:effect name=\\"drc\\"><prosody rate=\\"90%\\"><lang xml:lang=\\"es-US\\">Hello World</lang></prosody></amazon:effect></speak>","voice_id":"Matthew"})

        {:ok, %HTTPoison.Response{status_code: 200, body: Jason.encode!(input)}}
      end)

      assert Client.fetch_tts(input, true)
    end
  end
end
