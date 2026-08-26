Application.put_env(:screenplay, :route_pattern_mod, Screenplay.RoutePatterns.Mock)
Application.put_env(:screenplay, :http_client, HTTPoisonMock)

Ecto.Adapters.SQL.Sandbox.mode(Screenplay.Repo, :manual)

Mox.defmock(HTTPoisonMock, for: Screenplay.HttpClient)

ExUnit.start()
