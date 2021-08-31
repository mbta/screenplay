defmodule ScreenplayWeb.UserActionLoggerTest do
  use ExUnit.Case, async: true
  import ExUnit.CaptureLog
  import Test.Support.Helpers

  alias ScreenplayWeb.UserActionLogger

  describe "log" do
    setup do
      reassign_log_level(:info)
    end

    test "logs an action with no params" do
      log =
        capture_log(fn ->
          UserActionLogger.log("user@mbta.com", :login)
        end)

      assert log =~ "User action:"
      assert log =~ "username=\"user@mbta.com\""
      assert log =~ "action=:login"
    end

    test "logs an action with params" do
      log =
        capture_log(fn ->
          UserActionLogger.log("user@mbta.com", :login, %{a: 1, b: 2})
        end)

      assert log =~ "User action:"
      assert log =~ "username=\"user@mbta.com\""
      assert log =~ "action=:login"
      assert log =~ "a=1"
      assert log =~ "b=2"
    end
  end
end
