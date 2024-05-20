defmodule ScreenplayWeb.AuthManager.ErrorHandlerTest do
  use ScreenplayWeb.ConnCase

  alias ScreenplayWeb.AuthManager.ErrorHandler

  describe "auth_error/3" do
    test "redirects to Keycloak login if there's no refresh key", %{conn: conn} do
      conn =
        conn
        |> init_test_session(%{})
        |> ErrorHandler.auth_error({:some_type, :reason}, [])

      assert html_response(conn, 302) =~ "\"/auth/keycloak?prompt=login\""
    end
  end
end
