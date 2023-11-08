defmodule Screenplay.Config.PermanentConfig do
  @moduledoc false
  alias Screenplay.Config.S3Fetch

  @spec add_new_screen(binary(), map(), binary()) :: :error | :ok
  def add_new_screen(screen_id, screen, etag) do
    case get_current_config(etag) do
      {:ok, config} ->
        config
        |> Map.put(screen_id, Jason.decode!(screen))
        |> S3Fetch.put_screens_config()

      _ ->
        :error
    end
  end

  def edit_screen do
  end

  @spec delete_screen(binary(), binary()) :: :error | :ok
  def delete_screen(screen_id, etag) do
    case get_current_config(etag) do
      {:ok, config} ->
        config
        |> Map.delete(screen_id)
        |> S3Fetch.put_screens_config()

      _ ->
        :error
    end
  end

  defp get_current_config(etag) do
    case S3Fetch.get_screens_config() do
      {:ok, config, current_etag} ->
        if etag == current_etag,
          do: {:ok, config},
          else: :error

      _ ->
        :error
    end
  end
end
