defmodule Screenplay.UtilTest do
  use ExUnit.Case, async: true

  alias Screenplay.Util

  describe "service_date/1" do
    test "returns the correct service date for a given datetime" do
      # UTC is 4 hours ahead of Eastern Time in the summer
      assert Util.service_date(~U[2025-08-08 04:00:00Z]) == ~D[2025-08-07]
      assert Util.service_date(~U[2025-08-08 07:59:00Z]) == ~D[2025-08-07]
      assert Util.service_date(~U[2025-08-08 08:00:00Z]) == ~D[2025-08-08]
      assert Util.service_date(~U[2025-08-08 23:00:00Z]) == ~D[2025-08-08]
    end
  end
end
