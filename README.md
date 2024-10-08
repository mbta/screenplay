# Screenplay

Enables OIOs to view and manage screens that provide transit info to riders.

## Prerequisites

### Postgres

If you don't already have Postgres installed, and you're on a Mac, [Postgres.app](https://postgresapp.com/downloads.html) is an easy way to get started. However, any Postgres instance to which you can connect and in which you have sufficient privileges should work.

### Screens

Screenplay requires the Screens config to be available at `../screens/priv/local.json`. To generate this file, follow these steps:

1. `cd ..`
1. `git clone git@github.com:mbta/screens.git`
1. `cd screens`
1. Follow the [Getting Started docs](https://github.com/mbta/screens/blob/main/docs/getting_started.md#getting-started) to generate the files needed by Screenplay.

### Realtime-Signs

This repo expects Realtime Signs to be cloned and for `realtime_signs/priv/signs.json` to be available. This can be done by doing the following:

1. `cd ..`
1. `git clone git@github.com:mbta/realtime_signs.git`

## Local Development Setup

### Install tools

1. Install [`asdf`](https://github.com/asdf-vm/asdf)
1. Install language build dependencies: `brew install coreutils`
1. `asdf plugin-add ...` for each tool listed in `.tool-versions`
1. `asdf install`

### Set up environment

1. Install [`direnv`](https://direnv.net/)
1. `cp .envrc.template .envrc`
1. Fill in `API_V3_KEY` with a [V3 API key](https://api-v3.mbta.com/)
1. Fill in `DATABASE_USER` and `DATABASE_PASSWORD` with the username and password of a DB user configured in your local psql server
1. `direnv allow`

Note the various `_URL` values in `.envrc`, which default to the production
environments of the relevant apps — change these to e.g. point Screenplay to
your own local instances.

### Copy configuration

1. Install the `aws` CLI and configure with your AWS credentials
   - To verify everything works, try: `aws s3 ls mbta-ctd-config`
1. Run `scripts/pull_configs.sh prod`

To copy config files from a different Screenplay environment, replace `prod` in
the command above.

### Start the server

1. `mix deps.get`
1. `mix ecto.create` to stand up DB used by PA Messaging features
1. `npm install --prefix assets`
1. `mix phx.server`
1. Visit <http://localhost:4444>

### Optional: AWS credentials

In deployed environments, the app uses S3 for its configuration. If you ever
want to replicate this behavior locally, you'll need to provide the environment
variables `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`. For security reasons
these should only be [stored in 1Password][1] and not directly in your `.envrc`.

[1]: https://www.notion.so/mbta-downtown-crossing/Storing-Access-Keys-Securely-in-1Password-b89310bc67784722a5a218500f34443d?pm=c
