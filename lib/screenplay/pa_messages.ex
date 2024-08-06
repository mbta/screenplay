defmodule Screenplay.PaMessages do
  @moduledoc """
  Context module for functions dealing with `PaMessage`s
  """

  # Use sparingly!
  import Ecto.Query

  alias Screenplay.Alerts.Cache, as: AlertsCache
  alias Screenplay.PaMessages.PaMessage
  alias Screenplay.Repo

  @doc """
  Returns a list of ALL PA Messages ordered by their inserted_at timestamps
  descending.
  """
  @spec get_all_messages() :: [PaMessage.t()]
  def get_all_messages do
    PaMessage
    |> order_by(desc: :inserted_at)
    |> Repo.all()
  end

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
