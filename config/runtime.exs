import Config

config :screenplay, ScreenplayWeb.AuthManager, secret_key: System.get_env("GUARDIAN_SECRET_KEY")

config :screenplay, ScreenplayWeb.Endpoint,
  url: [host: System.get_env("HOST"), port: 80],
  secret_key_base: System.get_env("SECRET_KEY_BASE")

env = System.get_env("ENVIRONMENT_NAME")

sftp_client_module =
  case env do
    "prod" -> SFTPClient
    _ -> Screenplay.Outfront.FakeSFTPClient
  end

if config_env() == :prod do
  keycloak_opts = [
    issuer: :keycloak_issuer,
    client_id: System.fetch_env!("KEYCLOAK_CLIENT_ID"),
    client_secret: System.fetch_env!("KEYCLOAK_CLIENT_SECRET")
  ]

  config :ueberauth_oidcc,
    issuers: [
      %{
        name: :keycloak_issuer,
        issuer: System.fetch_env!("KEYCLOAK_ISSUER")
      }
    ],
    providers: [
      keycloak: keycloak_opts
    ]
end

sentry_dsn = System.get_env("SENTRY_DSN")

config :screenplay,
  alerts_s3_path: "screenplay/" <> System.get_env("ALERTS_S3_FILENAME", ""),
  sftp_client_module: sftp_client_module,
  outfront_ssh_key: System.get_env("OUTFRONT_SSH_KEY"),
  outfront_sftp_user: System.get_env("OUTFRONT_SFTP_USER"),
  outfront_sftp_domain: System.get_env("OUTFRONT_SFTP_DOMAIN"),
  pio_slack_group_id: System.get_env("PIO_SLACK_USERGROUP_ID"),
  slack_webhook_url: System.get_env("SLACK_WEBHOOK_URL"),
  environment_name: env,
  sentry_frontend_dsn: sentry_dsn,
  api_v3_key: System.get_env("API_V3_KEY"),
  api_v3_url: System.get_env("API_V3_URL"),
  screens_url: System.get_env("SCREENS_URL"),
  signs_ui_url: System.get_env("SIGNS_UI_URL"),
  alerts_ui_url: System.get_env("ALERTS_UI_URL"),
  fullstory_org_id: System.get_env("FULLSTORY_ORG_ID"),
  api_key: System.fetch_env!("SCREENPLAY_API_KEY"),
  watts_url: System.get_env("WATTS_URL"),
  watts_api_key: System.get_env("WATTS_API_KEY")

if sentry_dsn not in [nil, ""] do
  config :sentry,
    dsn: sentry_dsn,
    environment_name: env
end

scheduler_jobs =
  if env == "prod",
    do: [{"0 7 * * *", {Screenplay.Jobs.TakeoverToolTestingJob, :run, []}}],
    else: []

config :screenplay, Screenplay.Scheduler, jobs: scheduler_jobs

config :screenplay, Screenplay.Repo, pool_size: 10

if config_env() in [:prod, :test] do
  config :screenplay, Screenplay.Repo,
    username: System.get_env("DATABASE_USER", ""),
    password: System.get_env("DATABASE_PASSWORD", ""),
    hostname: System.get_env("DATABASE_HOST", "localhost"),
    port: System.get_env("DATABASE_PORT", "5432") |> String.to_integer()
end
