defmodule Screenplay.Repo.Migrations.AddTemplateIdColumn do
  use Ecto.Migration

  def change do
    alter table("pa_message") do
      add :template_id, :integer
    end
  end
end
