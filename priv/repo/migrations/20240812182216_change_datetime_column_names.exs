defmodule Screenplay.Repo.Migrations.ChangeDatetimeColumnNames do
  use Ecto.Migration

  def change do
    rename table("pa_message"), :start_time, to: :start_datetime
    rename table("pa_message"), :end_time, to: :end_datetime

    rename(
      index(:pa_message, [:start_datetime, :end_datetime],
        name: "pa_message_start_time_end_time_index"
      ),
      to: "pa_message_start_datetime_end_datetime_index"
    )
  end
end
