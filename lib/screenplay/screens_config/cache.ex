defmodule Screenplay.ScreensConfig.Cache do
  @moduledoc """
  Cache of the Screens app config
  """

  use Nebulex.Cache,
    otp_app: :screenplay,
    adapter: Nebulex.Adapters.Local

  @type key :: screen_id :: String.t()
  @type value :: config :: ScreensConfig.Screen.t()
end
