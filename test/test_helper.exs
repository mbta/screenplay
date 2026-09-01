Application.put_env(:screenplay, :route_pattern_mod, Screenplay.RoutePatterns.Mock)
Application.put_env(:screenplay, :http_client, HttpClientMock)

Ecto.Adapters.SQL.Sandbox.mode(Screenplay.Repo, :manual)

Mox.defmock(HttpClientMock, for: Screenplay.HttpClient)

ExUnit.start()
