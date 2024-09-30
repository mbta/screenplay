defmodule ScreenplayWeb.ConfigController do
  alias ScreensConfig.PendingConfig
  use ScreenplayWeb, :controller

  require Logger

  alias Screenplay.PendingScreensConfig.Fetch, as: PendingScreensConfig
  alias Screenplay.PermanentConfig
  alias Screenplay.ScreensConfig, as: ScreensConfigStore
  alias ScreensConfig.Screen
  alias ScreensConfig.V2.GlEink

  plug :check_pending_screens_version when action == :publish

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
        {:ok, config, metadata} ->
          %PendingConfig{screens: pending_screens} =
            config
            |> Jason.decode!()
            |> PendingConfig.from_json()

          {pending_screens, metadata.version_id}

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
          ScreensConfigStore.screens()
          |> Enum.filter(filter_fn)
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
  Responds with a map whose top-level keys are `:places_and_screens`, `:version_id`, and `:last_modified_ms`.
  The response will also contain an `etag` header.

  The `:places_and_screens` map's keys are unique pairs of place ID+app ID (as strings, for JSON compatibility),
  and values are maps containing the live and pending screens at that place / with that app ID,
  plus the place ID and app ID as separate values for ease of use on the frontend.

  Each entry in the `:places_and_screens` map corresponds to one accordion in the Pending page UI.

  See spec for `PermanentConfig.get_existing_screens_at_places_with_pending_screens/0` for more detail.
  """
  def existing_screens_at_places_with_pending_screens(conn, _params) do
    data = PermanentConfig.get_existing_screens_at_places_with_pending_screens()
    {etag, data} = Map.pop!(data, :etag)

    conn
    |> put_resp_header("etag", etag)
    |> json(data)
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
      _ -> send_resp(conn, 500, "Could not publish screens. Please contact an engineer.")
    end
  end

  # To be used as a plug on actions that modify pending screens config.
  defp check_pending_screens_version(conn, _opts) do
    case get_req_header(conn, "if-match") do
      [] ->
        conn
        |> send_resp(428, "Missing if-match header")
        |> halt()

      matches ->
        {:ok, _, metadata} = PendingScreensConfig.fetch_config()

        if metadata.etag in matches do
          conn
        else
          conn
          |> send_resp(412, "Pending screens config version mismatch")
          |> halt()
        end
    end
  end

  defp place_id_has_screen?(place_id, :gl_eink_v2, %Screen{
         app_params: %GlEink{footer: %{stop_id: stop_id}}
       }),
       do: place_id === stop_id

  defp place_id_has_screen?(place_id, app_id, _),
    do:
      raise("place_id_has_screen/2 not implemented for app_id: #{app_id}, place_id: #{place_id}")
end
