# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

config :screenplay, Screenplay.Repo,
  database: "screenplay_repo",
  username: "user",
  password: "pass",
  hostname: "localhost"

config :screenplay, ecto_repos: [Screenplay.Repo]

# Configures the endpoint
config :screenplay, ScreenplayWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "drimL+OI78FRmMU5+sERpEFHEwpUIrTo1CMAafmiAXM+YjD0G5tJHQlkcZyQanhu",
  render_errors: [view: ScreenplayWeb.ErrorView, accepts: ~w(html json), layout: false],
  pubsub_server: Screenplay.PubSub,
  live_view: [signing_salt: "vSiyKz7D"]

config :screenplay,
  config_fetcher: Screenplay.Config.S3Fetch,
  config_s3_bucket: "mbta-ctd-config",
  record_sentry: false

# Include 2 logger backends
config :logger,
  backends: [:console, Sentry.LoggerBackend]

# Do not send local errors to Sentry
config :sentry,
  dsn: "",
  environment_name: "dev",
  included_environments: []

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

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

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
