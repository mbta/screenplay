defmodule Screenplay.Alerts.Alert do
  @moduledoc """
  Represents a single Outfront Takeover Alert.
  """

  @enforce_keys [:message, :stations, :schedule]
  defstruct @enforce_keys

  @type canned_message :: %{
          type: :canned,
          id: String.t()
        }

  @type custom_message :: %{
          type: :custom,
          text: String.t()
        }

  @type station :: String.t()

  @type schedule :: %{
          start: DateTime.t() | nil,
          end: DateTime.t() | nil
        }

  @type t :: %__MODULE__{
          message: canned_message() | custom_message(),
          stations: list(station()),
          schedule: schedule()
        }
end
