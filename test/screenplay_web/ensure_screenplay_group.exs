defmodule ScreenplayWeb.EnsureScreenplayGroupTest do
  use ScreenplayWeb.ConnCase

  describe "init/1" do
    test "passes options through unchanged" do
      assert ScreenplayWeb.EnsureScreenplayGroup.init([]) == []
    end
  end

  describe "call/2" do
    @tag :authenticated
    test "does nothing when user is in the screenplay group", %{conn: conn} do
      assert conn == ScreenplayWeb.EnsureScreenplayGroup.call(conn, [])
    end

    @tag :authenticated_not_in_group
    test "redirects when user is not in the screenplay group", %{conn: conn} do
      conn = ScreenplayWeb.EnsureScreenplayGroup.call(conn, [])

      response = html_response(conn, 302)
      assert response =~ "/unauthorized"
    end
  end
end