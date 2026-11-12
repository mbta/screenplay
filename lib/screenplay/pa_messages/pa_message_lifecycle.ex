defmodule Screenplay.PaMessages.PaMessageLifecycle do
  @moduledoc """
  Manages the lifecycle of PA Messages as a result of alert changes.
  """
  use GenServer

  require Logger

  alias Screenplay.Alerts.Alert
  alias Screenplay.PaMessages.PaMessage

  @alerts_cache_mod Application.compile_env(
                      :screenplay,
                      :alerts_cache_mod,
                      Screenplay.Alerts.Cache
                    )
  @pa_messages_mod Application.compile_env(
                     :screenplay,
                     :pa_messages_mod,
                     Screenplay.PaMessages
                   )

  @default_opts [
    now_fn: &DateTime.utc_now/0,
    update_interval_ms: 5_000
  ]

  @type state :: %{
          now_fn: (-> DateTime.t()),
          update_interval_ms: non_neg_integer()
        }

  def start_link(opts) do
    opts = Keyword.merge(@default_opts, opts)
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl GenServer
  def init(opts) do
    now_fn = Keyword.get(opts, :now_fn)
    update_interval_ms = Keyword.get(opts, :update_interval_ms)

    schedule_update(update_interval_ms)

    {:ok, %{now_fn: now_fn, update_interval_ms: update_interval_ms}}
  end

  @impl GenServer
  def handle_info(:update, state = %{now_fn: now_fn, update_interval_ms: update_interval_ms}) do
    schedule_update(update_interval_ms)

    end_pa_messages_with_changed_alerts(now_fn)

    {:noreply, state}
  end

  @spec end_pa_messages_with_changed_alerts((-> DateTime.t())) :: :ok
  defp end_pa_messages_with_changed_alerts(now_fn) do
    alerts = Map.new(@alerts_cache_mod.alerts(), &{&1.id, &1})
    now = now_fn.()

    @pa_messages_mod.list_pa_messages_with_alerts(%{now: now})
    |> Enum.reject(&(alerts |> Map.get(&1.alert_id) |> alert_same_for_pa_message?(&1)))
    |> Enum.each(&close_pa_message(&1, now))
  end

  @spec alert_same_for_pa_message?(Alert.t(), PaMessage.t()) :: boolean()
  defp alert_same_for_pa_message?(%Alert{effect: effect} = alert, msg) when not is_nil(effect) do
    msg.alert_service_effect == effect and Enum.sort(msg.alert_modes) == Alert.route_types(alert)
  end

  defp alert_same_for_pa_message?(_, _), do: true

  @spec close_pa_message(PaMessage.t(), DateTime.t()) :: :ok
  defp close_pa_message(pa_message, now) do
    case @pa_messages_mod.update_message(pa_message, %{end_datetime: now}) do
      {:ok, changed_message} ->
        Logger.info(
          "auto_closed_pa_message: pa_message_id=#{changed_message.id} was closed due to a change in its associated alert_id=#{changed_message.alert_id}."
        )

      {:error, errors} ->
        Logger.error(
          "auto_closed_pa_message_failure: pa_message_id=#{pa_message.id}'s associated alert_id=#{pa_message.alert_id} changed, but the PA Message failed to close."
        )

        Logger.error(
          "auto_closed_pa_message_failure_details: pa_message_id=#{pa_message.id} failed to close due errors: #{errors}."
        )
    end
  end

  @spec schedule_update(non_neg_integer()) :: reference
  defp schedule_update(ms) do
    Process.send_after(self(), :update, ms)
  end
end
