defmodule ScreenplayWeb.PaMessagesApiControllerTest do
  use ScreenplayWeb.ConnCase

  alias Screenplay.AlertsCacheHelpers
  alias Screenplay.PlaceCacheHelpers

  import Screenplay.Factory

  setup_all do
    AlertsCacheHelpers.seed_alerts_cache(2, ~U[2024-05-01T04:00:00Z], ~U[2024-05-01T06:00:00Z])

    start_supervised!(Screenplay.Places.Cache)

    :ok
  end

  describe "active/2" do
    test "responds 403 if x-api-key is missing", %{conn: conn} do
      conn = get(conn, "/api/pa-messages/active")

      assert %{status: 403, halted: true, resp_body: "Invalid API key"} = conn
    end

    test "responds 403 if x-api-key does not match app API key", %{conn: conn} do
      conn =
        conn |> Plug.Conn.put_req_header("x-api-key", "1234") |> get("/api/pa-messages/active")

      assert %{status: 403, halted: true, resp_body: "Invalid API key"} = conn
    end

    @tag :api_authenticated
    test "responds list of active messages if x-api-key matches app API key", %{conn: conn} do
      conn = get(conn, "/api/pa-messages/active")

      assert %{status: 200, resp_body: "[]"} = conn
    end
  end

  describe "GET /api/pa-messages" do
    @tag :authenticated
    test "responds with a list of all messages", %{conn: conn} do
      assert [] =
               conn
               |> get("/api/pa-messages")
               |> json_response(200)

      insert(:pa_message, %{
        id: 1,
        start_datetime: ~U[2024-05-01T01:00:00Z],
        end_datetime: ~U[2024-05-01T13:00:00Z],
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
        inserted_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:pa_message, %{
        id: 2,
        start_datetime: ~U[2024-05-02T12:00:00Z],
        end_datetime: ~U[2024-05-02T12:00:00Z],
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
        inserted_at: ~U[2024-05-02T12:00:00Z]
      })

      assert [%{"id" => 2}, %{"id" => 1}] =
               conn
               |> get("/api/pa-messages")
               |> json_response(200)
    end

    @tag :authenticated
    test "responds with only the active messages when filtered by state=current", %{conn: conn} do
      now = "2024-08-06T15:10:00Z"

      insert(:pa_message, %{
        id: 1,
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
        start_datetime: ~U[2024-08-04 00:00:00Z],
        end_datetime: ~U[2024-08-05 23:59:59Z]
      })

      insert(:pa_message, %{
        id: 2,
        days_of_week: [1],
        start_datetime: ~U[2024-08-05 00:00:00Z],
        end_datetime: ~U[2024-08-06 23:59:59Z]
      })

      insert(:pa_message, %{
        id: 3,
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
        start_datetime: ~U[2024-08-07 00:00:00Z],
        end_datetime: ~U[2024-08-08 23:59:59Z]
      })

      assert [%{"id" => 2}] =
               conn
               |> get("/api/pa-messages?state=current&now=#{now}")
               |> json_response(200)
    end

    @tag :authenticated
    test "responds with only the past messages when filtered by state=past", %{conn: conn} do
      now = "2024-08-06T15:10:00Z"

      insert(:pa_message, %{
        id: 1,
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
        start_datetime: ~U[2024-08-04 00:00:00Z],
        end_datetime: ~U[2024-08-05 23:59:59Z]
      })

      insert(:pa_message, %{
        id: 2,
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
        start_datetime: ~U[2024-08-05 00:00:00Z],
        end_datetime: ~U[2024-08-06 23:59:59Z]
      })

      insert(:pa_message, %{
        id: 3,
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
        start_datetime: ~U[2024-08-07 00:00:00Z],
        end_datetime: ~U[2024-08-08 23:59:59Z]
      })

      assert [%{"id" => 1}] =
               conn
               |> get("/api/pa-messages?state=past&now=#{now}")
               |> json_response(200)
    end

    @tag :authenticated
    test "responds with only the future messages when filtered by state=future", %{conn: conn} do
      now = "2024-08-06T15:10:00Z"

      insert(:pa_message, %{
        id: 1,
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
        start_datetime: ~U[2024-08-04 00:00:00Z],
        end_datetime: ~U[2024-08-05 23:59:59Z]
      })

      insert(:pa_message, %{
        id: 2,
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
        start_datetime: ~U[2024-08-05 00:00:00Z],
        end_datetime: ~U[2024-08-06 23:59:59Z]
      })

      insert(:pa_message, %{
        id: 3,
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
        start_datetime: ~U[2024-08-07 00:00:00Z],
        end_datetime: ~U[2024-08-08 23:59:59Z]
      })

      assert [%{"id" => 3}] =
               conn
               |> get("/api/pa-messages?state=future&now=#{now}")
               |> json_response(200)
    end

    @tag :authenticated
    test "supports filtering by included sign ids", %{conn: conn} do
      insert(:pa_message, %{
        id: 1,
        sign_ids: ~w[a b],
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
        start_datetime: ~U[2024-08-04 00:00:00Z],
        end_datetime: ~U[2024-08-05 23:59:59Z]
      })

      insert(:pa_message, %{
        id: 2,
        sign_ids: ~w[b],
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
        start_datetime: ~U[2024-08-05 00:00:00Z],
        end_datetime: ~U[2024-08-06 23:59:59Z]
      })

      insert(:pa_message, %{
        id: 3,
        sign_ids: ~w[b c],
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
        start_datetime: ~U[2024-08-07 00:00:00Z],
        end_datetime: ~U[2024-08-08 23:59:59Z]
      })

      assert [%{"id" => 1}, %{"id" => 2}, %{"id" => 3}] =
               conn
               |> get("/api/pa-messages?signs[]=a&signs[]=b&signs[]=c")
               |> json_response(200)

      assert [%{"id" => 1}, %{"id" => 2}, %{"id" => 3}] =
               conn
               |> get("/api/pa-messages?signs[]=a&signs[]=b")
               |> json_response(200)

      assert [%{"id" => 1}] =
               conn
               |> get("/api/pa-messages?signs[]=a")
               |> json_response(200)

      assert [%{"id" => 3}] =
               conn
               |> get("/api/pa-messages?signs[]=c")
               |> json_response(200)
    end
  end

  describe "GET /api/pa-messages with route filters" do
    setup do
      PlaceCacheHelpers.seed_place_cache()
    end

    @tag :authenticated
    test "supports filtering by included route ids", %{conn: conn} do
      insert(:pa_message, %{
        id: 1,
        sign_ids: ~w[place-one-sign place-two-sign],
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
        start_datetime: ~U[2024-08-04 00:00:00Z],
        end_datetime: ~U[2024-08-05 23:59:59Z]
      })

      # Red and Blue
      insert(:pa_message, %{
        id: 2,
        sign_ids: ~w[place-two-sign],
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
        start_datetime: ~U[2024-08-05 00:00:00Z],
        end_datetime: ~U[2024-08-06 23:59:59Z]
      })

      # Orange
      insert(:pa_message, %{
        id: 3,
        sign_ids: ~w[place-three-sign],
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
        start_datetime: ~U[2024-08-07 00:00:00Z],
        end_datetime: ~U[2024-08-08 23:59:59Z]
      })

      assert [%{"id" => 1}] =
               conn
               |> get("/api/pa-messages?routes[]=place-one-route")
               |> json_response(200)

      assert [%{"id" => 1}, %{"id" => 2}] =
               conn
               |> get("/api/pa-messages?routes[]=place-two-route")
               |> json_response(200)

      assert [%{"id" => 3}] =
               conn
               |> get("/api/pa-messages?routes[]=place-three-route")
               |> json_response(200)

      assert [%{"id" => 1}, %{"id" => 2}, %{"id" => 3}] =
               conn
               |> get("/api/pa-messages?routes[]=place-two-route&routes[]=place-three-route")
               |> json_response(200)
    end
  end

  describe "POST /api/pa-messages" do
    @now ~U[2024-08-07T12:12:12Z]

    @valid_params %{
      start_datetime: @now,
      end_datetime: DateTime.add(@now, 60),
      days_of_week: [1, 2, 3],
      sign_ids: ["test_sign"],
      priority: 1,
      interval_in_minutes: 4,
      visual_text: "Visual Text",
      audio_text: "Audio Text"
    }

    @tag :authenticated_pa_message_admin
    test "creates a new PaMessage", %{conn: conn} do
      assert %{"success" => true} =
               conn
               |> post("/api/pa-messages", @valid_params)
               |> json_response(200)
    end

    @tag :authenticated_pa_message_admin
    test "returns an error object when passed invalid params", %{conn: conn} do
      assert %{"errors" => _} =
               conn
               |> post("/api/pa-messages", %{@valid_params | days_of_week: [1, 2, 3, 90]})
               |> json_response(422)
    end

    @tag :authenticated
    test "requires the PA message admin role", %{conn: conn} do
      conn = post(conn, "/api/pa-messages", @valid_params)
      assert response(conn, :unauthorized)
    end
  end

  describe "PUT /api/pa-messages/:id" do
    setup do
      insert(:pa_message, %{
        id: 1,
        start_datetime: ~U[2024-05-01T01:00:00Z],
        end_datetime: ~U[2024-05-01T13:00:00Z],
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
        inserted_at: ~U[2024-05-01T01:00:00Z],
        visual_text: "Visual Text",
        audio_text: "Audio Text"
      })

      :ok
    end

    @tag :authenticated_pa_message_admin
    test "updates a pa message and returns the updated pa message", %{conn: conn} do
      assert %{"id" => 1, "visual_text" => "Updated Visual Text"} =
               conn
               |> put("/api/pa-messages/1", %{visual_text: "Updated Visual Text"})
               |> json_response(200)
    end

    @tag :authenticated_pa_message_admin
    test "returns a 404 when the pa message does not exist", %{conn: conn} do
      assert %{"error" => "not_found"} ==
               conn
               |> put("/api/pa-messages/1337", %{visual_text: "Updated Visual Text"})
               |> json_response(404)
    end

    @tag :authenticated
    test "requires the PA message admin role", %{conn: conn} do
      conn = put(conn, "/api/pa-messages/1", %{visual_text: "Updated Visual Text"})
      assert response(conn, :unauthorized)
    end
  end

  describe "GET /api/pa-messages/:id" do
    @tag :authenticated
    test "returns the PA message with the given ID", %{conn: conn} do
      insert(:pa_message, %{
        id: 1,
        start_datetime: ~U[2024-05-01T01:00:00Z],
        end_datetime: ~U[2024-05-01T13:00:00Z],
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
        inserted_at: ~U[2024-05-01T01:00:00Z],
        visual_text: "Visual Text",
        audio_text: "Audio Text"
      })

      assert %{"id" => 1} = conn |> get("/api/pa-messages/1") |> json_response(200)
    end

    @tag :authenticated
    test "returns the PA message with the given ID and its associated alert", %{conn: conn} do
      insert(:pa_message, %{
        id: 1,
        start_datetime: ~U[2024-05-01T01:00:00Z],
        end_datetime: ~U[2024-05-01T13:00:00Z],
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
        inserted_at: ~U[2024-05-01T01:00:00Z],
        visual_text: "Visual Text",
        audio_text: "Audio Text",
        alert_id: "1"
      })

      assert %{"id" => 1} = conn |> get("/api/pa-messages/1") |> json_response(200)
    end

    @tag :authenticated
    test "returns a 404 if the PA message doesn't exist", %{conn: conn} do
      assert %{"error" => "not_found"} =
               conn
               |> get("/api/pa-messages/1234")
               |> json_response(404)
    end
  end
end
