defmodule ScreenplayWeb.SuppressedPredictionsApiController do
  use ScreenplayWeb, :controller

  action_fallback ScreenplayWeb.FallbackController

  alias Screenplay.SuppressedPredictions

  def data(conn, _params) do
    json(conn, SuppressedPredictions.get_all_suppressed_predictions_for_data())
  end

  def index(conn, _params) do
    json(conn, SuppressedPredictions.get_all_suppressed_predictions())
  end

  def create(conn, params) do
    with {:ok, suppressed_prediction} <-
           SuppressedPredictions.create_suppressed_prediction(params) do
      log_suppressed_prediction("suppressed_prediction_created", suppressed_prediction, conn)
      json(conn, suppressed_prediction)
    end
  end

  def update(
        conn,
        params = %{
          "location_id" => location_id,
          "route_id" => route_id,
          "direction_id" => direction_id
        }
      ) do
    with(
      {:ok, suppressed_prediction} <-
        SuppressedPredictions.get_suppressed_prediction(location_id, route_id, direction_id),
      {:ok, updated_suppressed_prediction} <-
        SuppressedPredictions.update_suppressed_prediction(suppressed_prediction, params)
    ) do
      log_suppressed_prediction(
        "suppressed_prediction_updated",
        updated_suppressed_prediction,
        conn
      )

      json(conn, updated_suppressed_prediction)
    end
  end

  def delete(
        conn,
        _delete_suppressed_params = %{
          "location_id" => location_id,
          "route_id" => route_id,
          "direction_id" => direction_id
        }
      ) do
    with {:ok, suppressed_prediction} <-
           SuppressedPredictions.get_suppressed_prediction(location_id, route_id, direction_id),
         {:ok, deleted_suppressed_prediction} <-
           SuppressedPredictions.delete_suppressed_prediction(suppressed_prediction) do
      log_suppressed_prediction(
        "suppressed_prediction_deleted",
        deleted_suppressed_prediction,
        conn
      )

      json(conn, deleted_suppressed_prediction)
    end
  end

  defp log_suppressed_prediction(event, suppressed_prediction, conn) do
    Screenplay.Util.log(event,
      location_id: suppressed_prediction.location_id,
      direction_id: suppressed_prediction.direction_id,
      clear_at_end_of_day: suppressed_prediction.clear_at_end_of_day,
      user: get_session(conn, "username") |> Screenplay.Util.trim_username()
    )
  end
end
