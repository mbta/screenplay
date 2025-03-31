defmodule Screenplay.Jobs.ClearSuppressedPredictions do
  @moduledoc """
  Runs at the end of every service day to remove suppressed predictions that have been flagged to clear
  """
  alias Screenplay.SuppressedPredictions
  use Oban.Worker, unique: true

  require Logger

  @impl Oban.Worker
  def perform(_) do
    SuppressedPredictions.clear_suppressed_predictions_for_end_of_day()
    :ok
  end
end
