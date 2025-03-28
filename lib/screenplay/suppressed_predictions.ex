defmodule Screenplay.SuppressedPredictions do
  @moduledoc """
  Module for functions dealing with `SuppressedPredictions` and the `suppressed_predictions` database 
  """

  alias Screenplay.Places
  alias Screenplay.Repo
  alias Screenplay.SuppressedPredictions.SuppressedPrediction

  @valid_silver_line_routes ["741", "742", "743", "746"]

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
  @spec get_all_suppressed_predictions_transit_data() :: [SuppressedPrediction.t()]
  def get_all_suppressed_predictions_transit_data do
    places = Places.get()

    SuppressedPrediction
    |> Repo.all()
    |> Enum.map(fn
      %SuppressedPrediction{
        route_id: "Green",
        location_id: location_id,
        direction_id: direction_id
      } ->
        # Go through Green Line route and repopulate the appropriate branches with the unique direction id
        Enum.find(places, fn place -> place.id == location_id end).routes
        |> Enum.filter(fn route -> String.contains?(route, "Green") end)
        |> Enum.map(fn route ->
          if String.contains?(route, "Green") do
            %{
              stop_id: location_id,
              route_id: route,
              direction_id: direction_id
            }
          end
        end)

      %SuppressedPrediction{
        route_id: "Silver",
        location_id: location_id,
        direction_id: direction_id
      } ->
        # Go through Silver Line route and repopulate the appropriate
        # route numbers that exist in the @valid_silver_line_routes
        Enum.find(places, fn place -> place.id == location_id end).screens
        |> Enum.flat_map(fn
          %Screenplay.Places.Place.PaEssScreen{routes: routes} -> routes
          _ -> []
        end)
        |> Enum.filter(fn route ->
          route.id in @valid_silver_line_routes and
            route.direction_id == direction_id
        end)
        |> Enum.uniq_by(fn route -> {route.id, route.direction_id} end)
        |> Enum.map(fn route ->
          %{
            stop_id: location_id,
            route_id: route.id,
            direction_id: direction_id
          }
        end)

      # If not Green or Silver, just pass along the route
      %SuppressedPrediction{
        route_id: route_id,
        location_id: location_id,
        direction_id: direction_id
      } ->
        [
          %{
            stop_id: location_id,
            route_id: route_id,
            direction_id: direction_id
          }
        ]
    end)
    |> Enum.flat_map(& &1)
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
