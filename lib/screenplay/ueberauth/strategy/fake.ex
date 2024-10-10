defmodule Screenplay.Ueberauth.Strategy.Fake do
  @moduledoc """
  Mock Ueberauth strategy for development.
  """

  use Ueberauth.Strategy, ignores_csrf_attack: true
  use ScreenplayWeb, :verified_routes
  alias Ueberauth.Strategy.Helpers, as: Helpers

  @impl Ueberauth.Strategy
  def handle_request!(conn) do
    conn
    |> redirect!(~p"/auth/keycloak/callback")
    |> halt()
  end

  @impl Ueberauth.Strategy
  def handle_callback!(conn) do
    conn
  end

  @impl Ueberauth.Strategy
  def uid(_conn) do
    "ActiveDirectory_MBTA\\fake_uid"
  end

  @impl Ueberauth.Strategy
  def credentials(_conn) do
    %Ueberauth.Auth.Credentials{
      token: "fake_access_token",
      refresh_token: "fake_refresh_token",
      expires: true,
      expires_at: System.system_time(:second) + 60 * 60
    }
  end

  @impl Ueberauth.Strategy
  def info(_conn) do
    %Ueberauth.Auth.Info{
      name: "ActiveDirectory_MBTA\\Fake User"
    }
  end

  @impl Ueberauth.Strategy
  def extra(conn) do
    %Ueberauth.Auth.Extra{
      raw_info: %UeberauthOidcc.RawInfo{
        claims: %{
          "iat" => System.system_time(:second)
        },
        userinfo: %{
          "resource_access" => %{
            "dev-client" => %{"roles" => Helpers.options(conn)[:roles]}
          }
        }
      }
    }
  end

  @impl Ueberauth.Strategy
  def handle_cleanup!(conn) do
    conn
  end
end
