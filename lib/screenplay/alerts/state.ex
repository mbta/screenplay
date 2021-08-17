defmodule Screenplay.Alerts.State do
  @moduledoc """
  Keeps an internal state of all the Outfront Takeover Alerts which currently exist.
  """

  alias Screenplay.Alerts.Alert

  @enforce_keys [:alerts]
  defstruct @enforce_keys

  @type t :: %__MODULE__{
          alerts: list(Alert.t())
        }
end
