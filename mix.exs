defmodule Screenplay.MixProject do
  use Mix.Project

  def project do
    [
      app: :screenplay,
      version: "0.1.0",
      elixir: "~> 1.17",
      elixirc_paths: elixirc_paths(Mix.env()),
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps(),
      test_coverage: [tool: LcovEx]
    ]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    default_applications = [:logger, :runtime_tools]

    extra_applications =
      if Mix.env() == :prod do
        default_applications ++ [:diskusage_logger, :ehmon]
      else
        default_applications
      end

    [
      mod: {Screenplay.Application, []},
      extra_applications: extra_applications
    ]
  end

  # Specifies which paths to compile per environment.
  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    [
      {:phoenix, "~> 1.7.0"},
      {:phoenix_html, "~> 3.0"},
      {:phoenix_live_reload, "~> 1.2", only: :dev},
      {:phoenix_view, "~> 2.0"},
      {:phoenix_live_view, "~> 0.18.18"},
      {:phoenix_live_dashboard, "~> 0.7.2"},
      {:telemetry_metrics, "~> 1.0"},
      {:telemetry_poller, "~> 1.0"},
      {:gettext, "~> 0.24.0"},
      {:jason, "~> 1.4"},
      {:plug_cowboy, "~> 2.6"},
      {:cowboy, "== 2.10.0"},
      {:credo, "~> 1.6"},
      {:dialyxir, "~> 1.4", only: [:dev, :test], runtime: false},
      {:diskusage_logger, "0.2.0", only: :prod},
      {:guardian, "~> 2.3"},
      {:ueberauth, "~> 0.10.0"},
      {:ueberauth_oidcc, "~> 0.4"},
      {:sftp_client, "~> 2.0"},
      {:ehmon, github: "mbta/ehmon", only: :prod},
      {:ex_aws, "~> 2.5"},
      {:ex_aws_s3, "~> 2.5"},
      {:ex_aws_rds, "~> 2.0.2"},
      {:httpoison, "~> 2.2.1"},
      {:timex, "~> 3.0"},
      {:lcov_ex, "~> 0.2", only: [:dev, :test], runtime: false},
      {:sobelow, "~> 0.8", only: :dev},
      {:sentry, "~> 10.3"},
      {:stream_data, "~> 1.1", only: :test},
      {:ecto_sql, "~> 3.0"},
      {:postgrex, ">= 0.0.0"},
      {:screens_config, github: "mbta/screens-config-lib"},
      {:mox, "~> 1.0", only: :test},
      {:tzdata, "~> 1.1"},
      {:ex_machina, "~> 2.7", only: :test},
      {:remote_ip, "~> 1.2"},
      {:faker, "~> 0.18"},
      {:nebulex, "~> 2.6"},
      {:oban, "~> 2.18"}
    ]
  end

  # Aliases are shortcuts or tasks specific to the current project.
  # For example, to install project dependencies and perform other setup tasks, run:
  #
  #     $ mix setup
  #
  # See the documentation for `Mix` for more info on aliases.
  defp aliases do
    [
      setup: ["deps.get", "cmd npm install --prefix assets"],
      seed: "run priv/repo/seeds.exs"
    ]
  end
end
