defmodule ScreenplayWeb.EnsureScreensAdminGroupTest do
  use ScreenplayWeb.ConnCase

  describe "init/1" do
    test "passes options through unchanged" do
      assert ScreenplayWeb.EnsureScreenplayAdminGroup.init([]) == []
    end
  end

  describe "call/2" do
    @tag :authenticated_screens_admin
    test "does nothing when user is in the screens admin group", %{conn: conn} do
      assert conn == ScreenplayWeb.EnsureScreensAdminGroup.call(conn, [])
    end

    @tag :authenticated
    test "redirects to Dashboard when user is not in the screens admin group", %{conn: conn} do
      conn = ScreenplayWeb.EnsureScreensAdminGroup.call(conn, [])

      assert redirected_to(conn) =~ "/dashboard"
    end
  end
end
