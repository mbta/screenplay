defmodule Screenplay.HttpClient do
  @moduledoc """
  Behaviour for HTTP client implementations.
  """

  @type headers :: [{String.t(), String.t()}] | []
  @type status_code :: integer()
  @type response :: %{status_code: status_code, body: String.t()}

  @callback get(url :: String.t(), headers :: headers) ::
              {:ok, response} | {:error, term()}

  @callback post(url :: String.t(), body :: String.t(), headers :: headers) ::
              {:ok, response} | {:error, term()}
end
