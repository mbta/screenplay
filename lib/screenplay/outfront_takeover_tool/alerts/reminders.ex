defmodule Screenplay.OutfrontTakeoverTool.Alerts.Reminders do
  @moduledoc """
  Runs every minute and sends slack reminders to @pios in #ctd-pio-livepa if outdated alerts are still active.
  """
  require Logger
  use GenServer

  alias Screenplay.OutfrontTakeoverTool.Alerts.{Alert, State}

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, %{})
  end

  def init(state) do
    schedule_work()
    {:ok, state}
  end

  def handle_info(:work, state) do
    url = Application.get_env(:screenplay, :slack_webhook_url, "")

    schedule_work()

    if url == "" do
      Logger.info("No Slack Webhook URL found")
    else
      case State.get_outdated_alerts() do
        [] ->
          Logger.debug("No outdated alerts found")

        alerts ->
          send_reminders_for_alerts(alerts, url)
      end
    end

    {:noreply, state}
  end

  defp send_reminders_for_alerts(alerts, url) do
    Enum.each(alerts, fn %Alert{stations: stations} ->
      stations
      |> format_slack_message()
      |> send_slack_message(url)
    end)
  end

  defp format_slack_message(stations) do
    group_id = Application.get_env(:screenplay, :pio_slack_group_id)

    %{
      blocks: [
        %{
          type: "section",
          text: %{
            type: "mrkdwn",
            text:
              "#{if group_id !== "", do: "<!subteam^#{group_id}> ", else: ""}Reminder that the Emergency Takeover at #{Enum.join(stations, ", ")} is still active."
          }
        },
        %{
          type: "section",
          text: %{
            type: "mrkdwn",
            text: "Please review this Alert: #{ScreenplayWeb.Endpoint.url()}"
          }
        }
      ]
    }
  end

  defp send_slack_message(message, url) do
    {:ok, json} = Jason.encode(message)

    case HTTPoison.post(url, json) do
      {:ok, response} ->
        Logger.debug(fn ->
          "HTTP RESP:\n#{inspect(response)}"
        end)

      {:error, error} ->
        Logger.error(fn ->
          "Failed to send Slack message, error: '#{error}'"
        end)
    end
  end

  defp schedule_work do
    # runs every minute
    Process.send_after(self(), :work, 60 * 1000)
  end
end
