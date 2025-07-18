import Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :screenplay, ScreenplayWeb.Endpoint,
  http: [port: 4002],
  server: false

config :screenplay, ScreenplayWeb.AuthManager, secret_key: "test_auth_secret"

config :screenplay,
  redirect_http?: false,
  alerts_fetch_module: Screenplay.OutfrontTakeoverTool.Alerts.TestFetch,
  config_fetcher: Screenplay.Places.LocalFetch,
  local_place_descriptions_file_spec: {:test, "place_descriptions.json"},
  local_paess_labels_file_spec: {:test, "paess_labels.json"},
  screens_config_fetcher: Screenplay.ScreensConfig.Fetch.Local,
  pending_screens_config_fetcher: Screenplay.PendingScreensConfig.Fetch.Local,
  local_screens_config_file_spec: {:test, "screens_config.json"},
  local_pending_screens_config_file_spec: {:test, "pending_config.json"},
  api_v3_url: "https://fake-mbta-api",
  api_key: "test_api_key",
  sftp_client_module: Screenplay.Outfront.FakeSFTPClient,
  github_api_client: Screenplay.GithubApi.FakeClient,
  local_signs_json_path: {:test, "signs.json"},
  stops_mod: Screenplay.Stops.Mock,
  routes_mod: Screenplay.Routes.Mock,
  facilities_mod: Screenplay.Facilities.Mock,
  http_client: HTTPoison.Mock

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

config :screenplay, Screenplay.Repo, database: "screenplay_test", pool: Ecto.Adapters.SQL.Sandbox

config :screenplay, Oban, testing: :inline

# Print only warnings and errors during test
config :logger, level: :warning
