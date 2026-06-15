defmodule Screenplay.EmergencyTakeoverTool.ScreensConfig do
  @moduledoc """
  Module responsible for building the EmergencyTakeover struct used in Screens configurations
  of active Emergency Takeover Alerts.
  """

  alias Screenplay.EmergencyTakeoverTool.CannedMessages
  alias Screenplay.EmergencyTakeoverTool.EmergencyTakeover, as: EmergencyTakeoverContext
  alias ScreensConfig.{EmergencyMessagingLocation, EmergencyTakeover, Screen}

  @spec build_emergency_takeover(
          EmergencyTakeoverContext.message(),
          String.t(),
          Screen.app_id(),
          EmergencyMessagingLocation.t()
        ) :: EmergencyTakeover.t()
  def build_emergency_takeover(message, alert_id, app_id, eml) do
    %EmergencyTakeover{
      audio_asset_path: audio_path(message, eml),
      text_for_audio: text_for_audio(message, eml),
      visual_asset_path: img_path(message, alert_id, app_id, eml)
    }
  end

  @spec text_for_audio(EmergencyTakeoverContext.message(), EmergencyMessagingLocation.t()) ::
          String.t() | nil
  defp text_for_audio(%{type: :canned}, _eml), do: nil
  defp text_for_audio(%{type: :custom, text: %{indoor: text}}, :inside), do: text
  defp text_for_audio(%{type: :custom, text: %{outdoor: text}}, :outside), do: text

  @spec img_path(
          EmergencyTakeoverContext.message(),
          String.t(),
          Screen.app_id(),
          EmergencyMessagingLocation.t()
        ) ::
          String.t() | nil
  def img_path(message, alert_id, screen_type, messaging_location) do
    case message do
      %{type: :canned, id: id} ->
        case CannedMessages.get(id) do
          %{images: images} ->
            where = messaging_location_to_text(messaging_location)
            orientation = screen_orientation(screen_type)
            canned_image_path(images, where, orientation)

          _ ->
            nil
        end

      %{type: :custom} ->
        custom_image_path(alert_id, screen_type, messaging_location)

      _ ->
        nil
    end
  end

  @spec canned_image_path(map(), :indoor | :outdoor, :landscape | :portrait) :: String.t() | nil
  defp canned_image_path(images, where, orientation) when is_map(images) do
    alerts_fetch_module = Application.get_env(:screenplay, :alerts_fetch_module)

    image_path =
      case get_in(images, [where, orientation]) do
        path when is_binary(path) -> path
      end

    alerts_fetch_module.with_asset_path("canned/images/#{image_path}")
  end

  @spec custom_image_path(String.t(), Screen.app_id(), EmergencyMessagingLocation.t()) ::
          String.t()
  defp custom_image_path(alert_id, screen_type, messaging_location) do
    alerts_fetch_module = Application.get_env(:screenplay, :alerts_fetch_module)

    image_key = determine_image_key(screen_type, messaging_location)
    alerts_fetch_module.with_asset_path("#{alert_id}/#{image_key}.png")
  end

  @spec determine_image_key(Screen.app_id(), EmergencyMessagingLocation.t()) :: String.t()
  defp determine_image_key(screen_type, messaging_location) do
    key_prefix = messaging_location_to_text(messaging_location) |> Atom.to_string()
    key_suffix = screen_orientation(screen_type) |> Atom.to_string()

    "#{key_prefix}_#{key_suffix}"
  end

  @spec audio_path(EmergencyTakeoverContext.message(), EmergencyMessagingLocation.t()) ::
          String.t() | nil
  def audio_path(%{type: :canned, id: id}, messaging_location) do
    # Only include audio assets for canned messages
    case CannedMessages.get(id) do
      %{audio_path: %{indoor: indoor_path, outdoor: outdoor_path}} ->
        case messaging_location do
          :inside -> canned_audio_path(indoor_path)
          :outside -> canned_audio_path(outdoor_path)
          _ -> nil
        end

      _ ->
        nil
    end
  end

  def audio_path(_message, _messaging_location), do: nil

  defp canned_audio_path(audio_path_suffix) do
    alerts_fetch_module = Application.get_env(:screenplay, :alerts_fetch_module)
    alerts_fetch_module.with_asset_path("canned/audio/#{audio_path_suffix}")
  end

  defp messaging_location_to_text(:inside), do: :indoor
  defp messaging_location_to_text(:outside), do: :outdoor

  defp screen_orientation(screen_type) when screen_type in [:busway_v2, :pre_fare_v2],
    do: :portrait

  defp screen_orientation(screen_type) when screen_type in [:dup_v2], do: :landscape
end
