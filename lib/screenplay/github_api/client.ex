defmodule Screenplay.GithubApi.ClientBehaviour do
  @moduledoc false

  @callback get_file_contents_from_repo(String.t(), String.t()) :: {:ok, list(map())} | :error
end

defmodule Screenplay.GithubApi.Client do
  @moduledoc """
  Client used to fetch signs.json from the RTS GitHub repo
  """

  require Logger

  @behaviour Screenplay.GithubApi.ClientBehaviour
  @http_client Application.compile_env!(:screenplay, :http_client)

  @impl true
  def get_file_contents_from_repo(name, file_path) do
    url = "https://api.github.com/repos/mbta/#{name}/contents/#{file_path}"

    case @http_client.get(url) do
      {:ok, %{status_code: 200, body: body}} ->
        %{"content" => response_json} = Jason.decode!(body)

        contents =
          response_json |> String.replace("\n", "") |> Base.decode64!() |> Jason.decode!()

        {:ok, contents}

      _ ->
        Logger.error(
          "[github_api request] Could not fetch file from repo: repo: #{name} file_path: #{file_path}"
        )

        :error
    end
  end
end

defmodule Screenplay.GithubApi.FakeClient do
  @moduledoc """
  Client used to fetch signs.json from local RTS repo
  """

  require Logger

  @behaviour Screenplay.GithubApi.ClientBehaviour

  @impl true
  # sobelow_skip ["Traversal.FileModule"]
  def get_file_contents_from_repo(_, _) do
    path =
      case Application.get_env(:screenplay, :local_signs_json_path) do
        {:test, file_name} -> Path.join(~w[#{File.cwd!()} test fixtures #{file_name}])
        file_name -> file_name
      end

    case File.read(path) do
      {:ok, file} ->
        {:ok, Jason.decode!(file)}

      {:error, _} ->
        Logger.error("Could not fetch local signs.json. Please ensure RTS repo has been cloned.")
        :error
    end
  end
end
