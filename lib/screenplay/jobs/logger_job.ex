defmodule Screenplay.Jobs.LoggerJob do
  use Oban.Worker, unique: true

  require Logger

  @impl Oban.Worker
  def perform(_) do
    Logger.info("[oban test] everything works")
  end
end
