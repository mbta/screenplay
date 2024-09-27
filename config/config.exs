# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

config :screenplay, Screenplay.Repo,
  database: "screenplay_dev",
  username: System.get_env("DATABASE_USER", ""),
  password: System.get_env("DATABASE_PASSWORD", ""),
  hostname: System.get_env("DATABASE_HOST", "localhost"),
  port: System.get_env("DATABASE_PORT", "5432") |> String.to_integer(),
  show_sensitive_data_on_connection_error: true,
  backoff_min: 5_000

config :screenplay, ecto_repos: [Screenplay.Repo]

# Configures the endpoint
config :screenplay, ScreenplayWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "drimL+OI78FRmMU5+sERpEFHEwpUIrTo1CMAafmiAXM+YjD0G5tJHQlkcZyQanhu",
  render_errors: [view: ScreenplayWeb.ErrorView, accepts: ~w(html json), layout: false],
  pubsub_server: Screenplay.PubSub,
  live_view: [signing_salt: "vSiyKz7D"]

config :screenplay,
  config_fetcher: Screenplay.PlacesAndScreens.S3Fetch,
  screens_config_fetcher: Screenplay.ScreensConfig.Fetch.S3,
  pending_screens_config_fetcher: Screenplay.PendingScreensConfig.Fetch.S3,
  config_s3_bucket: "mbta-ctd-config",
  record_sentry: false,
  start_alerts_cache: config_env() != :test

# Include 2 logger backends
config :logger,
  backends: [:console, Sentry.LoggerBackend]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:remote_ip, :request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Use Jason for JSON parsing in ExAws
config :ex_aws, json_codec: Jason

config :screenplay, ScreenplayWeb.AuthManager, issuer: "screenplay"

# Placeholder for Keycloak authentication, defined for real in environment configs
config :ueberauth, Ueberauth,
  providers: [
    keycloak: nil
  ]

config :elixir, :time_zone_database, Tzdata.TimeZoneDatabase

import_config "outfront_takeover_tool_screens.exs"

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
