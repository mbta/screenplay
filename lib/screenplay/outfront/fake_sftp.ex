defmodule Screenplay.Outfront.FakeSFTP do
  @moduledoc """
  This module has the same interface as Screenplay.Outfront.SFTP, but rather than actually
  modifying files on Outfront's SFTP server, it logs the action which it would take if it
  were connected. We'll use this on dev, since there's no dev version of that server.
  """

  require Logger

  def set_takeover_image(stations, _portrait_png, _landscape_png) do
    _ = Logger.info("Setting images for #{stations}")

    :ok
  end

  def clear_images(stations) do
    _ = Logger.info("Clearing images for #{stations}")

    :ok
  end
end
