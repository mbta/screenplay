defmodule Screenplay.Repo.Migrations.CreatePaMessageTable do
  use Ecto.Migration

  def change do
    create table("pa_message") do
      add :alert_id, :string
      add :start_time, :utc_datetime
      add :end_time, :utc_datetime
      add :days_of_week, {:array, :string}
      add :sign_ids, {:array, :string}, null: false
      add :priority, :integer, null: false
      add :interval_in_minutes, :integer, null: false
      add :visual_text, :text, null: false
      add :audio_text, :text, null: false
      add :paused, :boolean
      add :saved, :boolean
      add :message_type, :string

      timestamps(type: :utc_datetime)
    end

    create index("pa_message", [:start_time, :end_time])
    create index("pa_message", ["(to_tsvector('english', visual_text))"], using: "GIN")
  end
end
