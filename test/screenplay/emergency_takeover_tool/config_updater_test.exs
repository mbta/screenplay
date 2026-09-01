defmodule Screenplay.EmergencyTakeoverTool.ConfigUpdaterTest do
  use ExUnit.Case

  import ExUnit.CaptureLog
  import Mox

  alias Screenplay.EmergencyTakeoverTool.ConfigUpdater

  alias ScreensConfig.{
    Config,
    ContentSummary,
    ElevatorStatus,
    EmergencyTakeover,
    Header,
    Screen
  }

  alias ScreensConfig.Screen.PreFare

  setup :verify_on_exit!

  setup do
    Application.put_env(:screenplay, :http_client, HTTPoisonMock)
    original_token = Application.get_env(:screenplay, :screens_api_key)
    Application.put_env(:screenplay, :screens_api_key, "test-token")

    on_exit(fn ->
      Application.put_env(:screenplay, :screens_api_key, original_token)
    end)

    :ok
  end

  @screen_without_takeover %Screen{
    vendor: :mercury,
    device_id: nil,
    name: nil,
    app_id: :pre_fare_v2,
    refresh_if_loaded_before: nil,
    disabled: false,
    hidden_from_screenplay: false,
    app_params: %PreFare{
      emergency_messaging_location: :inside,
      emergency_takeover: nil,
      content_summary: %ContentSummary{parent_station_id: "place-test"},
      elevator_status: %ElevatorStatus{parent_station_id: "place-test"},
      full_line_map: [],
      header: %Header.StopId{stop_id: "place-test"},
      reconstructed_alert_widget: %ScreensConfig.Alerts{stop_id: "place-test"}
    },
    tags: []
  }

  describe "add_emergency_takeover_configs/3" do
    test "adds an emergency takeover config to a screen" do
      alert_id = "alert-1"
      takeover_screen_id = "PRE-1"
      message = %{type: :custom, text: %{indoor: "Indoor Message", outdoor: "Outdoor Message"}}

      expect_config_fetch_and_post(%{
        "PRE-1" => @screen_without_takeover
      })

      assert ConfigUpdater.add_emergency_takeover_configs(
               alert_id,
               [takeover_screen_id],
               message
             ) == :ok

      screens = posted_screens()

      expected_takeover = %EmergencyTakeover{
        audio_asset_path: nil,
        text_for_audio: "Indoor Message",
        visual_asset_path: "test/fixtures/emergency_takeover_images/alert-1/indoor_portrait.png"
      }

      assert screens[takeover_screen_id] ==
               put_in(
                 @screen_without_takeover.app_params.emergency_takeover,
                 expected_takeover
               )

      assert map_size(screens) == 1
    end

    test "adds a canned emergency takeover config to a screen" do
      alert_id = "alert-1"
      takeover_screen_id = "PRE-1"
      message = %{type: :canned, id: 1}

      expect_config_fetch_and_post(%{
        "PRE-1" => @screen_without_takeover
      })

      assert ConfigUpdater.add_emergency_takeover_configs(
               alert_id,
               [takeover_screen_id],
               message
             ) == :ok

      screens = posted_screens()

      expected_takeover = %EmergencyTakeover{
        audio_asset_path:
          "test/fixtures/emergency_takeover_images/canned/audio/LeaveStation-Indoor.mp3",
        text_for_audio: nil,
        visual_asset_path:
          "test/fixtures/emergency_takeover_images/canned/images/LeaveStation-indoor-portrait.gif"
      }

      assert screens[takeover_screen_id] ==
               put_in(
                 @screen_without_takeover.app_params.emergency_takeover,
                 expected_takeover
               )

      assert map_size(screens) == 1
    end

    test "warns when the API returns extra screen IDs" do
      expect_config_fetch_and_post(%{
        "PRE-1" => @screen_without_takeover,
        "PRE-2" => @screen_without_takeover
      })

      log =
        capture_log(fn ->
          assert ConfigUpdater.add_emergency_takeover_configs(
                   "alert-1",
                   ["PRE-1"],
                   %{type: :custom, text: %{indoor: "Indoor", outdoor: "Outdoor"}}
                 ) == :ok
        end)

      assert log =~ "missing=[]"
      assert log =~ ~s(extra=["PRE-2"])
      assert map_size(posted_screens()) == 1
    end

    test "warns when the API omits requested screen IDs" do
      expect_config_fetch_and_post(%{"PRE-1" => @screen_without_takeover})

      log =
        capture_log(fn ->
          assert ConfigUpdater.add_emergency_takeover_configs(
                   "alert-1",
                   ["PRE-1", "PRE-2"],
                   %{type: :custom, text: %{indoor: "Indoor", outdoor: "Outdoor"}}
                 ) == :ok
        end)

      assert log =~ ~s(missing=["PRE-2"])
      assert log =~ "extra=[]"
      assert map_size(posted_screens()) == 1
    end
  end

  describe "clear_emergency_takeover_configs/1" do
    test "clears emergency takeover configs from screens" do
      takeover_screen_id = "PRE-1"

      screen_with_takeover =
        put_in(
          @screen_without_takeover.app_params.emergency_takeover,
          %EmergencyTakeover{
            audio_asset_path: nil,
            text_for_audio: "Indoor Message",
            visual_asset_path:
              "test/fixtures/emergency_takeover_images/alert-1/indoor_portrait.png"
          }
        )

      expect_config_fetch_and_post(%{
        "PRE-1" => screen_with_takeover
      })

      assert ConfigUpdater.clear_emergency_takeover_configs([takeover_screen_id]) == :ok

      screens = posted_screens()

      assert screens[takeover_screen_id] == @screen_without_takeover
      assert map_size(screens) == 1
    end
  end

  defp expect_config_fetch_and_post(existing_screens) do
    api_config =
      %Config{screens: existing_screens}
      |> Config.to_json()
      |> JSON.encode!()

    expect(HTTPoisonMock, :get, fn _url, _headers ->
      {:ok, %{status_code: 200, body: JSON.encode!(%{"success" => true, "config" => api_config})}}
    end)

    test_pid = self()

    expect(HTTPoisonMock, :post, fn _url, body, _headers ->
      send(test_pid, {:posted_screen_configs, body})
      {:ok, %{status_code: 201, body: JSON.encode!(%{"success" => true})}}
    end)
  end

  defp posted_screens do
    assert_receive {:posted_screen_configs, body}

    %{"screen_configs" => screen_configs} = JSON.decode!(body)

    screens =
      Enum.reduce(screen_configs, %{}, fn %{"id" => screen_id, "config" => config}, acc ->
        Map.put(acc, screen_id, config)
      end)

    %Config{screens: screens} = Config.from_json(%{"screens" => screens})
    screens
  end
end
