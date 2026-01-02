defmodule Screenplay.Places.BuilderTest do
  use ExUnit.Case

  import Mox

  alias Screenplay.Places.{Builder, Place}
  alias Screenplay.Places.Cache, as: PlacesCache
  alias Screenplay.ScreensConfig.Cache, as: ScreensConfigCache

  setup_all do
    start_supervised!(Screenplay.Places.Cache)
    :ok
  end

  describe "handle_info/2" do
    setup do
      seed_screens_config_cache()

      on_exit(fn ->
        PlacesCache.delete_all()
        ScreensConfigCache.delete_all()
      end)
    end

    test "adds all parent stations as places" do
      expect(Screenplay.Stops.Mock, :fetch_by_ids, 2, fn _stop_ids -> {:ok, []} end)

      expect(Screenplay.Stops.Mock, :fetch_all_parent_stations, 1, fn ->
        {:ok,
         [
           %{"id" => "place-test", "attributes" => %{"name" => "Test Place"}},
           %{"id" => "place-tapst", "attributes" => %{"name" => "Tappan Street"}}
         ]}
      end)

      expect(Screenplay.Routes.Mock, :fetch_routes_for_stop, 2, fn _ ->
        {:ok, [%{"id" => "Red", "attributes" => %{"type" => 1}}]}
      end)

      expect(Screenplay.Facilities.Mock, :fetch, 1, fn _ ->
        {:ok, %{"relationships" => %{"stop" => %{"data" => %{"id" => "place-tapst"}}}}}
      end)

      assert {:noreply, _} = Builder.handle_info(:build, [])

      assert [
               %Place{
                 id: "place-test",
                 name: "Test Place",
                 routes: ["Red"],
                 screens: [],
                 description: nil
               },
               %Place{
                 id: "place-tapst",
                 name: "Tappan Street",
                 routes: ["Red"],
                 screens: [
                   %Place.ShowtimeScreen{
                     id: "EIG-546",
                     type: :gl_eink_v2,
                     disabled: false,
                     direction_id: nil,
                     location: ""
                   },
                   %Place.ShowtimeScreen{
                     direction_id: nil,
                     disabled: false,
                     id: "ELE-101",
                     location: "",
                     type: :elevator_v2
                   }
                 ],
                 description: nil
               }
             ] = PlacesCache.all(nil, return: :value)
    end

    test "adds bus stops with screens" do
      expect(Screenplay.Stops.Mock, :fetch_by_ids, 2, fn _stop_ids ->
        {:ok, [%{"id" => "7412", "attributes" => %{"name" => "Lynn St @ Beach St"}}]}
      end)

      expect(Screenplay.Stops.Mock, :fetch_all_parent_stations, 1, fn -> {:ok, []} end)

      expect(Screenplay.Routes.Mock, :fetch_routes_for_stop, 2, fn _ ->
        {:ok, [%{"id" => "108", "attributes" => %{"type" => 3}}]}
      end)

      expect(Screenplay.Facilities.Mock, :fetch, 1, fn _ ->
        {:ok, %{"relationships" => %{"stop" => %{"data" => %{"id" => "place-tapst"}}}}}
      end)

      assert {:noreply, _} = Builder.handle_info(:build, [])

      assert [
               %Place{
                 id: "7412",
                 name: "Lynn St @ Beach St",
                 routes: ["Bus"],
                 screens: [
                   %Place.ShowtimeScreen{
                     direction_id: nil,
                     disabled: false,
                     id: "EIB-124",
                     location: "",
                     type: :bus_eink_v2
                   }
                 ],
                 description: nil
               }
             ] = PlacesCache.all(nil, return: :value)
    end

    test "splits multi-place screens" do
      expect(Screenplay.Stops.Mock, :fetch_by_ids, 2, fn _stop_ids ->
        {:ok,
         [
           %{"id" => "117", "attributes" => %{"name" => "Congress St @ Haymarket Sta"}},
           %{
             "id" => "70203",
             "attributes" => %{"name" => "Haymarket"},
             "relationships" => %{"parent_station" => %{"data" => %{"id" => "place-haecl"}}}
           },
           %{
             "id" => "70204",
             "attributes" => %{"name" => "Haymarket"},
             "relationships" => %{"parent_station" => %{"data" => %{"id" => "place-haecl"}}}
           }
         ]}
      end)

      expect(Screenplay.Stops.Mock, :fetch_all_parent_stations, 1, fn ->
        {:ok, [%{"id" => "place-haecl", "attributes" => %{"name" => "Haymarket"}}]}
      end)

      expect(Screenplay.Routes.Mock, :fetch_routes_for_stop, 2, fn
        "117" ->
          {:ok, [%{"id" => "4", "attributes" => %{"type" => 3}}]}

        "place-haecl" ->
          {:ok,
           [
             %{"id" => "Orange", "attributes" => %{"type" => 1}},
             %{"id" => "Green-D", "attributes" => %{"type" => 0}},
             %{"id" => "Green-E", "attributes" => %{"type" => 0}}
           ]}
      end)

      expect(Screenplay.Facilities.Mock, :fetch, 1, fn _ ->
        {:ok, %{"relationships" => %{"stop" => %{"data" => %{"id" => "place-tapst"}}}}}
      end)

      assert {:noreply, _} = Builder.handle_info(:build, [])

      assert [
               %Place{
                 description: nil,
                 id: "117",
                 name: "Congress St @ Haymarket Sta",
                 routes: ["Bus"],
                 screens: [
                   %Place.ShowtimeScreen{
                     direction_id: nil,
                     disabled: false,
                     id: "MUL-114-V2",
                     location: "",
                     type: :busway_v2
                   }
                 ]
               },
               %Place{
                 id: "place-haecl",
                 name: "Haymarket",
                 routes: ["Green-D", "Green-E", "Orange"],
                 screens: [
                   %Place.ShowtimeScreen{
                     direction_id: nil,
                     disabled: false,
                     id: "MUL-114-V2",
                     location: "",
                     type: :busway_v2
                   }
                 ],
                 description: nil
               }
             ] = PlacesCache.all(nil, return: :value)
    end

    test "omits screens with hidden_from_screenplay: true" do
      expect(Screenplay.Stops.Mock, :fetch_by_ids, 2, fn _stop_ids -> {:ok, []} end)

      expect(Screenplay.Stops.Mock, :fetch_all_parent_stations, 1, fn ->
        {:ok, [%{"id" => "place-mvbcl", "attributes" => %{"name" => "Maverick"}}]}
      end)

      expect(Screenplay.Routes.Mock, :fetch_routes_for_stop, 1, fn _ ->
        {:ok, [%{"id" => "Blue", "attributes" => %{"type" => 1}}]}
      end)

      expect(Screenplay.Facilities.Mock, :fetch, 1, fn _ ->
        {:ok, %{"relationships" => %{"stop" => %{"data" => %{"id" => "place-tapst"}}}}}
      end)

      assert {:noreply, _} = Builder.handle_info(:build, [])

      assert [
               %Place{
                 description: nil,
                 id: "place-mvbcl",
                 name: "Maverick",
                 routes: ["Blue"],
                 screens: []
               }
             ] = PlacesCache.all(nil, return: :value)
    end

    test "adds PA/ESS screens" do
      expect(Screenplay.Stops.Mock, :fetch_by_ids, 2, fn _stop_ids ->
        {:ok,
         [
           %{
             "id" => "70036",
             "attributes" => %{"name" => "Oak Grove"},
             "relationships" => %{"parent_station" => %{"data" => %{"id" => "place-ogmnl"}}}
           },
           %{
             "id" => "Oak Grove-01",
             "attributes" => %{"name" => "Oak Grove"},
             "relationships" => %{"parent_station" => %{"data" => %{"id" => "place-ogmnl"}}}
           },
           %{
             "id" => "Oak Grove-02",
             "attributes" => %{"name" => "Oak Grove"},
             "relationships" => %{"parent_station" => %{"data" => %{"id" => "place-ogmnl"}}}
           },
           %{
             "id" => "74615",
             "attributes" => %{"name" => "World Trade Center - Silver Line - South Station"},
             "relationships" => %{"parent_station" => %{"data" => %{"id" => "place-wtcst"}}}
           }
         ]}
      end)

      expect(Screenplay.Stops.Mock, :fetch_all_parent_stations, 1, fn ->
        {:ok,
         [
           %{"id" => "place-ogmnl", "attributes" => %{"name" => "Oak Grove"}},
           %{"id" => "place-wtcst", "attributes" => %{"name" => "World Trade Center"}}
         ]}
      end)

      expect(Screenplay.Routes.Mock, :fetch_routes_for_stop, 2, fn
        id when id in ["place-wtcst", "74615", "74613"] ->
          {:ok,
           [
             %{"id" => "741", "attributes" => %{"type" => 3}},
             %{"id" => "742", "attributes" => %{"type" => 3}},
             %{"id" => "743", "attributes" => %{"type" => 3}},
             %{"id" => "746", "attributes" => %{"type" => 3}}
           ]}

        _ ->
          {:ok, [%{"id" => "Orange", "attributes" => %{"type" => 1}}]}
      end)

      expect(Screenplay.Facilities.Mock, :fetch, 1, fn _ ->
        {:ok, %{"relationships" => %{"stop" => %{"data" => %{"id" => "place-tapst"}}}}}
      end)

      assert {:noreply, _} = Builder.handle_info(:build, [])

      assert [
               %Screenplay.Places.Place{
                 id: "place-wtcst",
                 name: "World Trade Center - Silver Line - South Station",
                 routes: ["Silver"],
                 screens: [
                   %Place.PaEssScreen{
                     id: "Silver_Line.World_Trade_Ctr_mezz",
                     label: nil,
                     station_code: "SWTC",
                     type: "pa_ess",
                     zone: "m",
                     routes: [
                       %{id: "741", direction_id: 1},
                       %{id: "742", direction_id: 1},
                       %{id: "743", direction_id: 1},
                       %{id: "746", direction_id: 1},
                       %{id: "741", direction_id: 0},
                       %{id: "742", direction_id: 0},
                       %{id: "743", direction_id: 0},
                       %{id: "746", direction_id: 0}
                     ],
                     location: nil
                   }
                 ],
                 description: nil
               },
               %Place{
                 description: nil,
                 id: "place-ogmnl",
                 name: "Oak Grove",
                 routes: ["Orange"],
                 screens: [
                   %Place.PaEssScreen{
                     id: "oak_grove_mezzanine_southbound",
                     label: nil,
                     station_code: "OOAK",
                     type: "pa_ess",
                     zone: "m",
                     routes: [%{id: "Orange", direction_id: 0}],
                     location: nil
                   }
                 ]
               }
             ] = PlacesCache.all(nil, return: :value)
    end
  end

  defp seed_screens_config_cache do
    screens_config_path = Path.join(~w[#{File.cwd!()} test fixtures builder screens_config.json])

    config =
      screens_config_path
      |> File.read!()
      |> Jason.decode!()
      |> ScreensConfig.Config.from_json()

    ScreensConfigCache.put_all(Map.to_list(config.screens))
  end
end
