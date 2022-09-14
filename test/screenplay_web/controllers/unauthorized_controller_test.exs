defmodule ScreenplayWeb.Controllers.UnauthorizedControllerTest do
  use ScreenplayWeb.ConnCase

  import ScreenplayWeb.Router.Helpers

  describe "index/2" do
    @tag :authenticated
    test "renders response", %{conn: conn} do
      conn = get(conn, unauthorized_path(conn, :index))

      assert html_response(conn, 403) =~ "not authorized"
    end
  end
end
