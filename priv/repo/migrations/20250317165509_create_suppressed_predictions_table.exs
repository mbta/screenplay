defmodule Screenplay.Repo.Migrations.AddSuppressedPredictions do
  use Ecto.Migration

  def change do
    create table("suppressed_predictions", primary_key: false) do
      add :location_id, :string, primary_key: true
      add :route_id, :string, primary_key: true
      add :direction_id, :integer, primary_key: true
      add :clear_at_end_of_day, :boolean

      timestamps(type: :utc_datetime)
    end

    create index("suppressed_predictions", :location_id)
  end
end
