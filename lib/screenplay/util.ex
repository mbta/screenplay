defmodule Screenplay.Util do
  @moduledoc "Utilities module"

  use Timex

  @local_tz "America/New_York"

  @doc "The current datetime in the America/New_York timezone."
  @spec now() :: DateTime.t()
  def now do
    @local_tz
    |> Timex.now()
  end
end
