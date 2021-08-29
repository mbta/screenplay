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
  def user_key(_algorithm, opts) do
    provider_opts = opts[:key_cb_private]

    pem_entry =
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

            {_type, _key, :not_encrypted} = entry ->
              {:ok, entry}

            _ ->
              Logger.error("Passphrase required for provided key")
              {:error, "Passphrase required for provided key"}
          end
      end

    case pem_entry do
      {:ok, entry} ->
        {:ok, :public_key.pem_entry_decode(entry)}

      error ->
        error
    end
  end
end
