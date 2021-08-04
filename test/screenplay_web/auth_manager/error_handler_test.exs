defmodule ScreenplayWeb.AuthManager.ErrorHandlerTest do
  use ScreenplayWeb.ConnCase

  describe "auth_error/3" do
    test "redirects to Cognito login if there's no refresh key", %{conn: conn} do
      conn =
        conn
        |> init_test_session(%{})
        |> ScreenplayWeb.AuthManager.ErrorHandler.auth_error({:some_type, :reason}, [])

      assert html_response(conn, 302) =~ "\"/auth/cognito\""
    end
  end
end
