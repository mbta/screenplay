defmodule ScreenplayWeb.Controllers.DashboardControllerTest do
  use ScreenplayWeb.ConnCase

  describe "index/2" do
    @tag :authenticated
    test "responds 200 to authenticated requests", %{conn: conn} do
      conn = get(conn, "/dashboard")
      assert %{status: 200} = conn
    end

    test "responds 302 to unauthenticated requests", %{conn: conn} do
      conn = get(conn, "/dashboard")
      assert %{status: 302} = conn
    end

    @tag :authenticated_not_in_group
    test "responds 302 to authenticated requests not in screenplay group", %{conn: conn} do
      conn = get(conn, "/dashboard")
      assert %{status: 302} = conn
    end
  end
end
