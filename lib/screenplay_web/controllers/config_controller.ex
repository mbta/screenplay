defmodule ScreenplayWeb.ConfigController do
  use ScreenplayWeb, :controller

  alias Screenplay.Config.PermanentConfig

  def add(conn, _params) do
    PermanentConfig.add_new_screen()
    conn
  end

  def edit(conn, _params) do
    PermanentConfig.edit_screen()
    conn
  end

  def delete(conn, _params) do
    PermanentConfig.delete_screen()
    conn
  end
end
