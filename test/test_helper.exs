Application.put_env(:screenplay, :route_pattern_mod, Screenplay.RoutePatterns.Mock)
Ecto.Adapters.SQL.Sandbox.mode(Screenplay.Repo, :manual)

ExUnit.start()
