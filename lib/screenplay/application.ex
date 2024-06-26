defmodule Screenplay.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    children =
      [
        # Start the Telemetry supervisor
        ScreenplayWeb.Telemetry,
        # Start the PubSub system
        {Phoenix.PubSub, name: Screenplay.PubSub},
        # Start the Endpoint (http/https)
        ScreenplayWeb.Endpoint,
        Screenplay.OutfrontTakeoverTool.Alerts.State,
        Screenplay.OutfrontTakeoverTool.Alerts.Reminders,
        {Screenplay.Cache.Owner, engine_module: Screenplay.ScreensConfig.Cache.Engine},
        Screenplay.Scheduler,
        Screenplay.Repo,
        Screenplay.Migrate
      ] ++
        if Application.get_env(:screenplay, :start_alerts_cache) do
          [Screenplay.Alerts.Cache]
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
