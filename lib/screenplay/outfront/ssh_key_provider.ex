defmodule Screenplay.Outfront.SSHKeyProvider do
  @moduledoc """
  A custom provider that uses a key from an environment variable without requiring that it be
  written to a file.

  Implements the `:ssh_client_key_api` behavior.
  """

  @behaviour :ssh_client_key_api

  require Logger

  if String.to_integer(System.otp_release()) >= 23 do
    @impl true
    defdelegate add_host_key(host, port, public_key, opts), to: :ssh_file

    @impl true
    defdelegate is_host_key(key, host, port, algorithm, opts), to: :ssh_file
  else
    @impl true
    defdelegate add_host_key(host, public_key, opts), to: :ssh_file

    @impl true
    defdelegate is_host_key(key, host, algorithm, opts), to: :ssh_file
  end

  @impl true
  def user_key(algorithm, opts) do
    provider_opts = opts[:key_cb_private]

    case provider_opts[:private_key] do
      nil ->
        Logger.error("No private key provided")
        {:error, "No private key provided"}

      private_key ->
        private_key
        |> :public_key.pem_decode()
        |> List.first()
        |> case do
          nil ->
            Logger.error("Unable to decode key")
            {:error, "Unable to decode key"}

          {{_, :new_openssh}, _key, _} ->
            decode_new_openssh_private_key_contents(
              private_key,
              algorithm
            )

          {_type, _key, :not_encrypted} = entry ->
            {:ok, :public_key.pem_entry_decode(entry)}

          _ ->
            Logger.error("Passphrase required for provided key")
            {:error, "Passphrase required for provided key"}
        end
    end
  end

  defp decode_new_openssh_private_key_contents(
         key_contents,
         algorithm
       ) do
    with {:ok, decoded_keys} <-
           :ssh_file.decode_ssh_file(
             :private,
             algorithm,
             key_contents,
             :ignore
           ),
         {decoded_key, _} <- List.first(decoded_keys) do
      {:ok, decoded_key}
    else
      _result -> {:error, "Unable to decode key"}
    end
  end
end
