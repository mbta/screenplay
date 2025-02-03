defmodule ScreenplayWeb.AuthManager.EnsureRoleTest do
  use ScreenplayWeb.ConnCase

  alias Phoenix.Controller
  alias ScreenplayWeb.AuthManager.EnsureRole

  describe "init/1" do
    test "passes option through" do
      assert EnsureRole.init(:foo) == :foo
    end
  end

  describe "call/2" do
    @describetag :authenticated

    test "does nothing when user has the required role", %{conn: conn} do
      conn = conn |> Controller.put_format("html") |> assign(:roles, [:bar])
      assert conn == EnsureRole.call(conn, :bar)
    end

    test "redirects HTML requests to the unauthorized page", %{conn: conn} do
      conn = conn |> Controller.put_format("html") |> EnsureRole.call(:bar)
      assert redirected_to(conn) == "/unauthorized"
    end

    test "returns an unauthorized status for JSON requests", %{conn: conn} do
      conn = conn |> Controller.put_format("json") |> EnsureRole.call(:bar)
      assert response(conn, :unauthorized) =~ "Unauthorized"
    end
  end
end
