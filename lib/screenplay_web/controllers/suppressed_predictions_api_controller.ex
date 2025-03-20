defmodule ScreenplayWeb.SuppressedPredictionsApiController do
  use ScreenplayWeb, :controller

  action_fallback ScreenplayWeb.FallbackController

  alias Screenplay.SuppressedPredictions

  def index(conn, _params) do
    json(conn, SuppressedPredictions.get_all_suppressed_predictions())
  end

  def create(conn, params) do
    with {:ok, suppressed_prediction} <-
           SuppressedPredictions.create_suppressed_prediction(params) do
      log_suppressed_prediction("suppressed_prediction_created", suppressed_prediction, conn)
      json(conn, %{success: true})
    end
  end

  def update(conn, params = %{"id" => id}) do
    if suppressed_prediction = SuppressedPredictions.get_suppressed_prediction(id) do
      with {:ok, updated_suppressed_prediction} <-
             SuppressedPredictions.update_suppressed_prediction(suppressed_prediction, params) do
        log_suppressed_prediction(
          "suppressed_prediction_updated",
          updated_suppressed_prediction,
          conn
        )

        json(conn, %{success: true})
      end
    else
      conn
      |> put_status(404)
      |> json(%{error: "not_found"})
    end
  end

  def delete(conn, _ = %{"id" => id}) do
    if suppressed_prediction = SuppressedPredictions.get_suppressed_prediction(id) do
      with {:ok, _} <-
             SuppressedPredictions.delete_suppressed_prediction(suppressed_prediction) do
        json(conn, %{success: true})
      end
    else
      conn
      |> put_status(404)
      |> json(%{error: "not_found"})
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
