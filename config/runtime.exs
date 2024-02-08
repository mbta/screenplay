import Config

config :screenplay, ScreenplayWeb.AuthManager, secret_key: System.get_env("GUARDIAN_SECRET_KEY")

config :screenplay, ScreenplayWeb.Endpoint,
  url: [host: System.get_env("HOST"), port: 80],
  secret_key_base: System.get_env("SECRET_KEY_BASE")

sftp_client_module =
  case System.get_env("SFTP_SERVER") do
    "outfront" -> SFTPClient
    _ -> Screenplay.Outfront.FakeSFTPClient
  end

env = System.get_env("ENVIRONMENT_NAME")

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

config :screenplay,
  alerts_s3_path: "screenplay/" <> System.get_env("ALERTS_S3_FILENAME", ""),
  sftp_client_module: sftp_client_module,
  outfront_ssh_key: System.get_env("OUTFRONT_SSH_KEY"),
  outfront_sftp_user: System.get_env("OUTFRONT_SFTP_USER"),
  outfront_sftp_domain: System.get_env("OUTFRONT_SFTP_DOMAIN"),
  pio_slack_group_id: System.get_env("PIO_SLACK_USERGROUP_ID"),
  slack_webhook_url: System.get_env("SLACK_WEBHOOK_URL"),
  environment_name: env,
  sentry_frontend_dsn: System.get_env("SENTRY_DSN"),
  api_v3_key: System.get_env("API_V3_KEY"),
  api_v3_url: System.get_env("API_V3_URL"),
  screens_url: System.get_env("SCREENS_URL"),
  signs_ui_url: System.get_env("SIGNS_UI_URL"),
  alerts_ui_url: System.get_env("ALERTS_UI_URL"),
  fullstory_org_id: System.get_env("FULLSTORY_ORG_ID")

config :sentry,
  dsn: System.get_env("SENTRY_DSN"),
  environment_name: env,
  included_environments: [env],
  enable_source_code_context: true,
  root_source_code_path: File.cwd!()
