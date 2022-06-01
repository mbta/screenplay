defmodule Screenplay.Ueberauth.Strategy.Fake do
  @moduledoc """
  Mock Ueberauth strategy for development.
  """

  use Ueberauth.Strategy, ignores_csrf_attack: true
  alias Ueberauth.Strategy.Helpers, as: Helpers

  @impl Ueberauth.Strategy
  def handle_request!(conn) do
    conn
    |> redirect!("/auth/cognito/callback")
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
  def credentials(conn) do
    %Ueberauth.Auth.Credentials{
      token: "fake_access_token",
      refresh_token: "fake_refresh_token",
      expires: true,
      expires_at: System.system_time(:second) + 60 * 60,
      other: %{groups: Helpers.options(conn)[:groups]}
    }
  end

  @impl Ueberauth.Strategy
  def info(_conn) do
    %Ueberauth.Auth.Info{
      name: "ActiveDirectory_MBTA\\Fake User"
    }
  end

  @impl Ueberauth.Strategy
  def extra(_conn) do
    %Ueberauth.Auth.Extra{raw_info: %{}}
  end

  @impl Ueberauth.Strategy
  def handle_cleanup!(conn) do
    conn
  end
end
