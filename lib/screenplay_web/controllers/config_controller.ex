defmodule ScreenplayWeb.ConfigController do
  alias ScreensConfig.PendingConfig
  use ScreenplayWeb, :controller

  require Logger

  alias Screenplay.Config.PermanentConfig
  alias Screenplay.PendingScreensConfig.Fetch, as: PendingScreensConfig
  alias Screenplay.ScreensConfig.Cache, as: ScreensConfigCache
  alias ScreensConfig.Screen
  alias ScreensConfig.V2.GlEink

  def index(conn, _params) do
    render(conn, "index.html")
  end

  def put(conn, %{
        "places_and_screens" => places_and_screens,
        "screen_type" => screen_type,
        "version_id" => version_id
      }) do
    case PermanentConfig.put_pending_screens(
           places_and_screens,
           String.to_existing_atom(screen_type),
           version_id
         ) do
      :ok ->
        send_resp(conn, 200, "OK")

      {:error, :version_mismatch} ->
        json(%{conn | status: 400}, %{error: :version_mismatch})

      {:error, :config_not_fetched} ->
        send_resp(conn, 500, "S3 Operation Failed: Get")

      {:error, :config_not_written} ->
        send_resp(conn, 500, "S3 Operation Failed: Put")

      {:error, {:duplicate_screen_ids, duplicate_screen_ids}} ->
        json(%{conn | status: 400}, %{
          duplicate_screen_ids: duplicate_screen_ids,
          error: :duplicate_screen_ids
        })
    end
  end

  def existing_screens(conn, %{"place_ids" => place_ids, "app_id" => app_id}) do
    app_id_atom = String.to_existing_atom(app_id)

    {pending_screens_config, version_id} =
      case PendingScreensConfig.fetch_config() do
        {:ok, config, version_id, _last_modified} ->
          %PendingConfig{screens: pending_screens} =
            config
            |> Jason.decode!()
            |> PendingConfig.from_json()

          {pending_screens, version_id}

        _ ->
          raise("Could not fetch pending screens config in existing_screens/2")
      end

    places_and_screens =
      place_ids
      |> String.split(",")
      |> Enum.map(fn place_id ->
        filter_fn = fn
          {_, %Screen{app_id: ^app_id_atom} = config} ->
            place_id_has_screen?(place_id, app_id_atom, config)

          _ ->
            false
        end

        live_screens =
          ScreensConfigCache.screens(filter_fn)
          |> Enum.map(fn {k, v} -> {k, Screen.to_json(v)} end)
          |> Enum.into(%{})

        pending_screens =
          pending_screens_config
          |> Enum.filter(filter_fn)
          |> Enum.map(fn {k, v} -> {k, Screen.to_json(v)} end)
          |> Enum.into(%{})

        {place_id, %{live_screens: live_screens, pending_screens: pending_screens}}
      end)
      |> Enum.into(%{})

    json(conn, %{
      places_and_screens: places_and_screens,
      version_id: version_id
    })
  end

  @doc """
  Responds with a map whose top-level keys are `:places_and_screens` and `:version_id`.

  The `:places_and_screens` map's keys are unique pairs of place ID+app ID (as strings, for JSON compatibility),
  and values are maps containing the live and pending screens at that place / with that app ID,
  plus the place ID and app ID as separate values for ease of use on the frontend.

  Each entry in the `:places_and_screens` map corresponds to one accordion in the Pending page UI.

  See spec for `get_existing_screens_at_places_with_pending_screens/0` for more detail.
  """
  def existing_screens_at_places_with_pending_screens(conn, _params) do
    json(conn, get_existing_screens_at_places_with_pending_screens())
  end

  @spec get_existing_screens_at_places_with_pending_screens() :: %{
          places_and_screens: %{
            (place_id :: String.t()) => %{
              place_id: String.t(),
              app_id: atom(),
              live_screens: %{ScreensConfig.Config.screen_id() => Screen.t()},
              pending_screens: %{ScreensConfig.Config.screen_id() => Screen.t()}
            }
          },
          version_id: String.t()
        }
  defp get_existing_screens_at_places_with_pending_screens do
    {pending_screens_config, version_id, last_modified} =
      case PendingScreensConfig.fetch_config() do
        {:ok, config, version_id, last_modified} ->
          %PendingConfig{screens: pending_screens} =
            config
            |> Jason.decode!()
            |> PendingConfig.from_json()

          {pending_screens, version_id, last_modified}

        _ ->
          raise(
            "Could not fetch pending screens config in existing_screens_at_places_with_pending_screens/2"
          )
      end

    existing =
      pending_screens_config
      |> Enum.group_by(fn {_, screen} -> {screen_to_place_id(screen), screen.app_id} end)
      |> Map.new(fn {{place_id, app_id}, pending_screens_at_place} ->
        filter_fn = fn {_, screen} ->
          screen.app_id == app_id and screen_to_place_id(screen) == place_id
        end

        live_screens_of_same_type_at_place =
          for {id, screen} <- ScreensConfigCache.screens(filter_fn),
              into: %{},
              do: {id, Screen.to_json(screen)}

        pending_screens_at_place =
          for {id, screen} <- pending_screens_at_place,
              into: %{},
              do: {id, Screen.to_json(screen)}

        live_and_pending = %{
          live_screens: live_screens_of_same_type_at_place,
          pending_screens: pending_screens_at_place,
          place_id: place_id,
          app_id: app_id
        }

        json_key = "#{place_id}/#{app_id}"

        {json_key, live_and_pending}
      end)

    DateTime.to_unix(last_modified) |> IO.inspect(label: "last modified as unix timestamp")

    %{
      places_and_screens: existing,
      version_id: version_id,
      last_modified_ms: last_modified && DateTime.to_unix(last_modified, :millisecond)
    }
  end

  def publish(conn, %{
        "place_id" => place_id,
        "app_id" => app_id,
        "hidden_from_screenplay_ids" => hidden_from_screenplay_ids
      }) do
    app_id_atom = String.to_existing_atom(app_id)

    case PermanentConfig.publish_pending_screens(
           place_id,
           app_id_atom,
           hidden_from_screenplay_ids
         ) do
      :ok -> send_resp(conn, 200, "OK")
      _ -> send_resp(conn, 500, "Could not publish screens")
    end
  end

  defp place_id_has_screen?(place_id, :gl_eink_v2, %Screen{
         app_params: %GlEink{footer: %{stop_id: stop_id}}
       }),
       do: place_id === stop_id

  defp place_id_has_screen?(place_id, app_id, _),
    do:
      raise("place_id_has_screen/2 not implemented for app_id: #{app_id}, place_id: #{place_id}")

  defp screen_to_place_id(%Screen{app_id: :gl_eink_v2} = screen) do
    screen.app_params.footer.stop_id
  end

  defp screen_to_place_id(%Screen{app_id: :pre_fare_v2} = screen) do
    screen.app_params.header.stop_id
  end

  defp screen_to_place_id(%Screen{app_id: :bus_eink_v2} = screen) do
    screen.app_params.header.stop_id
  end

  defp screen_to_place_id(%Screen{app_id: :bus_shelter_v2} = screen) do
    screen.app_params.footer.stop_id
  end

  defp screen_to_place_id(%Screen{app_id: :dup_v2} = screen) do
    screen.app_params.alerts.stop_id
  end

  defp screen_to_place_id(%Screen{app_id: :gl_eink_single} = screen) do
    screen.app_params.stop_id
  end

  defp screen_to_place_id(%Screen{app_id: solari_v1_app})
       when solari_v1_app in [:solari, :solari_large] do
    # Solari screens frequently show info for multiple stop IDs in different sections.
    # (Try `jq '.screens | map_values(select(.app_id == "solari")) | map_values(.app_params.sections | map(.query.params.stop_ids))' git/screens/priv/local.json` in your shell to see)
    # So there isn't a straightforward implementation for that case, at the moment.
    raise("screen_to_place_id/1 not implemented for app_id: #{solari_v1_app}")
  end

  defp screen_to_place_id(%Screen{app_id: app_id}),
    do: raise("screen_to_place_id/1 not implemented for app_id: #{app_id}")
end
