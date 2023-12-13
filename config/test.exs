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
  config_fetcher: Screenplay.Config.Fetch.Local,
  api_v3_url: [:no_api_requests_allowed_during_testing]

config :ueberauth, Ueberauth,
  providers: [
    cognito: {Screenplay.Ueberauth.Strategy.Fake, []}
  ]

# Print only warnings and errors during test
config :logger, level: :warning
