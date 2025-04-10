defmodule Screenplay.SuppressedPredictions do
  @moduledoc """
  Module for functions dealing with `SuppressedPredictions` and the `suppressed_predictions` database 
  """

  alias Screenplay.Places
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
    suppressed_predictions = get_all_suppressed_predictions()

    Places.get()
    |> Enum.flat_map(fn
      %Screenplay.Places.Place{id: "place-jfk"} ->
        Enum.map(
          PredictionSuppressionUtils.jfk_umass_stop_data(),
          fn %{
               route_id: route_id,
               stop_id: stop_id,
               direction_id: direction_id
             } ->
            %{
              stop_id: stop_id,
              route_id: route_id,
              direction_id: direction_id,
              suppression_type:
                PredictionSuppressionUtils.suppression_type(
                  suppressed_predictions,
                  stop_id
                )
            }
          end
        )

      %Screenplay.Places.Place{id: place_stop_id, screens: screens} ->
        Enum.flat_map(screens, fn
          %Screenplay.Places.Place.PaEssScreen{routes: routes} ->
            routes
            |> Enum.uniq_by(fn route -> {route.id, route.direction_id} end)
            |> Enum.filter(&PredictionSuppressionUtils.valid_route?(&1.id))
            |> Enum.map(fn route ->
              %{
                stop_id: place_stop_id,
                route_id: route.id,
                direction_id: route.direction_id,
                suppression_type:
                  PredictionSuppressionUtils.suppression_type(
                    suppressed_predictions,
                    place_stop_id,
                    route.id,
                    route.direction_id
                  )
              }
            end)

          _ ->
            []
        end)
        |> Enum.uniq_by(fn data ->
          {data.route_id, data.stop_id, data.direction_id}
        end)
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
end
