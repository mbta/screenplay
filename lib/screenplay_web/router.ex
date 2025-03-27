defmodule ScreenplayWeb.Router do
  use ScreenplayWeb, :router

  alias ScreenplayWeb.AuthManager.EnsureRole

  pipeline :redirect_prod_http do
    if Application.compile_env(:screenplay, :redirect_http?) do
      plug(Plug.SSL, rewrite_on: [:x_forwarded_proto])
    end
  end

  pipeline :browser do
    plug(:redirect_prod_http)
    plug(:accepts, ["html"])
    plug(:fetch_session)
    plug(:fetch_flash)
    plug(:protect_from_forgery)
    plug(:put_secure_browser_headers)
  end

  pipeline :api do
    plug(:redirect_prod_http)
    plug(:accepts, ["json"])
  end

  pipeline :authenticate do
    plug(ScreenplayWeb.AuthManager.Pipeline)
    plug(Guardian.Plug.EnsureAuthenticated)
    plug(ScreenplayWeb.Plugs.Metadata)
  end

  pipeline :ensure_api_auth do
    plug(ScreenplayWeb.Plugs.EnsureApiAuth)
  end

  pipeline :ensure_outfront_admin, do: plug(EnsureRole, :emergency_admin)
  pipeline :ensure_pa_message_admin, do: plug(EnsureRole, :pa_message_admin)
  pipeline :ensure_screens_admin, do: plug(EnsureRole, :screens_admin)

  # Load balancer health check, exempt from authentication, SSL redirects, etc.
  scope "/_health", ScreenplayWeb do
    get("/", HealthController, :index)
  end

  scope "/auth", ScreenplayWeb do
    pipe_through([:browser])

    get("/:provider", AuthController, :request)
    get("/:provider/callback", AuthController, :callback)
  end

  scope "/unauthorized", ScreenplayWeb do
    pipe_through([:browser, :authenticate])

    get("/", UnauthorizedController, :index)
  end

  # Dashboard (Places/Alerts)

  scope "/", ScreenplayWeb do
    pipe_through([:browser, :authenticate])

    get("/", DashboardController, :root_redirect)
    get("/dashboard", DashboardController, :index)
    get("/alerts/*id", AlertsController, :index)
  end

  scope "/api", ScreenplayWeb do
    pipe_through([:api, :authenticate])

    get("/dashboard", DashboardApiController, :index)
    get("/service_records", DashboardApiController, :service_records)
    get("/alerts", AlertsApiController, :index)
    get("/alerts/non_access_alerts", AlertsApiController, :non_access_alerts)
  end

  # PA Message Management

  scope "/pa-messages", ScreenplayWeb do
    pipe_through([:browser, :authenticate])

    get("/", PaMessagesController, :index)
    get("/new", PaMessagesController, :index)
    get("/:id/edit", PaMessagesController, :index)
  end

  scope "/api/pa-messages", ScreenplayWeb do
    pipe_through([:api, :ensure_api_auth])

    get("/active", PaMessagesApiController, :active)
  end

  scope "/api/pa-messages", ScreenplayWeb do
    pipe_through([:api, :authenticate])

    get("/preview_audio", PaMessagesApiController, :preview_audio)
    resources("/", PaMessagesApiController, only: [:index, :show])
  end

  scope "/api/pa-messages", ScreenplayWeb do
    pipe_through([:api, :authenticate, :ensure_pa_message_admin])

    resources("/", PaMessagesApiController, only: [:create, :update])
  end

  # Permanent Configuration

  scope "/", ScreenplayWeb do
    pipe_through([:browser, :authenticate, :ensure_screens_admin])

    get("/pending", ConfigController, :index)
    get("/configure-screens/*app_id", ConfigController, :index)
  end

  scope "/config", ScreenplayWeb do
    pipe_through([:api, :authenticate, :ensure_screens_admin])

    post("/put", ConfigController, :put)
    post("/publish/:place_id/:app_id", ConfigController, :publish)
    get("/existing-screens/:app_id", ConfigController, :existing_screens)

    get(
      "/existing-screens-at-places-with-pending-screens",
      ConfigController,
      :existing_screens_at_places_with_pending_screens
    )
  end

  # Outfront Emergency Takeover Tool

  scope "/emergency-takeover", ScreenplayWeb.OutfrontTakeoverTool do
    pipe_through([:browser, :authenticate, :ensure_outfront_admin])

    get("/", PageController, :index)
  end

  scope "/api/takeover_tool", ScreenplayWeb.OutfrontTakeoverTool do
    pipe_through([:api, :browser, :authenticate, :ensure_outfront_admin])

    post("/create", AlertController, :create)
    post("/edit", AlertController, :edit)
    post("/clear", AlertController, :clear)
    post("/clear_all", AlertController, :clear_all)
    get("/active_alerts", AlertController, :active_alerts)
    get("/past_alerts", AlertController, :past_alerts)

    get("/stations_and_screen_orientations", PageController, :stations_and_screen_orientations)
  end

  # Enables LiveDashboard only for development
  #
  # If you want to use the LiveDashboard in production, you should put
  # it behind authentication and allow only admins to access it.
  # If your application does not have an admins-only section yet,
  # you can use Plug.BasicAuth to set up some basic authentication
  # as long as you are also using SSL (which you should anyway).
  if Mix.env() in [:dev, :test] do
    import Phoenix.LiveDashboard.Router

    scope "/" do
      pipe_through(:browser)
      live_dashboard("/telemetry_dashboard", metrics: ScreenplayWeb.Telemetry)
    end
  end
end
