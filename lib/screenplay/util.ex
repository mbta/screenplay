defmodule Screenplay.Util do
  @moduledoc """
  Utility functions
  """
  require Logger

  @spec trim_username(String.t()) :: String.t()
  def trim_username(nil), do: nil

  def trim_username(username) do
    username
    |> String.replace("ActiveDirectory_MBTA\\", "")
  end

  @doc """
  Determines the MBTA service date for a given moment. The "service day" starts/ends at 4:00am.
  """
  @spec service_date() :: Date.t()
  @spec service_date(DateTime.t()) :: Date.t()
  def service_date(datetime \\ DateTime.utc_now()) do
    datetime
    |> DateTime.shift_zone!("America/New_York")
    |> case do
      %DateTime{hour: hour} = dt when hour < 4 -> Date.add(dt, -1)
      dt -> DateTime.to_date(dt)
    end
  end

  @spec format_changeset_errors(changeset :: Ecto.Changeset.t()) :: String.t()
  def format_changeset_errors(changeset) do
    changeset
    |> Ecto.Changeset.traverse_errors(fn {msg, _} -> msg end)
    |> Enum.map_join(", ", fn {field, msg} -> "#{field}: #{msg}" end)
  end

  @doc """
  Log structured data. All passed values must implement the Jason.Encoder protocol
  """
  @spec log(String.t(), keyword()) :: :ok
  def log(event, extras) do
    ([event: event] ++ extras)
    |> Enum.map_join(" ", fn {k, v} -> "#{k}=#{Jason.encode!(v)}" end)
    |> Logger.info()
  end

  # Default values taken from Polly PCM
  @spec convert_pcm_to_wav(binary()) :: binary()
  def convert_pcm_to_wav(
        pcm_data,
        sample_rate \\ 16_000,
        bits_per_sample \\ 16,
        num_channels \\ 1,
        audio_format \\ 1
      ) do
    data_size = byte_size(pcm_data)
    total_data_size = 36 + data_size
    byte_rate = sample_rate * num_channels * div(bits_per_sample, 8)
    block_align = num_channels * div(bits_per_sample, 8)
    chunk_size = 16

    wav_header =
      <<
        "RIFF",
        total_data_size::little-32,
        "WAVE",
        "fmt ",
        chunk_size::little-32,
        audio_format::little-16,
        num_channels::little-16,
        sample_rate::little-32,
        byte_rate::little-32,
        block_align::little-16,
        bits_per_sample::little-16,
        "data",
        data_size::little-32
      >>

    wav_header <> pcm_data
  end
end
