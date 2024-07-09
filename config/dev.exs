import Config

# For development, we disable any cache and enable
# debugging and code reloading.
#
# The watchers configuration can be used to run external
# watchers to your application. For example, we use it
# with webpack to recompile .js and .css sources.
config :screenplay, ScreenplayWeb.Endpoint,
  http: [port: 4444],
  debug_errors: true,
  code_reloader: true,
  check_origin: false,
  watchers: [
    node: [
      "node_modules/webpack/bin/webpack.js",
      "--mode",
      "development",
      "--watch",
      "--watch-options-stdin",
      cd: Path.expand("../assets", __DIR__)
    ]
  ]

# ## SSL Support
#
# In order to use HTTPS in development, a self-signed
# certificate can be generated by running the following
# Mix task:
#
#     mix phx.gen.cert
#
# Note that this task requires Erlang/OTP 20 or later.
# Run `mix help phx.gen.cert` for more information.
#
# The `http:` config above can be replaced with:
#
#     https: [
#       port: 4001,
#       cipher_suite: :strong,
#       keyfile: "priv/cert/selfsigned_key.pem",
#       certfile: "priv/cert/selfsigned.pem"
#     ],
#
# If desired, both `http:` and `https:` keys can be
# configured to run both http and https servers on
# different ports.

# Watch static and templates for browser reloading.
config :screenplay, ScreenplayWeb.Endpoint,
  live_reload: [
    patterns: [
      ~r"priv/static/.*(js|css|png|jpeg|jpg|gif|svg)$",
      ~r"priv/gettext/.*(po)$",
      ~r"lib/screenplay_web/(live|views)/.*(ex)$",
      ~r"lib/screenplay_web/templates/.*(eex)$"
    ]
  ]

config :screenplay, Screenplay.Repo,
  database: "screenplay_dev",
  show_sensitive_data_on_connection_error: true,
  backoff_min: 5_000

# Do not include metadata nor timestamps in development logs
config :logger, :console, format: "[$level] $message\n"

# Set a higher stacktrace during development. Avoid configuring such
# in production as building large stacktraces may be expensive.
config :phoenix, :stacktrace_depth, 20

# Initialize plugs at runtime for faster development compilation
config :phoenix, :plug_init_mode, :runtime

config :screenplay,
  redirect_http?: false,
  sftp_host: System.get_env("SFTP_HOST"),
  sftp_user: System.get_env("SFTP_USER"),
  sftp_password: System.get_env("SFTP_PASSWORD"),
  sftp_remote_path: System.get_env("SFTP_REMOTE_PATH"),
  sftp_local_path: System.get_env("SFTP_LOCAL_PATH"),
  alerts_fetch_module: Screenplay.OutfrontTakeoverTool.Alerts.LocalFetch,
  sftp_client_module: Screenplay.Outfront.FakeSFTPClient,
  config_fetcher: Screenplay.Config.LocalFetch,
  screens_config_fetcher: Screenplay.ScreensConfig.Fetch.Local,
  pending_screens_config_fetcher: Screenplay.PendingScreensConfig.Fetch.Local,
  local_config_file_spec: {:priv, "places_and_screens.json"},
  local_screens_config_file_spec: "../screens/priv/local.json",
  local_pending_screens_config_file_spec: "../screens/priv/local_pending.json",
  local_locations_file_spec: {:priv, "screen_locations.json"},
  local_place_descriptions_file_spec: {:priv, "place_descriptions.json"},
  local_paess_labels_file_spec: {:priv, "paess_labels.json"},
  api_v3_key: System.get_env("API_V3_KEY")

config :ueberauth, Ueberauth,
  providers: [
    keycloak:
      {Screenplay.Ueberauth.Strategy.Fake,
       [roles: ["screenplay-emergency-admin", "screens-admin", "pa-message-admin"]]}
  ]

config :ueberauth_oidcc,
  providers: [
    keycloak: [
      issuer: :keycloak_issuer,
      client_id: "dev-client",
      client_secret: "fake-secret"
    ]
  ]
