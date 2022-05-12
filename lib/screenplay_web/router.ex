defmodule ScreenplayWeb.Router do
  use ScreenplayWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :redirect_prod_http do
    if Application.get_env(:screenplay, :redirect_http?) do
      plug(Plug.SSL, rewrite_on: [:x_forwarded_proto])
    end
  end

  pipeline :auth do
    plug(ScreenplayWeb.AuthManager.Pipeline)
  end

  pipeline :ensure_auth do
    plug(Guardian.Plug.EnsureAuthenticated)
  end

  pipeline :ensure_screenplay_group do
    plug(ScreenplayWeb.EnsureScreenplayGroup)
  end

  # Load balancer health check
  # Exempt from auth checks and SSL redirects
  scope "/", ScreenplayWeb do
    get "/_health", HealthController, :index
  end

  scope "/", ScreenplayWeb do
    pipe_through [
      :redirect_prod_http,
      :browser,
      :auth,
      :ensure_auth,
      :ensure_screenplay_group
    ]

    get("/", PageController, :index)
    get("/dashboard", DashboardController, :index)
  end

  scope "/", ScreenplayWeb do
    pipe_through [:redirect_prod_http, :browser, :auth, :ensure_auth]

    get("/unauthorized", UnauthorizedController, :index)
  end

  scope "/auth", ScreenplayWeb do
    pipe_through([:redirect_prod_http, :browser])

    get("/:provider", AuthController, :request)
    get("/:provider/callback", AuthController, :callback)
  end

  scope "/api", ScreenplayWeb do
    pipe_through [
      :redirect_prod_http,
      :api,
      :browser,
      :auth,
      :ensure_auth,
      :ensure_screenplay_group
    ]

    post("/create", AlertController, :create)
    post("/edit", AlertController, :edit)
    post("/clear", AlertController, :clear)
    post("/clear_all", AlertController, :clear_all)
    get("/active_alerts", AlertController, :active_alerts)
    get("/past_alerts", AlertController, :past_alerts)
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
      pipe_through :browser
      live_dashboard "/telemetry_dashboard", metrics: ScreenplayWeb.Telemetry
    end
  end
end
