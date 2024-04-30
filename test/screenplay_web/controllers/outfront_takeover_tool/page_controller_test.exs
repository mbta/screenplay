defmodule ScreenplayWeb.OutfrontTakeoverTool.PageControllerTest do
  use ScreenplayWeb.ConnCase

  describe "index/2" do
    @tag :authenticated_admin
    test "responds 200 to authenticated admin requests", %{conn: conn} do
      conn = get(conn, "/emergency-takeover")
      assert %{status: 200} = conn
    end

    test "responds 302 to unauthenticated requests", %{conn: conn} do
      conn = get(conn, "/emergency-takeover")
      assert %{status: 302} = conn
    end

    @tag :authenticated
    test "responds 302 to authenticated requests not in admin group", %{conn: conn} do
      conn = get(conn, "/emergency-takeover")
      assert %{status: 302} = conn
    end
  end

  describe "root_redirect/2" do
    @tag :authenticated_admin
    test "redirects admin to /dashboard", %{conn: conn} do
      conn = get(conn, "/")
      assert redirected_to(conn) =~ "/dashboard"
    end

    @tag :authenticated
    test "does not redirect non-admin to /dashboard", %{conn: conn} do
      conn = get(conn, "/")
      assert redirected_to(conn) =~ "/unauthorized"
    end
  end
end
