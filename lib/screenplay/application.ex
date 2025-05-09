defmodule Screenplay.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    children =
      [
        {Ecto.Migrator, repos: Application.fetch_env!(:screenplay, :ecto_repos)},
        # Start the Ecto repository
        Screenplay.Repo,
        {Oban, Application.fetch_env!(:screenplay, Oban)},
        # Start the Telemetry supervisor
        ScreenplayWeb.Telemetry,
        # Start the PubSub system
        {Phoenix.PubSub, name: Screenplay.PubSub},
        # Start the Endpoint (http/https)
        ScreenplayWeb.Endpoint,
        Screenplay.OutfrontTakeoverTool.Alerts.State,
        Screenplay.ScreensConfig
      ] ++
        if Application.get_env(:screenplay, :start_cache_processes) do
          [Screenplay.Alerts.Cache, Screenplay.Places, Screenplay.PredictionSuppression]
        else
          []
        end

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Screenplay.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    ScreenplayWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
