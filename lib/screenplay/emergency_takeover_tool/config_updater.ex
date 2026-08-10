defmodule Screenplay.EmergencyTakeoverTool.ConfigUpdater do
  @moduledoc """
  Module responsible for building the EmergencyTakeover struct used in Screens configurations
  of active Emergency Takeover Alerts.
  """
  require Logger

  alias Screenplay.EmergencyTakeoverTool.CannedMessages
  alias Screenplay.EmergencyTakeoverTool.EmergencyTakeover, as: EmergencyTakeoverContext
  alias Screenplay.ScreensConfig.Fetch, as: PublishedScreensFetch
  alias ScreensConfig.{Config, EmergencyMessagingLocation, EmergencyTakeover, Screen}

  @image_store Application.compile_env!(:screenplay, :image_store_module)

  def add_emergency_takeover_configs(alert_id, showtime_screen_ids, message) do
    with {published_config, _published_version_id} <- get_current_published_config(),
         {:ok, published_config_deserialized} <- JSON.decode(published_config) do
      %Config{screens: published_screens, devops: devops} =
        published_config_deserialized |> Config.from_json()

      updated_screens =
        update_screens_with_emergency_takeover(
          published_screens,
          showtime_screen_ids,
          alert_id,
          message
        )

      %Config{screens: updated_screens, devops: devops}
      |> publish_new_config()
    else
      _error ->
        {:error, "Could not fetch published screens config"}
    end
  end

  defp update_screens_with_emergency_takeover(screens, screen_ids, alert_id, message) do
    for {id, screen} <- screens,
        into: %{} do
      if id in screen_ids do
        case screen do
          %Screen{app_params: %{emergency_messaging_location: eml}} when not is_nil(eml) ->
            emergency_takeover = build_emergency_takeover(message, alert_id, screen.app_id, eml)

            {id,
             put_in(
               screen,
               [Access.key!(:app_params), Access.key!(:emergency_takeover)],
               emergency_takeover
             )}

          _ ->
            Logger.error("Tried to takeover #{id} without an emergency_messaging_location")

            {id, screen}
        end
      else
        {id, screen}
      end
    end
  end

  def clear_emergency_takeover_configs(showtime_screen_ids) do
    with {published_config, _published_version_id} <- get_current_published_config(),
         {:ok, published_config_deserialized} <- JSON.decode(published_config) do
      %Config{screens: published_screens, devops: devops} =
        published_config_deserialized |> Config.from_json()

      updated_screens = clear_screens_emergency_takeover(published_screens, showtime_screen_ids)

      %Config{screens: updated_screens, devops: devops}
      |> publish_new_config()
    else
      _error ->
        {:error, "Could not fetch published screens config"}
    end
  end

  defp clear_screens_emergency_takeover(screens, screen_ids) do
    for {id, screen} <- screens, into: %{} do
      if id in screen_ids do
        {id, put_in(screen, [Access.key!(:app_params), Access.key!(:emergency_takeover)], nil)}
      else
        {id, screen}
      end
    end
  end

  defp get_current_published_config do
    case PublishedScreensFetch.fetch_config() do
      {:ok, config, version_id} -> {config, version_id}
      error -> error
    end
  end

  def publish_new_config(new_config) do
    with(:ok <- PublishedScreensFetch.put_config(new_config)) do
      PublishedScreensFetch.commit()
    end
  end

  @spec build_emergency_takeover(
          EmergencyTakeoverContext.message(),
          String.t(),
          Screen.app_id(),
          EmergencyMessagingLocation.t()
        ) :: EmergencyTakeover.t()
  defp build_emergency_takeover(message, alert_id, app_id, eml) do
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
    image_path =
      case get_in(images, [where, orientation]) do
        path when is_binary(path) -> path
      end

    @image_store.with_asset_path("canned/images/#{image_path}")
  end

  @spec custom_image_path(String.t(), Screen.app_id(), EmergencyMessagingLocation.t()) ::
          String.t()
  defp custom_image_path(alert_id, screen_type, messaging_location) do
    image_key = determine_image_key(screen_type, messaging_location)
    @image_store.with_asset_path("#{alert_id}/#{image_key}.png")
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
    @image_store.with_asset_path("canned/audio/#{audio_path_suffix}")
  end

  defp messaging_location_to_text(:inside), do: :indoor
  defp messaging_location_to_text(:outside), do: :outdoor

  defp screen_orientation(screen_type) when screen_type in [:busway_v2, :pre_fare_v2],
    do: :portrait

  defp screen_orientation(screen_type) when screen_type in [:dup_v2], do: :landscape
end
