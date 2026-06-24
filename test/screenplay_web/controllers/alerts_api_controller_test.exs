defmodule ScreenplayWeb.AlertsApiControllerTest do
  use ScreenplayWeb.ConnCase

  alias Screenplay.AlertsCacheHelpers

  setup do
    AlertsCacheHelpers.seed_alerts_cache(
      2,
      ~U[2024-05-01T04:00:00Z],
      ~U[2024-05-01T06:00:00Z]
    )

    :ok
  end

  describe "GET /api/alerts/non_access_alerts" do
    @tag :authenticated
    test "filters out alerts that ended", %{conn: conn} do
      assert %{"alerts" => []} =
               conn
               |> get("/api/alerts/non_access_alerts")
               |> json_response(200)
    end
  end
end
