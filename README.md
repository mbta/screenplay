# Screenplay

This tool enables PIOs to upload urgent messages to the Outfront signs in and outside stations.

## Development

To start your Phoenix server:
  * Set required env variables with
    * `export SECRET_KEY_BASE=`. You can use the value in `config.exs`.
    * `export GUARDIAN_SECRET_KEY=test_auth_secret`
  * Add a `screen_locations.json` file to the `priv` directory. You can either ask an engineer for a copy of the file, or enter an empty array as its contents (`[]`). The file just needs to exist and contain an array of 0 or more `{"id": "<screen ID>", "location": "<location description>"}` objects.
  * Install dependencies with `mix deps.get`
  * Install Node.js dependencies by running `npm run install`
  * Start Phoenix endpoint with `mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.
