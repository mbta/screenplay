defmodule ScreenplayWeb.SuppressedPredictionsApiControllerTest do
  alias Screenplay.PlaceCacheHelpers
  use ScreenplayWeb.ConnCase

  import Screenplay.PlaceCacheHelpers
  import Screenplay.Factory

  setup_all do
    start_supervised!(Screenplay.Places.Cache)
    :ok
  end

  describe "GET /api/suppressed-predictions with index/2" do
    test "response 403 if x-api-key is missing", %{conn: conn} do
      conn = get(conn, "/api/suppressed-predictions")

      assert %{status: 403, halted: true, resp_body: "Invalid API key"} = conn
    end

    test "responds 403 if x-api-key does not match app API key", %{conn: conn} do
      conn =
        conn
        |> Plug.Conn.put_req_header("x-api-key", "1234")
        |> get("/api/suppressed-predictions")

      assert %{status: 403, halted: true, resp_body: "Invalid API key"} = conn
    end

    @tag :api_authenticated
    test "responds list of active messages if x-api-key matches app API key", %{conn: conn} do
      conn = get(conn, "/api/suppressed-predictions")

      assert %{status: 200, resp_body: "[]"} = conn
    end

    @tag :api_authenticated
    test "responds with a list of suppressed predictions", %{conn: conn} do
      assert [] = conn |> get("/api/suppressed-predictions") |> json_response(200)

      insert(:suppressed_predictions, %{
        location_id: "pa-ess",
        route_id: "place-route",
        direction_id: 0,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:suppressed_predictions, %{
        location_id: "pa-ess",
        route_id: "place-route",
        direction_id: 1,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      assert 2 =
               conn |> get("/api/suppressed-predictions") |> json_response(200) |> length()
    end
  end

  describe "POST /api/suppressed-predictions with create/2" do
    setup do
      PlaceCacheHelpers.seed_place_cache()
      :ok
    end

    @valid_params %{
      location_id: "place-three",
      route_id: "place-three-route",
      direction_id: 1,
      clear_at_end_of_day: true
    }

    @tag :authenticated
    test "returns error when user is not a suppression admin admin", %{conn: conn} do
      conn = post(conn, "/api/suppressed-predictions", @valid_params)
      assert response(conn, 401)
    end

    @tag :authenticated_suppression_admin
    test "creates a new SuppressedPrediction", %{conn: conn} do
      assert %{
               "location_id" => "place-three",
               "route_id" => "place-three-route",
               "direction_id" => 1,
               "clear_at_end_of_day" => true
             } =
               conn
               |> post("/api/suppressed-predictions", @valid_params)
               |> json_response(200)
    end

    @tag :authenticated_suppression_admin
    test "returns an error when passed invalid location id", %{conn: conn} do
      assert %{"errors" => _} =
               conn
               |> post("/api/suppressed-predictions", %{
                 @valid_params
                 | location_id: "wrong_location"
               })
               |> json_response(422)
    end

    @tag :authenticated_suppression_admin
    test "returns an error when passed invalid route id", %{conn: conn} do
      assert %{"errors" => _} =
               conn
               |> post("/api/suppressed-predictions", %{
                 @valid_params
                 | route_id: "invalid_route_id"
               })
               |> json_response(422)
    end

    @tag :authenticated_suppression_admin
    test "returns an error when passed invalid direction id", %{conn: conn} do
      assert %{"errors" => _} =
               conn
               |> post("/api/suppressed-predictions", %{
                 @valid_params
                 | direction_id: 3
               })
               |> json_response(422)
    end
  end

  describe("PUT /api/suppressed-predictions with update/2") do
    setup do
      seed_place_cache()

      insert(:suppressed_predictions, %{
        location_id: "place-three",
        route_id: "place-three-route",
        direction_id: 1,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      :ok
    end

    @valid_params %{
      location_id: "place-three",
      route_id: "place-three-route",
      direction_id: 1,
      clear_at_end_of_day: false
    }

    @invalid_params %{
      location_id: "invalid_location_id",
      route_id: "place-three-route",
      direction_id: 1,
      clear_at_end_of_day: false
    }

    @tag :authenticated_suppression_admin
    test "updates an existing SuppressedPrediction", %{conn: conn} do
      assert %{"clear_at_end_of_day" => false} =
               conn
               |> put("/api/suppressed-predictions", @valid_params)
               |> json_response(200)
    end

    @tag :authenticated_suppression_admin
    test "returns 404 when SuppressedPrediction with id is not found", %{conn: conn} do
      assert %{"error" => "not_found"} =
               conn
               |> put("/api/suppressed-predictions", @invalid_params)
               |> json_response(404)
    end
  end

  describe("DELETE /api/suppressed-predictions with delete/2") do
    @valid_params %{
      location_id: "place-three",
      route_id: "place-three-route",
      direction_id: 1
    }

    @invalid_params %{
      location_id: "invalid_location_id",
      route_id: "place-three-route",
      direction_id: 1
    }

    setup do
      insert(:suppressed_predictions, %{
        location_id: "place-three",
        route_id: "place-three-route",
        direction_id: 1,
        clear_at_end_of_day: true,
        inserted_at: ~U[2024-05-01T01:00:00Z],
        updated_at: ~U[2024-05-01T01:00:00Z]
      })

      :ok
    end

    @tag :authenticated_suppression_admin
    test "deletes an existing SuppressedPrediction", %{conn: conn} do
      assert(
        %{
          "location_id" => "place-three",
          "direction_id" => 1,
          "clear_at_end_of_day" => true
        } =
          conn
          |> delete("/api/suppressed-predictions", @valid_params)
          |> json_response(200)
      )
    end

    @tag :authenticated_suppression_admin
    test "returns 404 when SuppressedPrediction with id is not found", %{conn: conn} do
      assert %{"error" => "not_found"} =
               conn
               |> delete("/api/suppressed-predictions", @invalid_params)
               |> json_response(404)
    end
  end
end
