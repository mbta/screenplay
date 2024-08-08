defmodule ScreenplayWeb.FallbackController do
  use ScreenplayWeb, :controller

  def call(conn, {:error, %Ecto.Changeset{} = changeset}) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(json: ScreenplayWeb.ChangesetJSON)
    |> render(:error, changeset: changeset)
  end
end
