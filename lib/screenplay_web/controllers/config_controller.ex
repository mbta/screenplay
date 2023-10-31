defmodule ScreenplayWeb.ConfigController do
  use ScreenplayWeb, :controller

  alias Screenplay.Config.Config

  def add(conn, _params) do
    Config.add_new_screen()
    conn
  end

  def edit(conn, _params) do
    Config.edit_screen()
    conn
  end

  def delete(conn, _params) do
    Config.delete_screen()
    conn
  end
end
