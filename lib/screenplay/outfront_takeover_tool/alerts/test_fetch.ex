defmodule Screenplay.OutfrontTakeoverTool.Alerts.TestFetch do
  @moduledoc false

  @spec get_state() :: binary()
  def get_state do
    File.read!("test/fixtures/alerts.json")
  end

  @spec put_state(binary()) :: :ok
  def put_state(_state) do
    :ok
  end
end
