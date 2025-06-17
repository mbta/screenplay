defmodule Screenplay.SuppressedPredictions do
  @moduledoc """
  Module for functions dealing with `SuppressedPredictions` and the `suppressed_predictions` database
  """

  alias Screenplay.Places
  alias Screenplay.PredictionSuppression
  alias Screenplay.PredictionSuppressionUtils
  alias Screenplay.Repo
  alias Screenplay.SuppressedPredictions.SuppressedPrediction

  @doc """
  Gets a single suppressed prediction with the given ID.
  """
  @spec get_suppressed_prediction(
          location_id :: String.t(),
          route_id :: String.t(),
          direction_id :: integer()
        ) ::
          {:ok, SuppressedPrediction.t()} | {:error, :not_found}
  def get_suppressed_prediction(location_id, route_id, direction_id) do
    case Repo.get_by(SuppressedPrediction,
           location_id: location_id,
           route_id: route_id,
           direction_id: direction_id
         ) do
      nil ->
        {:error, :not_found}

      suppressed_prediction ->
        {:ok, suppressed_prediction}
    end
  end

  @doc """
  Get all suppressed predictions
  """
  @spec get_all_suppressed_predictions() :: [SuppressedPrediction.t()]
  def get_all_suppressed_predictions do
    SuppressedPrediction
    |> Repo.all()
  end

  @doc """
  Get all suppressed predictions modified for transit data
  """
  @spec get_all_suppressed_predictions_for_data() :: [
          %{
            route_id: String.t(),
            stop_id: String.t(),
            direction_id: integer(),
            suppression_type: :terminal | :stop | :none
          }
        ]
  def get_all_suppressed_predictions_for_data do
    suppressed_predictions_map =
      MapSet.new(
        get_all_suppressed_predictions(),
        &%{location_id: &1.location_id, route_id: &1.route_id, direction_id: &1.direction_id}
      )

    line_stops_map =
      PredictionSuppression.line_stops()
      |> Enum.filter(&(&1.suppression_type != nil))
      |> Enum.group_by(& &1.stop_id)

    Places.get()
    |> Enum.flat_map(fn
      # JFK has special two child stops ids to take into account, if we find it here
      # we split it up into the two platforms and handle the special case
      %Screenplay.Places.Place{id: "place-jfk"} ->
        Enum.map(
          PredictionSuppressionUtils.jfk_umass_child_stop_data(),
          fn %{
               location_id: location_id,
               route_id: route_id,
               stop_id: child_stop_id,
               direction_id: direction_id
             } ->
            %{
              stop_id: child_stop_id,
              route_id: route_id,
              direction_id: direction_id,
              suppression_type:
                PredictionSuppressionUtils.suppression_type(
                  location_id,
                  route_id,
                  direction_id,
                  suppressed_predictions_map,
                  :stop
                )
            }
          end
        )

      place ->
        case Map.get(line_stops_map, place.id) do
          nil ->
            []

          line_stops ->
            line_stops
            |> Enum.filter(&PredictionSuppressionUtils.valid_route_for_place?(place, &1.line))
            |> Enum.flat_map(fn
              %{
                line: "Silver",
                direction_id: direction_id,
                suppression_type: suppression_type
              } ->
                Enum.flat_map(place.screens, fn
                  %Screenplay.Places.Place.PaEssScreen{routes: routes} ->
                    Enum.filter(
                      routes,
                      fn route ->
                        PredictionSuppressionUtils.sl_waterfront?(route.id) and
                          route.direction_id == direction_id
                      end
                    )

                  _ ->
                    []
                end)
                |> Enum.uniq_by(fn %{id: route_id, direction_id: direction_id} ->
                  {route_id, direction_id}
                end)
                |> Enum.map(fn %{id: route_id, direction_id: direction_id} ->
                  PredictionSuppressionUtils.suppressed_prediction_for_data(
                    place.id,
                    route_id,
                    direction_id,
                    suppressed_predictions_map,
                    suppression_type,
                    "Silver"
                  )
                end)

              %{
                line: "Green",
                stop_id: stop_id,
                direction_id: direction_id,
                suppression_type: suppression_type
              } ->
                place.routes
                |> Enum.filter(&String.starts_with?(&1, "Green"))
                |> Enum.map(
                  &PredictionSuppressionUtils.suppressed_prediction_for_data(
                    stop_id,
                    &1,
                    direction_id,
                    suppressed_predictions_map,
                    suppression_type,
                    "Green"
                  )
                )

              %{
                line: route_id,
                stop_id: stop_id,
                direction_id: direction_id,
                suppression_type: suppression_type
              } ->
                [
                  PredictionSuppressionUtils.suppressed_prediction_for_data(
                    stop_id,
                    route_id,
                    direction_id,
                    suppressed_predictions_map,
                    suppression_type,
                    route_id
                  )
                ]
            end)
        end
    end)
  end

  @doc """
  Create a suppression for predictions at a station
  """
  @spec create_suppressed_prediction(params :: map()) ::
          {:ok, SuppressedPrediction.t()} | {:error, Ecto.Changeset.t()}
  def create_suppressed_prediction(params) do
    %SuppressedPrediction{}
    |> SuppressedPrediction.changeset(params)
    |> Repo.insert()
  end

  @doc """
  Updates a suppression for prediction
  """
  @spec update_suppressed_prediction(
          suppressed_prediction :: SuppressedPrediction.t(),
          changes :: map()
        ) ::
          {:ok, SuppressedPrediction.t()} | {:error, Ecto.Changeset.t()}
  def update_suppressed_prediction(suppressed_prediction, changes) do
    suppressed_prediction
    |> SuppressedPrediction.changeset(changes)
    |> Repo.update()
  end

  @doc """
  Delete a suppressed prediction
  """
  @spec delete_suppressed_prediction(suppressed_prediction :: SuppressedPrediction.t()) ::
          {:ok, SuppressedPrediction.t()} | {:error, Ecto.Changeset.t()}
  def delete_suppressed_prediction(suppressed_prediction) do
    Repo.delete(suppressed_prediction)
  end

  @doc """
  Clears all suppressed predicitons with the "clear_at_end_of_day" flag set to true
  """
  @spec clear_suppressed_predictions_for_end_of_day() :: {non_neg_integer(), nil}
  def clear_suppressed_predictions_for_end_of_day do
    import Ecto.Query, only: [from: 2]

    from(sp in SuppressedPrediction, where: sp.clear_at_end_of_day == true)
    |> Repo.delete_all()
  end
end
