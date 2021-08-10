use Mix.Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :screenplay, ScreenplayWeb.Endpoint,
  http: [port: 4002],
  server: false

config :screenplay,
  redirect_http?: false,
  sftp_host: System.get_env("SFTP_HOST"),
  sftp_user: System.get_env("SFTP_USER"),
  sftp_password: System.get_env("SFTP_PASSWORD"),
  sftp_remote_path: System.get_env("SFTP_REMOTE_PATH"),
  sftp_local_path: System.get_env("SFTP_LOCAL_PATH")

config :screenplay, ScreenplayWeb.AuthManager, secret_key: "test key"

config :ueberauth, Ueberauth,
  providers: [
    cognito: {Screenplay.Ueberauth.Strategy.Fake, []}
  ]

# Print only warnings and errors during test
config :logger, level: :warn
