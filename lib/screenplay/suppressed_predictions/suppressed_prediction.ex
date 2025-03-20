defmodule Screenplay.SuppressedPredictions.SuppressedPrediction do
  @moduledoc """
  Represents a Suppressed Prediction for a given location
  """
  alias Screenplay.Places
  use Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder, except: [:__meta__]}

  @type t() :: %__MODULE__{
          location_id: String.t(),
          direction_id: integer(),
          clear_at_end_of_day: boolean()
        }

  schema "suppressed_predictions" do
    field(:location_id, :string)
    field(:direction_id, :integer)
    field(:clear_at_end_of_day, :boolean)

    timestamps(type: :utc_datetime)
  end

  def changeset(suppressed_prediction, attrs \\ %{}) do
    suppressed_prediction
    |> cast(attrs, [
      :location_id,
      :direction_id,
      :clear_at_end_of_day
    ])
    |> validate_required([
      :location_id,
      :direction_id,
      :clear_at_end_of_day
    ])
    |> validate_number(:direction_id,
      less_than_or_equal_to: 2,
      greater_than_or_equal_to: 0,
      message: "Location Direction ID must be 0, 1 or 2 for both directions"
    )
    |> validate_location()
  end

  defp validate_location(changeset) do
    location_id = get_field(changeset, :location_id)

    place_ids =
      Enum.map(Places.get(), fn place ->
        place.id
      end)

    if Enum.member?(place_ids, location_id) do
      changeset
    else
      add_error(changeset, :location_id, "PA/ESS Location does not exist: #{location_id}")
    end
  end
end
