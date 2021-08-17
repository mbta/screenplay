defmodule Screenplay.Alerts.Alert do
  @moduledoc """
  Represents a single Outfront Takeover Alert.
  """

  @enforce_keys [:message, :stations, :schedule]
  defstruct [:id] ++ @enforce_keys

  @type id :: non_neg_integer() | nil

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
          id: id(),
          message: canned_message() | custom_message(),
          stations: list(station()),
          schedule: schedule()
        }
end
