defmodule ScreenplayWeb.AuthManager.ErrorHandlerTest do
  use ScreenplayWeb.ConnCase

  alias ScreenplayWeb.AuthManager.ErrorHandler

  describe "auth_error/3" do
    test "returns 403 for API endpoints if there's no refresh key", %{conn: conn} do
      conn =
        conn
        |> init_test_session(%{previous_path: "api/test"})
        |> ErrorHandler.auth_error({:some_type, :reason}, [])

      assert %{status: 403} = conn
    end

    test "redirects to Keycloak login if there's no refresh key", %{conn: conn} do
      conn =
        conn
        |> init_test_session(%{previous_path: "test"})
        |> ErrorHandler.auth_error({:some_type, :reason}, [])

      assert html_response(conn, 302) =~ "\"/auth/keycloak\?prompt%3Dlogin"
    end
  end
end
