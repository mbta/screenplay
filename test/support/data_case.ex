defmodule ScreenplayWeb.DataCase do
  @moduledoc """
  This module defines the setup for tests requiring
  access to the application's data layer.

  You may define functions here to be used as helpers in
  your tests.

  Finally, if the test case interacts with the database,
  it cannot be async. For this reason, every test runs
  inside a transaction which is reset at the beginning
  of the test unless the test case is marked as async.
  """

  use ExUnit.CaseTemplate

  alias Ecto.Adapters.SQL.Sandbox

  using do
    quote do
      alias Screenplay.Repo

      import Ecto
      import Ecto.Query
      import ScreenplayWeb.DataCase
    end
  end

  setup tags do
    :ok = Sandbox.checkout(Screenplay.Repo)

    unless tags[:async] do
      Sandbox.mode(Screenplay.Repo, {:shared, self()})
    end

    :ok
  end
end
