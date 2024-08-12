defmodule Screenplay.PaMessages do
  @moduledoc """
  Context module for functions dealing with `PaMessage`s
  """

  # Use sparingly!
  import Ecto.Query

  alias Screenplay.Alerts.Cache, as: AlertsCache
  alias Screenplay.Config.RoutesToSigns
  alias Screenplay.PaMessages.PaMessage
  alias Screenplay.Repo

  defmodule ListParams do
    @moduledoc false
    use Ecto.Schema

    import Ecto.Changeset

    @type t :: %{
            optional(:state) => :all | :active | :future | :past,
            optional(:now) => DateTime.t(),
            optional(:signs) => [String.t(), ...],
            optional(:routes) => [String.t(), ...]
          }

    @primary_key false

    embedded_schema do
      field :state, Ecto.Enum, values: [:all, :active, :future, :past], default: :all
      field :now, :utc_datetime, autogenerate: {DateTime, :utc_now, []}
      field :signs, {:array, :string}
      field :routes, {:array, :string}
    end

    def parse(attrs) do
      changeset =
        %ListParams{}
        |> cast(attrs, [:state, :now, :signs, :routes])
        |> validate_length(:signs, min: 1, message: "must include at least one sign")
        |> validate_length(:routes, min: 1, message: "must include at least one route")

      case apply_action(changeset, :insert) do
        {:ok, opts} -> {:ok, Map.drop(opts, [:__struct__, :__meta__])}
        err -> err
      end
    end
  end

  @doc """
  Lists PA Messages limited to the options passed
  """
  @spec list_pa_messages(ListParams.t()) :: [PaMessage.t()]
  def list_pa_messages(opts \\ %{}) do
    opts =
      opts
      |> Map.put_new_lazy(:now, &DateTime.utc_now/0)
      |> Map.put_new(:state, :all)

    alert_ids = AlertsCache.alert_ids()

    signs_for_routes = RoutesToSigns.signs_for_routes(opts[:routes])

    now = opts[:now] || DateTime.utc_now()

    PaMessage
    |> PaMessage.Queries.state(opts[:state], alert_ids, now)
    |> PaMessage.Queries.signs(opts[:signs])
    |> PaMessage.Queries.signs(signs_for_routes)
    |> order_by(desc: :inserted_at)
    |> Repo.all()
  end

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

  @doc """
  Creates a new PA Message.
  """
  @spec create_message(message :: map()) ::
          {:ok, PaMessage.t()} | {:error, Ecto.Changeset.t()}
  def create_message(message) do
    %PaMessage{} |> PaMessage.changeset(message) |> Repo.insert()
  end
end
