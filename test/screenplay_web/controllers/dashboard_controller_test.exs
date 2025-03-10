defmodule ScreenplayWeb.Controllers.DashboardControllerTest do
  use ScreenplayWeb.ConnCase

  describe "index/2" do
    @tag :authenticated
    test "responds 200 to authenticated requests", %{conn: conn} do
      conn = get(conn, "/dashboard")
      assert %{status: 200} = conn
      assert %{assigns: %{username: "test_user"}}
    end

    test "responds 302 to unauthenticated requests", %{conn: conn} do
      conn = get(conn, "/dashboard")
      assert %{status: 302} = conn
      assert %{assigns: %{username: "test_user"}}
    end
  end

  describe "root_redirect/2" do
    @tag :authenticated
    test "redirects authenticated to /dashboard", %{conn: conn} do
      conn = get(conn, "/")
      assert redirected_to(conn) =~ "/dashboard"
    end
  end
end
