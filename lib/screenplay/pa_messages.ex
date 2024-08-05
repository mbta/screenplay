defmodule Screenplay.PaMessages do
  @moduledoc """
  Context module for functions dealing with `PaMessage`s
  """

  alias Screenplay.Alerts.Cache, as: AlertsCache
  alias Screenplay.PaMessages.PaMessage
  alias Screenplay.Repo

  @doc """
  Returns a list of the currently active PA Messages.
  """
  @spec get_active_messages() :: [PaMessage.t()]
  @spec get_active_messages(now :: DateTime.t()) :: [PaMessage.t()]
  def get_active_messages(now \\ DateTime.utc_now()) do
    AlertsCache.alert_ids()
    |> PaMessage.Queries.active(now)
    |> Repo.all()
  end
end
