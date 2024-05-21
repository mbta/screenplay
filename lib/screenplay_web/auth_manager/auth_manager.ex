defmodule ScreenplayWeb.AuthManager do
  @moduledoc false

  use Guardian, otp_app: :screenplay

  @type access_level ::
          :emergency_admin | :screens_config_admin | :screens_admin | :pa_message_admin

  @roles %{
    "screenplay-emergency-admin" => :emergency_admin,
    "screens-admin" => :screens_admin,
    "pa-message-admin" => :pa_message_admin
  }

  @max_session_time Application.compile_env(:screenplay, __MODULE__)[:max_session_time]
  @max_idle_time Application.compile_env(:screenplay, __MODULE__)[:idle_time]

  @impl true
  @spec subject_for_token(
          resource :: Guardian.Token.resource(),
          claims :: Guardian.Token.claims()
        ) :: {:ok, String.t()} | {:error, atom()}
  def subject_for_token(resource, _claims) do
    {:ok, resource}
  end

  @impl true
  @spec resource_from_claims(claims :: Guardian.Token.claims()) ::
          {:error, :invalid_claims} | {:ok, String.t()}
  def resource_from_claims(%{"sub" => username}) do
    {:ok, username}
  end

  def resource_from_claims(_), do: {:error, :invalid_claims}

  @impl true
  def verify_claims(claims = %{"iat" => iat, "auth_time" => auth_time}, _opts) do
    now = System.system_time(:second)
    # auth_time is when the user entered their password at the SSO provider
    auth_time_expires = auth_time + @max_session_time
    # iat is when the token was issued
    iat_expires = iat + @max_idle_time
    # did either timeout expire?
    if min(auth_time_expires, iat_expires) < now do
      {:error, {:auth_expired, claims["sub"]}}
    else
      {:ok, claims}
    end
  end

  @spec claims_access_level(Guardian.Token.claims()) :: list(access_level())
  def claims_access_level(%{"roles" => roles}) when not is_nil(roles) do
    Enum.map(roles, &Map.get(@roles, &1)) |> Enum.reject(&is_nil/1)
  end

  def claims_access_level(_claims) do
    []
  end
end
