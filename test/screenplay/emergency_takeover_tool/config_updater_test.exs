defmodule Screenplay.EmergencyTakeoverTool.ConfigUpdaterTest do
  use ExUnit.Case

  alias Screenplay.EmergencyTakeoverTool.ConfigUpdater

  alias ScreensConfig.{
    Alerts,
    Config,
    ContentSummary,
    Departures,
    ElevatorStatus,
    EmergencyTakeover,
    Footer,
    Header,
    LineMap,
    Screen
  }

  alias ScreensConfig.Screen.{GlEink, PreFare}

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
  @gl_eink_screen %Screen{
    vendor: :mercury,
    device_id: nil,
    name: nil,
    app_id: :gl_eink_v2,
    refresh_if_loaded_before: nil,
    disabled: false,
    hidden_from_screenplay: false,
    app_params: %GlEink{
      departures: %Departures{
        sections: [
          %Departures.Section{
            query: %Departures.Query{
              params: %Departures.Query.Params{
                stop_ids: ["place-test"],
                route_ids: ["Green-B"],
                direction_id: 1
              }
            }
          }
        ]
      },
      footer: %Footer{stop_id: "place-test"},
      header: %Header.Destination{
        route_id: "Green-B",
        direction_id: 1
      },
      alerts: %Alerts{stop_id: "456"},
      line_map: %LineMap{
        stop_id: "456",
        station_id: "place-test",
        direction_id: 1,
        route_id: "Green-B"
      },
      evergreen_content: [],
      platform_location: :back
    },
    tags: []
  }

  def get_fixture_path(file_name) do
    Path.join(~w[#{File.cwd!()} test fixtures #{file_name}])
  end

  setup_all do
    on_exit(fn ->
      empty_config = %{screens: %{}}
      published_screens_path = get_fixture_path("screens_config.json")

      File.write(
        published_screens_path,
        Jason.encode!(empty_config)
      )

      File.rm(published_screens_path <> ".temp")
    end)
  end

  describe "add_emergency_takeover_configs/3" do
    setup do
      published_screens_path = get_fixture_path("screens_config.json")

      config =
        %Config{
          screens: %{
            "PRE-1" => @screen_without_takeover,
            "PRE-2" => @screen_without_takeover,
            "GL-1" => @gl_eink_screen
          }
        }
        |> Config.to_json()
        |> Jason.encode!()

      File.write(published_screens_path, config)
    end

    test "adds an emergency takeover config to a screen" do
      alert_id = "alert-1"
      takeover_screen_id = "PRE-1"
      message = %{type: :custom, text: %{indoor: "Indoor Message", outdoor: "Outdoor Message"}}

      assert ConfigUpdater.add_emergency_takeover_configs(
               alert_id,
               [takeover_screen_id],
               message
             ) == :ok

      {:ok, file_contents, _metadata} = Screenplay.ScreensConfig.Fetch.Local.fetch_config()
      %Config{screens: screens} = file_contents |> Jason.decode!() |> Config.from_json()

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

      assert screens["PRE-2"] == @screen_without_takeover
      assert screens["GL-1"] == @gl_eink_screen
    end

    test "adds a canned emergency takeover config to a screen" do
      alert_id = "alert-1"
      takeover_screen_id = "PRE-1"
      message = %{type: :canned, id: 1}

      assert ConfigUpdater.add_emergency_takeover_configs(
               alert_id,
               [takeover_screen_id],
               message
             ) == :ok

      {:ok, file_contents, _metadata} = Screenplay.ScreensConfig.Fetch.Local.fetch_config()
      %Config{screens: screens} = file_contents |> Jason.decode!() |> Config.from_json()

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

      assert screens["PRE-2"] == @screen_without_takeover
    end
  end

  describe "clear_emergency_takeover_configs/1" do
    setup do
      published_screens_path = get_fixture_path("screens_config.json")

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

      config =
        %Config{
          screens: %{
            "PRE-1" => screen_with_takeover,
            "PRE-2" => @screen_without_takeover,
            "GL-1" => @gl_eink_screen
          }
        }
        |> Config.to_json()
        |> Jason.encode!()

      File.write(published_screens_path, config)
    end

    test "clears emergency takeover configs from screens" do
      takeover_screen_id = "PRE-1"

      assert ConfigUpdater.clear_emergency_takeover_configs([takeover_screen_id]) == :ok

      {:ok, file_contents, _metadata} = Screenplay.ScreensConfig.Fetch.Local.fetch_config()
      %Config{screens: screens} = file_contents |> Jason.decode!() |> Config.from_json()

      assert screens[takeover_screen_id] == @screen_without_takeover
      assert screens["PRE-2"] == @screen_without_takeover
      assert screens["GL-1"] == @gl_eink_screen
    end
  end
end
