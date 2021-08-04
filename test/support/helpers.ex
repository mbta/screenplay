defmodule Test.Support.Helpers do
  @moduledoc "Test helpers"

  import ExUnit.Callbacks

  defmacro reassign_env(app, var, value) do
    quote do
      old_value = Application.get_env(unquote(app), unquote(var))
      Application.put_env(unquote(app), unquote(var), unquote(value))

      on_exit(fn ->
        if old_value == nil do
          Application.delete_env(unquote(app), unquote(var))
        else
          Application.put_env(unquote(app), unquote(var), old_value)
        end
      end)
    end
  end

  def reassign_log_level(level) do
    old_level = Logger.level()

    on_exit(fn ->
      Logger.configure(level: old_level)
    end)

    Logger.configure(level: level)
  end
end
