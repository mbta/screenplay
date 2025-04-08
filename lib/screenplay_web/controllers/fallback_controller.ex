defmodule ScreenplayWeb.FallbackController do
  use ScreenplayWeb, :controller

  def call(conn, {:error, %Ecto.Changeset{} = changeset}) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(json: ScreenplayWeb.ChangesetJSON)
    |> render(:error, changeset: changeset)
  end

  def call(conn, {:error, :not_found}) do
    conn
    |> put_status(404)
    |> json(%{error: "not_found"})
  end
end
