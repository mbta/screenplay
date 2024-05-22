defmodule Screenplay.Repo.Migrations.AddAlertIdIndex do
  use Ecto.Migration

  def change do
    create index("pa_message", [:alert_id])
  end
end
