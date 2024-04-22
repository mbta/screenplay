defmodule Screenplay.Repo do
  use Ecto.Repo,
    otp_app: :screenplay,
    adapter: Ecto.Adapters.Postgres
end
