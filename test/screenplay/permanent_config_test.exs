defmodule Screenplay.PermanentConfigTest do
  use ExUnit.Case

  import Mox

  alias Screenplay.PendingScreensConfig.Fetch.Local
  alias Screenplay.PermanentConfig
  alias Screenplay.Places.{Cache, Place}
  alias Screenplay.Places.Place.ShowtimeScreen
  alias ScreensConfig.{PendingConfig, Screen}
  alias ScreensConfig.V2.{Alerts, Audio, Departures, Footer, GlEink, Header, LineMap}

  def fetch_current_config_version do
    {:ok, _config, metadata} = Local.fetch_config()
    metadata.version_id
  end

  def get_fixture_path(file_name) do
    Path.join(~w[#{File.cwd!()} test fixtures #{file_name}])
  end

  setup_all do
    start_supervised!(Screenplay.Places.Cache)

    on_exit(fn ->
      empty_config = %{screens: %{}}
      pending_screens_path = get_fixture_path("pending_config.json")
      published_screens_path = get_fixture_path("screens_config.json")

      File.write(
        pending_screens_path,
        Jason.encode!(empty_config)
      )

      File.write(
        published_screens_path,
        Jason.encode!(empty_config)
      )

      File.rm(pending_screens_path <> ".temp")
      File.rm(published_screens_path <> ".temp")
    end)
  end

  describe "put_pending_screens/3" do
    setup do
      empty_config = %{screens: %{}}
      pending_screens_path = get_fixture_path("pending_config.json")
      published_screens_path = get_fixture_path("screens_config.json")

      File.write(
        pending_screens_path,
        Jason.encode!(empty_config)
      )

      File.write(
        published_screens_path,
        Jason.encode!(empty_config)
      )
    end

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
          "updated_pending_screens" => [],
          "new_pending_screens" => [
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
                          direction_id: 0
                        }
                      }
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

      {:ok, config, metadata} = Local.fetch_config()
      assert expected_file_contents == config

      places_and_screens = %{
        "place-test" => %{
          "updated_pending_screens" => [
            %{
              "new_id" => "12345",
              "app_params" => %{
                "header" => %{"route_id" => "Green-B", "direction_id" => 1},
                "platform_location" => "back"
              },
              "screen_id" => "1234"
            }
          ],
          "new_pending_screens" => []
        }
      }

      assert PermanentConfig.put_pending_screens(
               places_and_screens,
               :gl_eink_v2,
               metadata.version_id
             ) == :ok

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

      {:ok, config, _metadata} = Local.fetch_config()
      assert expected_file_contents == config
    end

    test "returns version_mismatch error if version is outdated" do
      places_and_screens = %{
        "place-test" => %{
          "updated_pending_screens" => [],
          "new_pending_screens" => [
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

    test "returns error when duplicate screen IDs are found" do
      version = fetch_current_config_version()

      expect(Screenplay.RoutePatterns.Mock, :fetch_platform_ids_for_route_at_stop, 2, fn stop_id,
                                                                                         route_id ->
        assert stop_id == "place-test"
        assert route_id == "Green-B"

        {"123", "456"}
      end)

      places_and_screens = %{
        "place-test" => %{
          "updated_pending_screens" => [],
          "new_pending_screens" => [
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
      version = fetch_current_config_version()

      places_and_screens = %{
        "place-test" => %{
          "updated_pending_screens" => [],
          "new_pending_screens" => [
            %{
              "new_id" => "1234",
              "app_params" => %{
                "header" => %{"route_id" => "Green-B", "direction_id" => 0},
                "platform_location" => "front"
              }
            },
            %{
              "new_id" => "5678",
              "app_params" => %{
                "header" => %{"route_id" => "Green-B", "direction_id" => 0},
                "platform_location" => "front"
              }
            },
            %{
              "new_id" => "5678",
              "app_params" => %{
                "header" => %{"route_id" => "Green-B", "direction_id" => 0},
                "platform_location" => "front"
              }
            }
          ]
        }
      }

      assert PermanentConfig.put_pending_screens(places_and_screens, :gl_eink_v2, version) ==
               {:error, {:duplicate_screen_ids, ["1234", "5678"]}}
    end
  end

  describe "publish_pending_screens/1" do
    setup do
      pending_screens_path = get_fixture_path("pending_config.json")

      config =
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
            },
            "23456" => %Screen{
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
        |> Jason.encode!()

      File.write(pending_screens_path, config)

      [
        %Place{
          id: "place-test",
          name: "Test Place",
          routes: ["Green-B"],
          screens: [],
          description: nil
        }
      ]
      |> Enum.map(&{&1.id, &1})
      |> Cache.put_all()

      on_exit(fn ->
        Cache.delete_all()
      end)
    end

    test "publishes pending screens" do
      assert {:ok,
              [
                %Place{
                  id: "place-test",
                  name: "Test Place",
                  routes: ["Green-B"],
                  screens: [
                    %ShowtimeScreen{
                      id: "12345",
                      type: :gl_eink_v2,
                      disabled: false,
                      direction_id: nil,
                      location: ""
                    }
                  ],
                  description: nil
                }
              ]} = PermanentConfig.publish_pending_screens("place-test", :gl_eink_v2, ["23456"])
    end
  end
end
