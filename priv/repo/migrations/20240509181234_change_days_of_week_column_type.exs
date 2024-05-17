defmodule Screenplay.Repo.Migrations.ChangeDaysOfWeekColumnType do
  use Ecto.Migration

  def change do
    execute "ALTER TABLE pa_message ALTER COLUMN days_of_week TYPE integer[] USING (days_of_week::integer[])"
  end
end
