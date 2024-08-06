defmodule ScreenplayWeb.PaMessagesApiControllerTest do
  use ScreenplayWeb.ConnCase

  import Screenplay.Factory

  setup_all do
    get_json_fn = fn "alerts", %{"include" => "routes"} ->
      {:ok, %{"data" => [], "included" => []}}
    end

    _ = start_supervised({Screenplay.Alerts.Cache, get_json_fn: get_json_fn})

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
    @tag :authenticated_pa_message_admin
    test "responds with a list of all messages", %{conn: conn} do
      assert [] =
               conn
               |> get("/api/pa-messages")
               |> json_response(200)

      insert(:pa_message, %{
        id: 1,
        start_time: ~U[2024-05-01T01:00:00Z],
        end_time: ~U[2024-05-01T13:00:00Z],
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
        inserted_at: ~U[2024-05-01T01:00:00Z]
      })

      insert(:pa_message, %{
        id: 2,
        start_time: ~U[2024-05-02T12:00:00Z],
        end_time: ~U[2024-05-02T12:00:00Z],
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
        inserted_at: ~U[2024-05-02T12:00:00Z]
      })

      assert [%{"id" => 2}, %{"id" => 1}] =
               conn
               |> get("/api/pa-messages")
               |> json_response(200)
    end

    @tag :authenticated_pa_message_admin
    test "responds with only the active messages when filtered by state=active", %{conn: conn} do
      now = "2024-08-06T15:10:00Z"

      insert(:pa_message, %{
        id: 1,
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
        start_time: ~U[2024-08-04 00:00:00Z],
        end_time: ~U[2024-08-05 23:59:59Z]
      })

      insert(:pa_message, %{
        id: 2,
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
        start_time: ~U[2024-08-05 00:00:00Z],
        end_time: ~U[2024-08-06 23:59:59Z]
      })

      insert(:pa_message, %{
        id: 3,
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
        start_time: ~U[2024-08-07 00:00:00Z],
        end_time: ~U[2024-08-08 23:59:59Z]
      })

      assert [%{"id" => 2}] =
               conn
               |> get("/api/pa-messages?state=active&now=#{now}")
               |> json_response(200)
    end

    @tag :authenticated_pa_message_admin
    test "responds with only the past messages when filtered by state=past", %{conn: conn} do
      now = "2024-08-06T15:10:00Z"

      insert(:pa_message, %{
        id: 1,
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
        start_time: ~U[2024-08-04 00:00:00Z],
        end_time: ~U[2024-08-05 23:59:59Z]
      })

      insert(:pa_message, %{
        id: 2,
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
        start_time: ~U[2024-08-05 00:00:00Z],
        end_time: ~U[2024-08-06 23:59:59Z]
      })

      insert(:pa_message, %{
        id: 3,
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
        start_time: ~U[2024-08-07 00:00:00Z],
        end_time: ~U[2024-08-08 23:59:59Z]
      })

      assert [%{"id" => 1}] =
               conn
               |> get("/api/pa-messages?state=past&now=#{now}")
               |> json_response(200)
    end

    @tag :authenticated_pa_message_admin
    test "responds with only the future messages when filtered by state=future", %{conn: conn} do
      now = "2024-08-06T15:10:00Z"

      insert(:pa_message, %{
        id: 1,
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
        start_time: ~U[2024-08-04 00:00:00Z],
        end_time: ~U[2024-08-05 23:59:59Z]
      })

      insert(:pa_message, %{
        id: 2,
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
        start_time: ~U[2024-08-05 00:00:00Z],
        end_time: ~U[2024-08-06 23:59:59Z]
      })

      insert(:pa_message, %{
        id: 3,
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
        start_time: ~U[2024-08-07 00:00:00Z],
        end_time: ~U[2024-08-08 23:59:59Z]
      })

      assert [%{"id" => 3}] =
               conn
               |> get("/api/pa-messages?state=future&now=#{now}")
               |> json_response(200)
    end
  end

  describe "POST /api/pa-messages" do
    @tag :authenticated_pa_message_admin
    test "creates a new PaMessage", %{conn: conn} do
      now = ~U[2024-08-07T12:12:12Z]

      assert %{"success" => true} =
               conn
               |> post("/api/pa-messages", %{
                 start_time: now,
                 end_time: DateTime.add(now, 60),
                 days_of_week: [1, 2, 3],
                 sign_ids: ["test_sign"],
                 priority: 1,
                 interval_in_minutes: 4,
                 visual_text: "Visual Text",
                 audio_text: "Audio Text"
               })
               |> json_response(200)
    end

    @tag :authenticated_pa_message_admin
    test "returns an error object when passed invalid params", %{conn: conn} do
      now = ~U[2024-08-07T12:12:12Z]

      assert %{"errors" => _} =
               conn
               |> post("/api/pa-messages", %{
                 start_time: now,
                 end_time: DateTime.add(now, 60),
                 days_of_week: [1, 2, 3, 90],
                 sign_ids: ["test_sign"],
                 priority: 1,
                 interval_in_minutes: 4,
                 visual_text: "Visual Text",
                 audio_text: "Audio Text"
               })
               |> json_response(422)
    end
  end
end
