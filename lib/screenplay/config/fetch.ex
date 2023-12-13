defmodule Screenplay.Config.Fetch do
  @moduledoc false

  @callback get_config() :: {:ok, term()} | :error
end
