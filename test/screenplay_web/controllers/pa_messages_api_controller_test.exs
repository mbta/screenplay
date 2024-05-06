defmodule ScreenplayWeb.PaMessagesApiControllerTest do
  use ScreenplayWeb.ConnCase

  describe "active/2" do
    test "responds 403 if x-api-key is missing", %{conn: conn} do
      conn = get(conn, "/api/pa_messages")

      assert %{status: 403, halted: true, resp_body: "Invalid API key"} = conn
    end

    @tag :api_unauthenticated
    test "responds 403 if x-api-key does not match app API key", %{conn: conn} do
      conn = get(conn, "/api/pa_messages")

      assert %{status: 403, halted: true, resp_body: "Invalid API key"} = conn
    end

    @tag :api_authenticated
    test "responds list of active messages if x-api-key matches app API key", %{conn: conn} do
      conn = get(conn, "/api/pa_messages")

      assert %{status: 200, resp_body: "[]"} = conn
    end
  end
end
