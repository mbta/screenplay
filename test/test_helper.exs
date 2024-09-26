Mox.defmock(Screenplay.RoutePatterns.Mock, for: Screenplay.RoutePatterns.Behaviour)
Mox.defmock(Screenplay.Stops.Mock, for: Screenplay.Stops.Behaviour)
Mox.defmock(Screenplay.Routes.Mock, for: Screenplay.Routes.Behaviour)
Application.put_env(:screenplay, :route_pattern_mod, Screenplay.RoutePatterns.Mock)
Application.put_env(:screenplay, :stops_mod, Screenplay.Stops.Mock)
Application.put_env(:screenplay, :routes_mod, Screenplay.Routes.Mock)
Ecto.Adapters.SQL.Sandbox.mode(Screenplay.Repo, :manual)

ExUnit.start()
