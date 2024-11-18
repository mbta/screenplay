defmodule Screenplay.Jobs.Reminders do
  @moduledoc """
  Runs every minute and sends slack reminders to @oios in #tid-oio if outdated alerts are still active.
  """
  use Oban.Worker, unique: true

  require Logger

  alias Screenplay.OutfrontTakeoverTool.Alerts.{Alert, State}

  @impl Oban.Worker
  def perform(_) do
    case Application.get_env(:screenplay, :slack_webhook_url) do
      v when v in [nil, ""] -> Logger.info("No Slack Webhook URL found")
      url -> send_slack_messages_for_outdated_alerts(url)
    end

    :ok
  end

  defp send_slack_messages_for_outdated_alerts(url) do
    case State.get_outdated_alerts() do
      [] ->
        Logger.debug("No outdated alerts found")

      alerts ->
        Enum.each(alerts, fn %Alert{stations: stations} ->
          stations
          |> format_slack_message()
          |> send_slack_message(url)
        end)
    end
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
            text: "Please review this alert: #{ScreenplayWeb.Endpoint.url()}/emergency-takeover"
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
end
