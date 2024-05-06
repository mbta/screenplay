defmodule ScreenplayWeb.EnsureApiAuthTest do
  use ScreenplayWeb.ConnCase

  describe "init/1" do
    test "passes options through unchanged" do
      assert ScreenplayWeb.EnsureScreenplayEmergencyAdminGroup.init([]) == []
    end
  end

  describe "call/2" do
    setup do
      Application.put_env(:screenplay, :api_key, "test_api_key")
    end

    test "returns 403 when x-api-key header is missing", %{conn: conn} do
      conn = ScreenplayWeb.Plugs.EnsureApiAuth.call(conn, [])

      assert %{status: 403, halted: true, resp_body: "Invalid API key"} = conn
    end

    @tag :api_unauthenticated
    test "returns 403 when x-api-key does not match app API key", %{conn: conn} do
      conn = ScreenplayWeb.Plugs.EnsureApiAuth.call(conn, [])

      assert %{status: 403, halted: true, resp_body: "Invalid API key"} = conn
    end

    @tag :api_authenticated
    test "returns conn unchange if x-api-key header matches app API key", %{conn: conn} do
      assert ScreenplayWeb.Plugs.EnsureApiAuth.call(conn, []) == conn
    end
  end
end
