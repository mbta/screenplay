defmodule Screenplay.OutfrontTakeoverTool.Alerts.S3Fetch do
  @moduledoc false

  @spec get_state() :: binary()
  def get_state do
    %{body: body, status_code: 200} = ExAws.S3.get_object(bucket(), path()) |> ExAws.request!()
    body
  end

  @spec put_state(binary()) :: :ok
  def put_state(state) do
    %{status_code: 200} = ExAws.S3.put_object(bucket(), path(), state) |> ExAws.request!()
    :ok
  end

  defp bucket, do: Application.get_env(:screenplay, :alerts_s3_bucket)
  defp path, do: Application.get_env(:screenplay, :alerts_s3_path)
end
