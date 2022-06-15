defmodule ScreenplayWeb.Controllers.DashboardControllerTest do
  use ScreenplayWeb.ConnCase

  describe "index/2" do
    @tag :authenticated_admin
    test "responds 200 to authenticated admin requests", %{conn: conn} do
      conn = get(conn, "/dashboard")
      assert %{status: 200} = conn
      assert %{assigns: %{username: "test_user"}}
    end

    test "responds 302 to unauthenticated requests", %{conn: conn} do
      conn = get(conn, "/dashboard")
      assert %{status: 302} = conn
      assert %{assigns: %{username: "test_user"}}
    end

    @tag :authenticated
    test "responds 200 to authenticated requests not in admin group", %{conn: conn} do
      conn = get(conn, "/dashboard")
      assert %{status: 200} = conn
      assert %{assigns: %{username: "test_user"}}
    end
  end
end
