defmodule Screenplay.Repo.Migrations.ChangeTimeColumnsNameAndType do
  use Ecto.Migration

  def change do
    drop(index("pa_message", [:start_time, :end_time]))

    alter table("pa_message") do
      remove(:start_time, :utc_datetime)
      remove(:end_time, :utc_datetime)
      add(:start_time_utc, :time)
      add(:end_time_utc, :time)
    end

    create(index("pa_message", [:start_time_utc, :end_time_utc]))
  end
end
