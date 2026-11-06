defmodule Screenplay.Repo.Migrations.AddAlertModeEffectToPaMessages do
  use Ecto.Migration

  def change do
    alter table(:pa_message) do
      add :alert_modes, {:array, :string}, default: [], null: false
      add :alert_service_effect, :text
    end
  end
end
