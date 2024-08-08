defmodule ScreenplayWeb do
  @moduledoc """
  The entrypoint for defining your web interface, such
  as controllers, views, channels and so on.

  This can be used in your application as:

      use ScreenplayWeb, :controller
      use ScreenplayWeb, :view

  The definitions below will be executed for every view,
  controller, etc, so keep them short and clean, focused
  on imports, uses and aliases.

  Do NOT define functions inside the quoted expressions
  below. Instead, define any helper function in modules
  and import those modules here.
  """

  def static_paths, do: ~w(css fonts images js favicon.ico robots.txt)

  def controller do
    quote do
      use Phoenix.Controller,
        namespace: ScreenplayWeb,
        formats: [:html, :json],
        layouts: [html: {ScreenplayWeb.LayoutView, :app}]

      import Plug.Conn
      import ScreenplayWeb.Gettext
      alias ScreenplayWeb.Router.Helpers, as: Routes

      unquote(verified_routes())
    end
  end

  def view do
    quote do
      use Phoenix.View,
        root: "lib/screenplay_web/templates",
        namespace: ScreenplayWeb

      # Import convenience functions from controllers
      import Phoenix.Controller,
        only: [get_flash: 1, get_flash: 2, view_module: 1, view_template: 1]

      # Include shared imports and aliases for views
      unquote(view_helpers())
    end
  end

  def router do
    quote do
      use Phoenix.Router

      import Plug.Conn
      import Phoenix.Controller
    end
  end

  def channel do
    quote do
      use Phoenix.Channel
      import ScreenplayWeb.Gettext
    end
  end

  def plug do
    quote do
      import Plug.Conn
      unquote(verified_routes())
    end
  end

  defp view_helpers do
    quote do
      # Use all HTML functionality (forms, tags, etc)
      use Phoenix.HTML
      use Phoenix.Component

      # Import basic rendering functionality (render, render_layout, etc)
      import Phoenix.View

      import ScreenplayWeb.ErrorHelpers
      import ScreenplayWeb.Gettext
      alias ScreenplayWeb.Router.Helpers, as: Routes

      unquote(verified_routes())
    end
  end

  def verified_routes do
    quote do
      use Phoenix.VerifiedRoutes,
        endpoint: ScreenplayWeb.Endpoint,
        router: ScreenplayWeb.Router,
        statics: ScreenplayWeb.static_paths()
    end
  end

  @doc """
  When used, dispatch to the appropriate controller/view/etc.
  """
  defmacro __using__(which) when is_atom(which) do
    apply(__MODULE__, which, [])
  end
end
