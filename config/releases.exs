import Config

config :screenplay, ScreenplayWeb.AuthManager, secret_key: System.get_env("GUARDIAN_SECRET_KEY")

config :screenplay, ScreenplayWeb.Endpoint,
  url: [host: System.get_env("HOST"), port: 80],
  secret_key_base: System.get_env("SECRET_KEY_BASE")

config :ueberauth, Ueberauth.Strategy.Cognito,
  auth_domain: System.get_env("COGNITO_DOMAIN"),
  client_id: System.get_env("COGNITO_CLIENT_ID"),
  client_secret: System.get_env("COGNITO_CLIENT_SECRET"),
  user_pool_id: System.get_env("COGNITO_USER_POOL_ID"),
  aws_region: System.get_env("COGNITO_AWS_REGION")

sftp_module =
  case System.get_env("SFTP_SERVER") do
    "outfront" -> Screenplay.Outfront.SFTP
    _ -> Screenplay.Outfront.FakeSFTP
  end

config :screenplay,
  alerts_s3_path: "screenplay/" <> System.get_env("ALERTS_S3_FILENAME"),
  sftp_module: sftp_module,
  outfront_ssh_key: System.get_env("OUTFRONT_SSH_KEY"),
  outfront_sftp_user: System.get_env("OUTFRONT_SFTP_USER"),
  outfront_sftp_domain: System.get_env("OUTFRONT_SFTP_DOMAIN")
