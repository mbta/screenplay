defmodule Screenplay.Alerts.ScreensByAlert do
  require Logger

  def get_screens_by_alert(alert_ids) do
    url = build_url(alert_ids)

    with {:http_request, {:ok, response}} <-
           {:http_request, HTTPoison.get(url)},
         {:response_success, %{status_code: 200, body: body}} <-
           {:response_success, response},
         {:parse, {:ok, parsed}} <- {:parse, Jason.decode(body)} do
      {:ok, parsed}
    else
      {:http_request, e} ->
        {:error, httpoison_error} = e
        log_api_error({:http_fetch_error, e}, message: Exception.message(httpoison_error))

      {:response_success, %{status_code: status_code, body: body}} = response ->
        _ = log_api_error({:bad_response_code, response}, status_code: status_code, body: body)

        :bad_response_code

      {:parse, {:error, e}} ->
        log_api_error({:parse_error, e})

      e ->
        log_api_error({:error, e})
    end
  end

  defp log_api_error(error = {error_type, _error_data}, extra_fields \\ []) do
    extra_fields
    |> Enum.map_join(" ", fn {label, value} -> "#{label}=\"#{value}\"" end)
    |> then(fn fields ->
      Logger.info("[screens_by_alert_error] error_type=#{error_type} " <> fields)
    end)

    error
  end

  defp build_url(alert_ids) do
    base_url = Application.get_env(:screenplay, :screens_url)
    "#{base_url}/api/screens_by_alert?ids=#{Enum.join(alert_ids, ",")}"
  end
end
