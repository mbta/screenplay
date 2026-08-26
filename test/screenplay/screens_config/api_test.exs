defmodule Screenplay.ScreensConfig.ApiTest do
  use ExUnit.Case

  import ExUnit.CaptureLog
  import Mox

  alias Screenplay.ScreensConfig.Api
  alias ScreensConfig.Config

  setup :verify_on_exit!

  setup do
    Application.put_env(:screenplay, :screens_url, "https://screens.example")
    Application.put_env(:screenplay, :http_client, HTTPoisonMock)
    original_token = Application.get_env(:screenplay, :screens_api_key)
    Application.put_env(:screenplay, :screens_api_key, "test-token")

    on_exit(fn ->
      Application.put_env(:screenplay, :screens_api_key, original_token)
    end)

    :ok
  end

  describe "fetch_config/1" do
    test "fetches and transforms config when response body success is true" do
      api_response = %{
        "success" => true,
        "config" =>
          JSON.encode!(%{
            "screens" => %{
              "TPS-TEST" => %{"app_id" => "busway_v2"},
              "TPS-SECOND" => %{"app_id" => "dup_v2"}
            }
          })
      }

      expect(HTTPoisonMock, :get, fn _url, _headers ->
        {:ok, %HTTPoison.Response{status_code: 200, body: JSON.encode!(api_response)}}
      end)

      {:ok, body} = Api.fetch_config()

      decoded = JSON.decode!(body)
      assert Map.has_key?(decoded, "screens")
      assert Map.has_key?(decoded["screens"], "TPS-TEST")
      assert Map.has_key?(decoded["screens"], "TPS-SECOND")
    end

    test "returns :error when API request fails" do
      expect(HTTPoisonMock, :get, fn _url, _headers ->
        {:error, %HTTPoison.Error{reason: :econnrefused}}
      end)

      capture_log(fn ->
        assert Api.fetch_config() == {:error, %HTTPoison.Error{reason: :econnrefused}}
      end)
    end

    test "returns :error when API response has invalid format" do
      expect(HTTPoisonMock, :get, fn _url, _headers ->
        {:ok, %HTTPoison.Response{status_code: 200, body: JSON.encode!(%{"success" => true})}}
      end)

      capture_log(fn ->
        {:ok, body} = Api.fetch_config()
        decoded = JSON.decode!(body)
        assert decoded == %{"screens" => %{}}
      end)
    end
  end

  describe "put_config/1" do
    test "posts screens payload as screen_configs list" do
      config = valid_config()

      expect(HTTPoisonMock, :post, fn _url, body, _headers ->
        decoded = JSON.decode!(body)

        assert %{"screen_configs" => screen_configs} = decoded

        merged_screens =
          Enum.reduce(screen_configs, %{}, fn %{"id" => screen_id, "config" => config}, acc ->
            Map.put(acc, screen_id, config)
          end)

        assert get_in(merged_screens, ["SCREEN-1", "app_id"]) == "busway_v2"

        {:ok, %HTTPoison.Response{status_code: 500, body: JSON.encode!(%{"success" => true})}}
      end)

      assert Api.put_config(config) == :ok
    end

    test "returns error when post fails" do
      config = valid_config()

      expect(HTTPoisonMock, :post, fn _url, _body, _headers ->
        {:error, %HTTPoison.Error{reason: :econnrefused}}
      end)

      capture_log(fn ->
        assert Api.put_config(config) == {:error, %HTTPoison.Error{reason: :econnrefused}}
      end)
    end

    test "returns error when post response success is false" do
      config = valid_config()

      expect(HTTPoisonMock, :post, fn _url, _body, _headers ->
        {:ok, %HTTPoison.Response{status_code: 200, body: JSON.encode!(%{"success" => false})}}
      end)

      capture_log(fn ->
        assert Api.put_config(config) == {:error, :unexpected_response}
      end)
    end
  end

  defp valid_config do
    %{
      "screens" => %{
        "SCREEN-1" => %{
          "disabled" => false,
          "name" => "",
          "device_id" => nil,
          "location" => nil,
          "app_id" => "busway_v2",
          "vendor" => nil,
          "tags" => [],
          "refresh_if_loaded_before" => nil,
          "app_params" => %{
            "header" => %{"stop_name" => "Chelsea Library", "read_as" => nil},
            "template" => "solo",
            "departures" => %{"sections" => []},
            "evergreen_content" => [],
            "secondary_departures" => nil,
            "emergency_takeover" => nil,
            "emergency_messaging_location" => nil,
            "include_logo_in_header" => true
          }
        }
      }
    }
    |> Config.from_json()
  end
end
