defmodule Screenplay.Repo.Migrations.CreateEmergencyTakeover do
  use Ecto.Migration

  def change do
    create table(:emergency_takeover) do
      # message stored as jsonb to support the different message types
      add :message, :map, null: false
      add :station_ids, {:array, :string}, default: [], null: false
      add :start_time, :utc_datetime_usec, null: false
      add :end_time, :utc_datetime_usec
      add :created_by, :string, null: false
      add :edited_by, :string
      add :cleared_by, :string
      add :cleared_at, :utc_datetime_usec

      timestamps(type: :utc_datetime_usec)
    end
  end
end
