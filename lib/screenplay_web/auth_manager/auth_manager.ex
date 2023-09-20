defmodule ScreenplayWeb.AuthManager do
  @moduledoc false

  use Guardian, otp_app: :screenplay

  require Logger

  @type access_level :: :none | :read_only | :admin

  @screenplay_admin_group "screenplay"

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

  @spec claims_access_level(Guardian.Token.claims()) :: access_level()
  def claims_access_level(%{"groups" => groups}) do
    Logger.info("[claims_access_level] groups=#{Enum.join(groups, ",")}")

    if not is_nil(groups) and @screenplay_admin_group in groups do
      :admin
    else
      :read_only
    end
  end

  def claims_access_level(_claims) do
    Logger.info("[claims_access_level no groups]")
    :read_only
  end
end
