defmodule Screenplay.Repo.Migrations.ChangeDaysOfWeekColumnType do
  use Ecto.Migration

  def change do
    execute(&execute_up/0, &execute_down/0)
  end

  defp execute_up do
    repo().query!(
      "ALTER TABLE pa_message ALTER COLUMN days_of_week TYPE integer[] USING (days_of_week::integer[])"
    )
  end

  defp execute_down, do: nil
end
