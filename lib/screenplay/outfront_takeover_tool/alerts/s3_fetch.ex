defmodule Screenplay.OutfrontTakeoverTool.Alerts.S3Fetch do
  @moduledoc false

  require Logger

  alias Screenplay.OutfrontTakeoverTool.Alerts.State

  @spec get_state() :: {:ok, State.t()} | :error
  def get_state do
    with {:ok, body} <- do_get(),
         {:ok, json} <- Jason.decode(body) do
      {:ok, State.from_json(json)}
    else
      _ -> :error
    end
  end

  defp do_get do
    bucket = Application.get_env(:screenplay, :alerts_s3_bucket)
    path = Application.get_env(:screenplay, :alerts_s3_path)
    get_operation = ExAws.S3.get_object(bucket, path)

    case ExAws.request(get_operation) do
      {:ok, %{body: body, status_code: 200}} ->
        {:ok, body}

      e ->
        Logger.error(e)
        :error
    end
  end

  @spec put_state(State.t()) :: :ok | :error
  def put_state(state) do
    contents = state |> State.to_json() |> Jason.encode!(pretty: true)
    do_put(contents)
  end

  defp do_put(contents) do
    bucket = Application.get_env(:screenplay, :alerts_s3_bucket)
    path = Application.get_env(:screenplay, :alerts_s3_path)
    put_operation = ExAws.S3.put_object(bucket, path, contents)

    case ExAws.request(put_operation) do
      {:ok, %{status_code: 200}} -> :ok
      _ -> :error
    end
  end
end
