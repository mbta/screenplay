# Screenplay

This tool enables PIOs to upload urgent messages to the Outfront signs in and outside stations.

## Development

To start your Phoenix server:

- Set required env variables with
  - `export SECRET_KEY_BASE=`. You can use the value in `config.exs`.
  - `export GUARDIAN_SECRET_KEY=test_auth_secret`
- Add a `screen_locations.json` file to the `priv` directory. You can either ask an engineer for a copy of the file, or enter an empty array as its contents (`[]`). The file just needs to exist and contain an array of 0 or more `{"id": "<screen ID>", "location": "<location description>"}` objects.
- Add a `place_descriptions.json` file to the `priv` directory. You can either ask an engineer for a copy of the file, or enter an empty array as its contents (`[]`). The file just needs to exist and contain an array of 0 or more `{"id": "<place ID>", "description": "<place description>"}` objects.
- Install dependencies with `mix deps.get`
- Install Node.js dependencies by running `npm run install`
- Start Phoenix endpoint with `API_V3_KEY=<your-key-here> mix phx.server`

If you want to develop on Screenplay with a local version of the Screens app, just spin up Screens (which will be at http://localhost:4000) and change the dev baseUrl in ScreenDetail.tsx to use that port 4000 url.

Now you can visit [`localhost:4444`](http://localhost:4444) from your browser.

You may want to add `export API_V3_KEY=<your-key-here>` to your shell config so that you don't have to specify it each time you run `mix phx.server`.
