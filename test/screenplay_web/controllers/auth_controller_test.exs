defmodule ScreenplayWeb.Controllers.AuthControllerTest do
  use ScreenplayWeb.ConnCase

  alias ScreenplayWeb.Router.Helpers

  describe "callback" do
    test "redirects on success and saves refresh token", %{conn: conn} do
      current_time = System.system_time(:second)

      auth = %Ueberauth.Auth{
        uid: "foo@mbta.com",
        credentials: %Ueberauth.Auth.Credentials{
          expires_at: current_time + 1_000
        },
        extra: %{
          raw_info: %{
            userinfo: %{
              "resource_access" => %{
                "test-client" => %{"roles" => ["test1"]}
              }
            }
          }
        }
      }

      conn =
        conn
        |> init_test_session(foo: "bar")
        |> assign(:ueberauth_auth, auth)
        |> Plug.Conn.put_session(:previous_path, "/test")
        |> get(Helpers.auth_path(conn, :callback, "keycloak"))

      response = html_response(conn, 302)

      assert response =~ "/test"
      assert Guardian.Plug.current_claims(conn)["roles"] == ["test1"]
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
