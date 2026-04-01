defmodule ScreenplayWeb.Controllers.AuthControllerTest do
  use ScreenplayWeb.ConnCase

  alias ScreenplayWeb.Router.Helpers

  describe "callback" do
    test "redirects on success and saves refresh token", %{conn: conn} do
      current_time = System.system_time(:second)

      conn =
        conn
        |> init_test_session(%{})
        |> Plug.Conn.put_session(:previous_path_from_auth, "/test")
        |> get(
          "/auth/keycloak/callback?email=user@test.com&roles[]=screens-admin&roles[]=screenplay-emergency-admin"
        )

      assert redirected_to(conn) == "/test"

      assert Guardian.Plug.current_claims(conn)["roles"] == [
               "screens-admin",
               "screenplay-emergency-admin"
             ]
    end

    test "handles generic failure", %{conn: conn} do
      conn =
        conn
        |> assign(:ueberauth_failure, %Ueberauth.Failure{})
        |> get(Helpers.auth_path(conn, :callback, "keycloak"))

      response = response(conn, 401)

      assert response =~ "unauthenticated"
    end
  end

  describe "request" do
    test "redirects to auth callback", %{conn: conn} do
      conn = get(conn, Helpers.auth_path(conn, :request, "keycloak"))

      response = response(conn, 302)

      assert response =~ Helpers.auth_path(conn, :callback, "keycloak")
    end
  end
end
