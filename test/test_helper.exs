Mox.defmock(Screenplay.RoutePatterns.Mock, for: Screenplay.RoutePatterns.Behaviour)
Application.put_env(:screenplay, :route_pattern_mod, Screenplay.RoutePatterns.Mock)

ExUnit.start()
