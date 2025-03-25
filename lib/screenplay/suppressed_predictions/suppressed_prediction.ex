defmodule Screenplay.SuppressedPredictions.SuppressedPrediction do
  @moduledoc """
  Represents a Suppressed Prediction for a given location
  """
  alias Screenplay.Places
  use Ecto.Schema
  import Ecto.Changeset

  @jfk_umass_ashmont_place "place-jfk-ashmont"
  @jfk_umass_braintree_place "place-jfk-braintree"

  @derive {Jason.Encoder, except: [:__meta__]}

  @type t() :: %__MODULE__{
          location_id: String.t(),
          direction_id: integer(),
          clear_at_end_of_day: boolean()
        }

  @primary_key false
  schema "suppressed_predictions" do
    field(:location_id, :string, primary_key: true)
    field(:direction_id, :integer, primary_key: true)
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
      less_than_or_equal_to: 1,
      greater_than_or_equal_to: 0,
      message: "Location Direction ID must be 0 or 1"
    )
    |> validate_location
  end

  defp validate_location(changeset) do
    location_id = get_field(changeset, :location_id)

    cond do
      location_id == "place-jfk" ->
        add_error(
          changeset,
          :location_id,
          "Please provide either the Ashmont or Braintree location_id (place-jfk-ashmont or place-jfk-braintree)"
        )

      Places.get()
      |> Enum.map(& &1.id)
      |> Enum.concat([@jfk_umass_ashmont_place, @jfk_umass_braintree_place])
      |> Enum.any?(&(&1 == location_id)) ->
        changeset

      true ->
        add_error(changeset, :location_id, "PA/ESS Location does not exist: #{location_id}")
    end
  end
end
