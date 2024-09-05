defmodule Screenplay.Repo do
  require Logger

  use Ecto.Repo,
    otp_app: :screenplay,
    adapter: Ecto.Adapters.Postgres

  def add_prod_credentials(config, auth_token_fn \\ &ExAws.RDS.generate_db_auth_token/4) do
    user = Keyword.fetch!(config, :user)
    host = Keyword.fetch!(config, :hostname)
    port = Keyword.fetch!(config, :port)

    token =
      auth_token_fn.(
        host,
        user,
        port,
        %{}
      )

    if is_nil(token) do
      Logger.info("#{__MODULE__} add_prod_credentials token_is_nil")
    else
      hash_string = Base.encode16(:crypto.hash(:sha3_256, token))

      Logger.info("#{__MODULE__} add_prod_credentials token_hash=#{hash_string}")
    end

    Keyword.put(config, :password, token)
  end
end
