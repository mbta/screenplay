import Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :screenplay, ScreenplayWeb.Endpoint,
  http: [port: 4002],
  server: false

config :screenplay,
  redirect_http?: false,
  alerts_fetch_module: Screenplay.OutfrontTakeoverTool.Alerts.LocalFetch,
  local_alerts_path_spec: {:test, "alerts.json"},
  config_fetcher: Screenplay.Config.LocalFetch,
  api_v3_url: [:no_api_requests_allowed_during_testing],
  sftp_client_module: Screenplay.Outfront.FakeSFTPClient

config :ueberauth, Ueberauth,
  providers: [
    keycloak: {Screenplay.Ueberauth.Strategy.Fake, [roles: ["test1"]]}
  ]

config :ueberauth_oidcc,
  providers: [
    keycloak: [
      issuer: :keycloak_issuer,
      client_id: "test-client",
      client_secret: "fake-secret"
    ]
  ]

config :screenplay, Screenplay.Repo,
  adapter: Ecto.Adapters.Postgres,
  database: "screenplay_test",
  pool: Ecto.Adapters.SQL.Sandbox

# Print only warnings and errors during test
config :logger, level: :warning
