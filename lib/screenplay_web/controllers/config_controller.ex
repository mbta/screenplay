defmodule ScreenplayWeb.ConfigController do
  use ScreenplayWeb, :controller

  alias Screenplay.Config.PermanentConfig
  alias Screenplay.PendingScreensConfig.Cache, as: PendingScreensConfigCache
  alias Screenplay.ScreensConfig.Cache, as: ScreensConfigCache
  alias ScreensConfig.Screen
  alias ScreensConfig.V2.GlEink

  def index(conn, _params) do
    render(conn, "index.html")
  end

  def add(conn, %{"screen_id" => screen_id, "screen" => screen, "etag" => etag}) do
    case PermanentConfig.add_new_screen(screen_id, screen, etag) do
      :ok ->
        send_resp(conn, 200, "OK")

      {:error, :etag_mismatch} ->
        send_resp(conn, 400, "Config version mismatch")

      {:error, :config_not_fetched} ->
        send_resp(conn, 400, "S3 Operation Failed: Get")

      {:error, :config_not_written} ->
        send_resp(conn, 400, "S3 Operation Failed: Put")
    end
  end

  def delete(conn, %{"screen_id" => screen_id, "etag" => etag}) do
    case PermanentConfig.delete_screen(screen_id, etag) do
      :ok ->
        send_resp(conn, 200, "OK")

      {:error, :etag_mismatch} ->
        send_resp(conn, 400, "Config version mismatch")

      {:error, :config_not_fetched} ->
        send_resp(conn, 400, "S3 Operation Failed: Get")

      {:error, :config_not_written} ->
        send_resp(conn, 400, "S3 Operation Failed: Put")
    end
  end

  def existing_screens(conn, %{"place_ids" => place_ids, "app_id" => app_id}) do
    app_id_atom = String.to_existing_atom(app_id)

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

        live_screens = ScreensConfigCache.screens(filter_fn)
        # TODO: Not sure why I didn't raise this earlier but should we even cache
        # the pending screens config at all?
        #
        # We could avoid any loading delay when going from "Configure Pending Screens" to "Review Pending Screens"
        # if this function always reads directly from the file in S3.
        #
        # For reference, Screens does not cache the pending config at all, every
        # request to /v2/screen/pending/:id/simulation causes Screens to read the S3 file.
        # This is fine because we expect the pending config file to stay small and be accessed
        # very infrequently compared to the main config.
        #
        # The same approach should work here in Screenplay.
        pending_screens = PendingScreensConfigCache.screens(filter_fn)

        {place_id, %{live_screens: live_screens, pending_screens: pending_screens}}
      end)
      |> Enum.into(%{})

    json(conn, %{
      places_and_screens: places_and_screens,
      etag: PendingScreensConfigCache.table_version()
    })
  end

  def existing_screens_at_places_with_pending_screens(conn, _params) do
    places_and_screens =
      PendingScreensConfigCache.pending_screens()
      |> Enum.group_by(fn {id, screen} -> screen_to_place_id(screen) end)
      |> Map.new(fn {place_id, pending_screens_at_place} ->
        live_screens_at_place =
          ScreensConfigCache.screens(fn {_, screen} -> screen_to_place_id(screen) == place_id end)

        live_and_pending = %{
          live_screens: live_screens_at_place,
          pending_screens: Map.new(pending_screens_at_place)
        }

        {place_id, live_and_pending}
      end)

    json(conn, places_and_screens)
  end

  defp place_id_has_screen?(place_id, :gl_eink_v2, %Screen{
         app_params: %GlEink{footer: %{stop_id: stop_id}}
       }),
       do: place_id === stop_id

  defp place_id_has_screen?(place_id, app_id, _),
    do:
      raise("place_id_has_screen/2 not implemented for app_id: #{app_id}, place_id: #{place_id}")

  # TODO: This is yucky but maybe ok?
  # Need a function that can take an arbitrary screen config and find the place it's associated with.
  # Finding this via the places_and_screens config would be expensive if we need t do it for a bunch of screen configs
  defp screen_to_place_id(%Screen{app_params: %GlEink{footer: %{stop_id: stop_id}}}),
    do: stop_id

  defp screen_to_place_id(%Screen{app_id: app_id}),
    do: raise("screen_to_place_id/1 not implemented for app_id: #{app_id}")
end
