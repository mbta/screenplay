defmodule Screenplay.PredictionSuppressionTest do
  use ExUnit.Case

  import Mox
  alias Screenplay.PredictionSuppression

  @api_response %{
    data: [
      %{
        "attributes" => %{"canonical" => true, "typicality" => 1},
        "id" => "Blue-6-0",
        "relationships" => %{
          "representative_trip" => %{"data" => %{"id" => "canonical-Blue-C1-0", "type" => "trip"}},
          "route" => %{"data" => %{"id" => "Blue", "type" => "route"}}
        },
        "type" => "route_pattern"
      },
      %{
        "attributes" => %{"canonical" => false, "typicality" => 1},
        "id" => "746-_-0",
        "relationships" => %{
          "representative_trip" => %{"data" => %{"id" => "66858485", "type" => "trip"}},
          "route" => %{"data" => %{"id" => "746", "type" => "route"}}
        },
        "type" => "route_pattern"
      }
    ],
    included: [
      %{
        "attributes" => %{"direction_id" => 0},
        "id" => "canonical-Blue-C1-0",
        "relationships" => %{
          "route" => %{"data" => %{"id" => "Blue", "type" => "route"}},
          "stops" => %{
            "data" => [
              %{"id" => "70059", "type" => "stop"},
              %{"id" => "70057", "type" => "stop"},
              %{"id" => "70055", "type" => "stop"}
            ]
          }
        },
        "type" => "trip"
      },
      %{
        "id" => "70059",
        "relationships" => %{
          "parent_station" => %{"data" => %{"id" => "place-wondl", "type" => "stop"}}
        },
        "type" => "stop"
      },
      %{
        "id" => "70057",
        "relationships" => %{
          "parent_station" => %{"data" => %{"id" => "place-rbmnl", "type" => "stop"}}
        },
        "type" => "stop"
      },
      %{
        "id" => "70055",
        "relationships" => %{
          "parent_station" => %{"data" => %{"id" => "place-bmmnl", "type" => "stop"}}
        },
        "type" => "stop"
      },
      %{
        "attributes" => %{"direction_id" => 0},
        "id" => "66858485",
        "relationships" => %{
          "route" => %{"data" => %{"id" => "746", "type" => "route"}},
          "stops" => %{
            "data" => [
              %{"id" => "74611", "type" => "stop"},
              %{"id" => "74612", "type" => "stop"},
              %{"id" => "74613", "type" => "stop"}
            ]
          }
        },
        "type" => "trip"
      },
      %{
        "id" => "74611",
        "relationships" => %{
          "parent_station" => %{"data" => %{"id" => "place-sstat", "type" => "stop"}}
        },
        "type" => "stop"
      },
      %{
        "id" => "74612",
        "relationships" => %{
          "parent_station" => %{"data" => %{"id" => "place-crtst", "type" => "stop"}}
        },
        "type" => "stop"
      },
      %{
        "id" => "74613",
        "relationships" => %{
          "parent_station" => %{"data" => %{"id" => "place-wtcst", "type" => "stop"}}
        },
        "type" => "stop"
      }
    ]
  }

  test "update" do
    expect(HTTPoison.Mock, :get, fn url, _, _ ->
      assert url =~ "/route_patterns"
      {:ok, %HTTPoison.Response{status_code: 200, body: Jason.encode!(@api_response)}}
    end)

    PredictionSuppression.init([])
    PredictionSuppression.handle_info(:update, %{})

    assert PredictionSuppression.line_stops() ==
             [
               %{
                 line: "Blue",
                 suppression_type: :terminal,
                 direction_id: 0,
                 stop_id: "place-wondl"
               },
               %{line: "Blue", suppression_type: :stop, direction_id: 0, stop_id: "place-rbmnl"},
               %{line: "Blue", suppression_type: nil, direction_id: 0, stop_id: "place-bmmnl"},
               %{
                 line: "Silver",
                 suppression_type: :stop,
                 direction_id: 0,
                 stop_id: "place-sstat"
               },
               %{
                 line: "Silver",
                 suppression_type: :stop,
                 direction_id: 0,
                 stop_id: "place-crtst"
               },
               %{line: "Silver", suppression_type: nil, direction_id: 0, stop_id: "place-wtcst"}
             ]
  end
end
