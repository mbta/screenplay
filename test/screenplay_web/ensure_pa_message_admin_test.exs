defmodule ScreenplayWeb.EnsurePaMessageAdminTest do
  use ScreenplayWeb.ConnCase

  describe "init/1" do
    test "passes options through unchanged" do
      assert ScreenplayWeb.EnsurePaMessageAdmin.init([]) == []
    end
  end

  describe "call/2" do
    @tag :authenticated_pa_message_admin
    test "does nothing when user is a PA message admin", %{conn: conn} do
      assert conn == ScreenplayWeb.EnsurePaMessageAdmin.call(conn, [])
    end

    @tag :authenticated
    test "redirects to Dashboard when user is not a PA message admin", %{conn: conn} do
      conn = ScreenplayWeb.EnsurePaMessageAdmin.call(conn, [])

      assert redirected_to(conn) =~ "/dashboard"
    end
  end
end
