defmodule ScreenplayWeb.Router do
  use ScreenplayWeb, :router

  pipeline :browser do
    plug(:accepts, ["html"])
    plug(:fetch_session)
    plug(:fetch_flash)
    plug(:protect_from_forgery)
    plug(:put_secure_browser_headers)
  end

  pipeline :metadata do
    plug(ScreenplayWeb.Plugs.Metadata)
  end

  pipeline :api do
    plug(:accepts, ["json"])
  end

  pipeline :redirect_prod_http do
    if Application.compile_env(:screenplay, :redirect_http?) do
      plug(Plug.SSL, rewrite_on: [:x_forwarded_proto])
    end
  end

  pipeline :auth do
    plug(ScreenplayWeb.AuthManager.Pipeline)
  end

  pipeline :ensure_auth do
    plug(Guardian.Plug.EnsureAuthenticated)
  end

  pipeline :ensure_screenplay_emergency_admin_group do
    plug(ScreenplayWeb.EnsureScreenplayEmergencyAdminGroup)
  end

  pipeline :ensure_pa_message_admin do
    plug(ScreenplayWeb.EnsurePaMessageAdmin)
  end

  pipeline :ensure_api_auth do
    plug(ScreenplayWeb.Plugs.EnsureApiAuth)
  end

  pipeline :ensure_screens_admin do
    plug(ScreenplayWeb.EnsureScreensAdminGroup)
  end

  # Load balancer health check
  # Exempt from auth checks and SSL redirects
  scope "/", ScreenplayWeb do
    get("/_health", HealthController, :index)
  end

  scope "/", ScreenplayWeb.OutfrontTakeoverTool do
    pipe_through([
      :redirect_prod_http,
      :browser,
      :auth,
      :ensure_auth,
      :metadata,
      :ensure_screenplay_emergency_admin_group
    ])

    get("/emergency-takeover", PageController, :index)
  end

  scope "/", ScreenplayWeb do
    pipe_through([:redirect_prod_http, :browser, :auth, :ensure_auth, :metadata])

    get("/", DashboardController, :root_redirect)
    get("/dashboard", DashboardController, :index)
    get("/alerts/*id", AlertsController, :index)
    get("/unauthorized", UnauthorizedController, :index)
  end

  scope "/", ScreenplayWeb do
    pipe_through([
      :redirect_prod_http,
      :browser,
      :auth,
      :ensure_auth,
      :metadata,
      :ensure_pa_message_admin
    ])

    get("/pa-messages", PaMessagesController, :index)
    get("/pa-messages/new", PaMessagesController, :index)
    get("/pa-messages/new/associate-alert", PaMessagesController, :index)
    get("/pa-messages/:id/edit", PaMessagesController, :index)
    get("/api/pa-messages/preview_audio", PaMessagesApiController, :preview_audio)
  end

  scope "/", ScreenplayWeb do
    pipe_through([
      :redirect_prod_http,
      :browser,
      :auth,
      :ensure_auth,
      :ensure_screens_admin,
      :metadata
    ])

    get("/pending", ConfigController, :index)
    get("/configure-screens/*app_id", ConfigController, :index)
  end

  scope "/api", ScreenplayWeb do
    pipe_through([:redirect_prod_http, :browser, :auth, :ensure_auth])

    get("/dashboard", DashboardApiController, :index)
    get("/alerts", AlertsApiController, :index)
    get("/alerts/non_access_alerts", AlertsApiController, :non_access_alerts)
  end

  scope "/auth", ScreenplayWeb do
    pipe_through([:redirect_prod_http, :browser])

    get("/:provider", AuthController, :request)
    get("/:provider/callback", AuthController, :callback)
  end

  scope "/api/takeover_tool", ScreenplayWeb.OutfrontTakeoverTool do
    pipe_through([
      :redirect_prod_http,
      :api,
      :browser,
      :auth,
      :ensure_auth,
      :metadata,
      :ensure_screenplay_emergency_admin_group
    ])

    post("/create", AlertController, :create)
    post("/edit", AlertController, :edit)
    post("/clear", AlertController, :clear)
    post("/clear_all", AlertController, :clear_all)
    get("/active_alerts", AlertController, :active_alerts)
    get("/past_alerts", AlertController, :past_alerts)

    get("/stations_and_screen_orientations", PageController, :stations_and_screen_orientations)
  end

  scope "/config", ScreenplayWeb do
    pipe_through([
      :redirect_prod_http,
      :api,
      :browser,
      :auth,
      :ensure_auth,
      :ensure_screens_admin
    ])

    post("/put", ConfigController, :put)
    post("/publish/:place_id/:app_id", ConfigController, :publish)
    get("/existing-screens/:app_id", ConfigController, :existing_screens)

    get(
      "/existing-screens-at-places-with-pending-screens",
      ConfigController,
      :existing_screens_at_places_with_pending_screens
    )
  end

  scope "/api/pa-messages", ScreenplayWeb do
    pipe_through([:redirect_prod_http, :api, :ensure_api_auth])

    get("/active", PaMessagesApiController, :active)
  end

  scope "/", ScreenplayWeb do
    pipe_through [
      :redirect_prod_http,
      :api,
      :auth,
      :ensure_auth,
      :metadata,
      :ensure_pa_message_admin
    ]

    resources "/api/pa-messages", PaMessagesApiController, only: [:index, :create, :update, :show]
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
