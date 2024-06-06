defmodule Screenplay.V3ApiTest do
  use ExUnit.Case, async: true
  alias Screenplay.V3Api

  describe "build_url/2" do
    setup do
      original_api_v3_url = Application.get_env(:screenplay, :api_v3_url)
      Application.put_env(:screenplay, :api_v3_url, "https://v3-api.test-v3-api.com/")

      on_exit(fn ->
        Application.put_env(:screenplay, :api_v3_url, original_api_v3_url)
      end)
    end

    test "returns the base URL and the route when an empty map is passed" do
      assert "https://v3-api.test-v3-api.com/alerts" == V3Api.build_url("/alerts", %{})
    end

    test "adds params to query string" do
      assert "https://v3-api.test-v3-api.com/alerts?filter%5Broute%5D=Green-B&filter%5Bstop%5D=123" ==
               V3Api.build_url("/alerts", %{"filter[route]" => "Green-B", "filter[stop]" => "123"})
    end
  end
end
