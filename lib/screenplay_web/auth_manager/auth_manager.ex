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

  @spec subject_for_token(
          resource :: Guardian.Token.resource(),
          claims :: Guardian.Token.claims()
        ) :: {:ok, String.t()} | {:error, atom()}
  def subject_for_token(resource, _claims) do
    {:ok, resource}
  end

  @spec resource_from_claims(claims :: Guardian.Token.claims()) ::
          {:error, :invalid_claims} | {:ok, String.t()}
  def resource_from_claims(%{"sub" => username}) do
    {:ok, username}
  end

  def resource_from_claims(_), do: {:error, :invalid_claims}

  @spec claims_access_level(Guardian.Token.claims()) :: list(access_level())
  def claims_access_level(%{"roles" => roles}) when not is_nil(roles) do
    Enum.map(roles, &Map.get(@roles, &1)) |> Enum.reject(&is_nil/1)
  end

  def claims_access_level(_claims) do
    []
  end
end
