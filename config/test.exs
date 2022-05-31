import Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :screenplay, ScreenplayWeb.Endpoint,
  http: [port: 4002],
  server: false

config :screenplay,
  redirect_http?: false,
  alerts_fetch_module: Screenplay.Alerts.LocalFetch,
  local_alerts_path_spec: {:test, "alerts.json"}

config :screenplay, ScreenplayWeb.AuthManager, secret_key: "test key"

config :ueberauth, Ueberauth,
  providers: [
    cognito: {Screenplay.Ueberauth.Strategy.Fake, []}
  ]

# Print only warnings and errors during test
config :logger, level: :warn
