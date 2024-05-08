defmodule ScreenplayWeb.EnsureScreenplayEmergencyAdminGroupTest do
  use ScreenplayWeb.ConnCase

  describe "init/1" do
    test "passes options through unchanged" do
      assert ScreenplayWeb.EnsureScreenplayEmergencyAdminGroup.init([]) == []
    end
  end

  describe "call/2" do
    @tag :authenticated_emergency_admin
    test "does nothing when user is in the outfront admin group", %{conn: conn} do
      assert conn == ScreenplayWeb.EnsureScreenplayEmergencyAdminGroup.call(conn, [])
    end

    @tag :authenticated
    test "redirects when user is not in the outfront admin group", %{conn: conn} do
      conn = ScreenplayWeb.EnsureScreenplayEmergencyAdminGroup.call(conn, [])

      response = html_response(conn, 302)
      assert response =~ "/unauthorized"
    end
  end
end
