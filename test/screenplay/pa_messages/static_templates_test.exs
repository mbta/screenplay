defmodule Screenplay.PaMessages.StaticTemplatesTest do
  use ScreenplayWeb.DataCase

  alias Screenplay.PaMessages.StaticTemplates

  describe "get_all/0" do
    test "returns all active templates" do
      assert {:ok, [%{"id" => 1}, %{"id" => 2}]} = StaticTemplates.get_all()
    end
  end

  describe "get_template/1" do
    test "returns active template" do
      assert {:ok, %{"id" => 1}} = StaticTemplates.get_template(1)
    end

    test "returns nil for inactive templates" do
      assert {:ok, nil} = StaticTemplates.get_template(3)
    end

    test "returns nil for templates that do not exist" do
      assert {:ok, nil} = StaticTemplates.get_template(9999)
    end
  end
end
