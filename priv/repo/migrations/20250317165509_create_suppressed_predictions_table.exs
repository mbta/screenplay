defmodule Screenplay.Repo.Migrations.AddSuppressedPredictions do
  use Ecto.Migration

  def change do
    create table("suppressed_predictions") do
      add :location_id, :string
      add :direction_id, :integer
      add :clear_at_end_of_day, :boolean

      timestamps(type: :utc_datetime)
    end

    create index("suppressed_predictions", :location_id)
  end
end
