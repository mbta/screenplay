defmodule Screenplay.SuppressedPredictions.SuppressedPrediction do
  @moduledoc """
  Represents a Suppressed Prediction for a given location
  """
  alias Screenplay.Places
  alias Screenplay.PredictionSuppressionUtils
  use Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder, except: [:__meta__]}

  @type t() :: %__MODULE__{
          location_id: String.t(),
          route_id: String.t(),
          direction_id: integer(),
          clear_at_end_of_day: boolean()
        }

  @primary_key false
  schema "suppressed_predictions" do
    field(:location_id, :string, primary_key: true)
    field(:route_id, :string, primary_key: true)
    field(:direction_id, :integer, primary_key: true)
    field(:clear_at_end_of_day, :boolean)

    timestamps(type: :utc_datetime)
  end

  def changeset(suppressed_prediction, attrs \\ %{}) do
    places = Places.get()

    suppressed_prediction
    |> cast(attrs, [
      :location_id,
      :route_id,
      :direction_id,
      :clear_at_end_of_day
    ])
    |> validate_required([
      :location_id,
      :route_id,
      :direction_id,
      :clear_at_end_of_day
    ])
    |> validate_number(:direction_id,
      less_than_or_equal_to: 1,
      greater_than_or_equal_to: 0,
      message: "Location Direction ID must be 0 or 1"
    )
    |> validate_edge_cases()
    |> validate_location(places)
    |> validate_routes(places)
  end

  defp validate_edge_cases(changeset) do
    location_id = get_field(changeset, :location_id)
    route_id = get_field(changeset, :route_id)

    cond do
      # JFK/UMass has the Ashmont/Braintree split, we ask for those stop ids rather than the parent id
      location_id == "place-jfk" ->
        add_error(
          changeset,
          :location_id,
          "Please provide either the Ashmont or Braintree platform location_id"
        )

      # We don't handle separate Green Line and Silver Line branching route_ids
      # That is populated when we pass data to Transit Data
      # For internal use we just use "Green" or "Silver" to show all green/silver line routes
      route_id in PredictionSuppressionUtils.green_line_routes() ->
        add_error(
          changeset,
          :route_id,
          "Please provide just `Green` as the route_id for handling all Green Line routes"
        )

      true ->
        changeset
    end
  end

  defp validate_location(changeset, places) do
    location_id = get_field(changeset, :location_id)

    if places |> Enum.any?(&(&1.id == location_id)) ||
         location_id in PredictionSuppressionUtils.jfk_umass_child_location_ids() do
      changeset
    else
      add_error(changeset, :location_id, "Location `#{location_id}` does not exist")
    end
  end

  defp validate_routes(changeset, places) do
    unchecked_location_id = get_field(changeset, :location_id)
    route_id = get_field(changeset, :route_id)

    location_id =
      if unchecked_location_id in PredictionSuppressionUtils.jfk_umass_child_location_ids() do
        "place-jfk"
      else
        unchecked_location_id
      end

    places
    |> Enum.find(fn place -> place.id == location_id end)
    |> case do
      nil ->
        add_error(
          changeset,
          :location_id,
          "Location `#{location_id}` does not exist"
        )

      place ->
        if PredictionSuppressionUtils.valid_route_for_place?(place, route_id) do
          changeset
        else
          add_error(
            changeset,
            :route_id,
            "Route ID is invalid"
          )
        end
    end
  end
end
