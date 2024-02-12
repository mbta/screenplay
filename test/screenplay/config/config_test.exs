defmodule Screenplay.Config.ConfigTest do
  use ExUnit.Case

  import Mox

  alias Screenplay.Config.PermanentConfig
  alias Screenplay.PendingScreensConfig.Fetch.Local
  alias ScreensConfig.{PendingConfig, Screen}
  alias ScreensConfig.V2.{Alerts, Audio, Departures, Footer, GlEink, Header, LineMap}

  def fetch_current_config_version do
    {:ok, _config, version} = Local.fetch_config()
    version
  end

  setup_all do
    on_exit(fn ->
      empty_config = %{screens: %{}}

      File.write(
        Path.join(~w[#{File.cwd!()} test fixtures pending_config.json]),
        Jason.encode!(empty_config)
      )
    end)
  end

  describe "put_pending_screens/3" do
    test "adds and updates a new config for GL E-Ink" do
      version = fetch_current_config_version()

      expect(Screenplay.RoutePatterns.Mock, :fetch_platform_ids_for_route_at_stop, 2, fn stop_id,
                                                                                         route_id ->
        assert stop_id == "place-test"
        assert route_id == "Green-B"

        {"123", "456"}
      end)

      places_and_screens = %{
        "place-test" => %{
          "updated_screens" => %{},
          "new_screens" => [
            %{
              "new_id" => "1234",
              "app_params" => %{
                "header" => %{"route_id" => "Green-B", "direction_id" => 0},
                "platform_location" => "front"
              }
            }
          ]
        }
      }

      assert PermanentConfig.put_pending_screens(places_and_screens, :gl_eink_v2, version) == :ok

      expected_file_contents =
        %PendingConfig{
          screens: %{
            "1234" => %Screen{
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
                          direction_id: 0,
                          route_type: nil
                        },
                        opts: %Departures.Query.Opts{
                          include_schedules: false
                        }
                      },
                      filter: nil,
                      headway: %Departures.Headway{
                        headway_id: nil,
                        override: nil
                      },
                      bidirectional: false
                    }
                  ]
                },
                footer: %Footer{stop_id: "place-test"},
                header: %Header.Destination{
                  route_id: "Green-B",
                  direction_id: 0
                },
                alerts: %Alerts{stop_id: "123"},
                line_map: %LineMap{
                  stop_id: "123",
                  station_id: "place-test",
                  direction_id: 0,
                  route_id: "Green-B"
                },
                evergreen_content: [],
                audio: %Audio{
                  start_time: ~T[00:00:00],
                  stop_time: ~T[23:59:59],
                  daytime_start_time: ~T[00:00:00],
                  daytime_stop_time: ~T[00:00:00],
                  days_active: [1, 2, 3, 4, 5, 6, 7],
                  daytime_volume: 0.0,
                  nighttime_volume: 0.0,
                  interval_offset_seconds: 0
                },
                platform_location: "front"
              },
              tags: []
            }
          }
        }
        |> PendingConfig.to_json()
        |> Jason.encode!(pretty: true)

      {:ok, config, version} = Local.fetch_config()
      assert expected_file_contents == config

      places_and_screens = %{
        "place-test" => %{
          "updated_screens" => %{
            "1234" => %{
              "new_id" => "12345",
              "app_params" => %{
                "header" => %{"route_id" => "Green-B", "direction_id" => 1},
                "platform_location" => "back"
              }
            }
          },
          "new_screens" => []
        }
      }

      assert PermanentConfig.put_pending_screens(places_and_screens, :gl_eink_v2, version) == :ok

      expected_file_contents =
        %PendingConfig{
          screens: %{
            "12345" => %Screen{
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
                          direction_id: 1,
                          route_type: nil
                        },
                        opts: %Departures.Query.Opts{
                          include_schedules: false
                        }
                      },
                      filter: nil,
                      headway: %Departures.Headway{
                        headway_id: nil,
                        override: nil
                      },
                      bidirectional: false
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
                audio: %Audio{
                  start_time: ~T[00:00:00],
                  stop_time: ~T[23:59:59],
                  daytime_start_time: ~T[00:00:00],
                  daytime_stop_time: ~T[00:00:00],
                  days_active: [1, 2, 3, 4, 5, 6, 7],
                  daytime_volume: 0.0,
                  nighttime_volume: 0.0,
                  interval_offset_seconds: 0
                },
                platform_location: "back"
              },
              tags: []
            }
          }
        }
        |> PendingConfig.to_json()
        |> Jason.encode!(pretty: true)

      {:ok, config, _} = Local.fetch_config()
      assert expected_file_contents == config
    end

    test "returns version_mismatch error if version is outdated" do
      places_and_screens = %{
        "place-test" => %{
          "updated_screens" => %{},
          "new_screens" => [
            %{
              "new_id" => "1234",
              "app_params" => %{
                "header" => %{"route_id" => "Green-B", "direction_id" => 0},
                "platform_location" => "front"
              }
            }
          ]
        }
      }

      assert PermanentConfig.put_pending_screens(places_and_screens, :gl_eink_v2, "1234") ==
               {:error, :version_mismatch}
    end
  end
end