import Config

if config_env() == :prod do
  keycloak_opts = [
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

if config_env() != :test do
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

  if env == "prod" do
    config :screenplay, Oban,
      plugins: [
        {Oban.Plugins.Cron,
         crontab: [
           {"0 2 * * *", Screenplay.Jobs.TakeoverToolTestingJob},
           {"* * * * *", Screenplay.Jobs.Reminders},
           {"0 3 * * *", Screenplay.Jobs.ClearSuppressedPredictions}
         ],
         timezone: "America/New_York"},
        Oban.Plugins.Pruner,
        Oban.Plugins.Lifeline,
        Oban.Plugins.Reindexer
      ]
  end
end

config :screenplay, Screenplay.Repo, pool_size: 10
