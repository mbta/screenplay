defmodule Screenplay.Repo.Migrations.AddAudioUrlColumn do
  use Ecto.Migration

  def change do
    alter table("pa_message") do
      add :audio_url, :text
      modify :audio_text, :text, null: true
    end
  end
end
