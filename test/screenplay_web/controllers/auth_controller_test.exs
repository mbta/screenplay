defmodule ScreenplayWeb.Controllers.AuthControllerTest do
  use ScreenplayWeb.ConnCase
  import Test.Support.Helpers

  alias ScreenplayWeb.Router.Helpers

  describe "callback" do
    test "redirects on success and saves refresh token", %{conn: conn} do
      current_time = System.system_time(:second)

      auth = %Ueberauth.Auth{
        uid: "foo@mbta.com",
        credentials: %Ueberauth.Auth.Credentials{
          expires_at: current_time + 1_000,
          other: %{groups: ["test1"]}
        }
      }

      conn =
        conn
        |> init_test_session(foo: "bar")
        |> assign(:ueberauth_auth, auth)
        |> Plug.Conn.put_session(:previous_path, "/test")
        |> get(Helpers.auth_path(conn, :callback, "cognito"))

      response = html_response(conn, 302)

      assert response =~ "/test"
      assert Guardian.Plug.current_claims(conn)["groups"] == ["test1"]
    end

    test "handles generic failure", %{conn: conn} do
      conn =
        conn
        |> assign(:ueberauth_failure, %Ueberauth.Failure{})
        |> get(Helpers.auth_path(conn, :callback, "cognito"))

      response = response(conn, 401)

      assert response =~ "unauthenticated"
    end
  end

  describe "request" do
    test "redirects to auth callback", %{conn: conn} do
      conn = get(conn, Helpers.auth_path(conn, :request, "cognito"))

      response = response(conn, 302)

      assert response =~ Helpers.auth_path(conn, :callback, "cognito")
    end
  end

  describe "logout" do
    @tag :authenticated_admin
    test "logs user out & redirects to dashboard requiring login", %{conn: conn} do
      domain = "test_auth_domain"
      client_id = "test_client_id"

      reassign_env(:ueberauth, Ueberauth.Strategy.Cognito,
        auth_domain: domain,
        client_id: client_id
      )

      conn =
        conn
        |> put_session(:user_id, "00001")
        |> get(Helpers.auth_path(conn, :logout, "cognito"))

      response = response(conn, 302)
      assert response =~ "/dashboard"

      assert is_nil(Guardian.Plug.current_claims(conn))

      assert is_nil(get_session(conn, :user_id))
    end
  end
end
