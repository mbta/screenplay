defmodule ScreenplayWeb.Controllers.PageControllerTest do
  use ScreenplayWeb.ConnCase

  describe "index/2" do
    @tag :authenticated_admin
    test "responds 200 to authenticated admin requests", %{conn: conn} do
      conn = get(conn, "/")
      assert %{status: 200} = conn
    end

    test "responds 302 to unauthenticated requests", %{conn: conn} do
      conn = get(conn, "/")
      assert %{status: 302} = conn
    end

    @tag :authenticated
    test "responds 302 to authenticated requests not in admin group", %{conn: conn} do
      conn = get(conn, "/")
      assert %{status: 302} = conn
    end
  end
end
