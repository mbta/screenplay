defmodule Screenplay.Repo.Migrations.AddGinIndexToPaMessageSignIds do
  use Ecto.Migration

  def change do
    create index(:pa_message, :sign_ids, using: "GIN", name: :pa_message_sign_ids_index)
  end
end
