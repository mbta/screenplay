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
        send_resp(conn, 400, "Config version mismatch")

      {:error, :config_not_fetched} ->
        send_resp(conn, 400, "S3 Operation Failed: Get")

      {:error, :config_not_written} ->
        send_resp(conn, 400, "S3 Operation Failed: Put")
    end
  end

  def existing_screens(conn, %{"place_ids" => place_ids, "app_id" => app_id}) do
    app_id_atom = String.to_existing_atom(app_id)

    {pending_screens_config, version_id} =
      case PendingScreensConfig.fetch_config() do
        {:ok, config, version_id} ->
          %PendingConfig{screens: pending_screens} =
            config
            |> Jason.decode!()
            |> PendingConfig.from_json()

          {pending_screens, version_id}

        _ ->
          Logger.error("Could not fetch pending screens config in existing_screens/2")
          []
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
          |> Enum.filter(&filter_fn.(&1))
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

  defp place_id_has_screen?(place_id, :gl_eink_v2, %Screen{
         app_params: %GlEink{footer: %{stop_id: stop_id}}
       }),
       do: place_id === stop_id

  defp place_id_has_screen?(place_id, app_id, _),
    do:
      raise("place_id_has_screen/2 not implemented for app_id: #{app_id}, place_id: #{place_id}")
end
