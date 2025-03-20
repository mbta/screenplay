defmodule Screenplay.SuppressedPredictions do
  @moduledoc """
  Module for functions dealing with `SuppressedPredictions` and the `suppressed_predictions` database 
  """

  alias Screenplay.Repo
  alias Screenplay.SuppressedPredictions.SuppressedPrediction

  @doc """
  Gets a single suppressed prediction with the given ID.
  """
  @spec get_suppressed_prediction(id :: String.t()) :: SuppressedPrediction.t() | nil
  def get_suppressed_prediction(id) do
    Repo.get(SuppressedPrediction, id)
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
    suppressed_prediction
    |> Repo.delete()
  end
end
