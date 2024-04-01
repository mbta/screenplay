defmodule ScreenplayWeb.AuthManager do
  @moduledoc false

  use Guardian, otp_app: :screenplay

  @type access_level :: :none | :read_only | :emergency_admin | :screens_config_admin

  @screenplay_emergency_admin_role "screenplay-emergency-admin"
  @screens_admin "screens-admin"

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
    access_levels =
      []
      |> append_if(@screenplay_emergency_admin_role in roles, :emergency_admin)
      |> append_if(@screens_admin in roles, :screens_admin)

    if access_levels == [] do
      [:read_only]
    else
      access_levels
    end
  end

  def claims_access_level(_claims) do
    [:read_only]
  end

  defp append_if(list, condition, item) do
    if condition, do: list ++ [item], else: list
  end
end
