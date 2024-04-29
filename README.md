# Screenplay

Enables OIOs to view and manage screens that provide transit info to riders.


## Setup

#### Install tools

1. Install [`asdf`](https://github.com/asdf-vm/asdf)
1. Install language build dependencies: `brew install coreutils`
1. `asdf plugin-add ...` for each tool listed in `.tool-versions`
1. `asdf install`

#### Set up environment

1. Install [`direnv`](https://direnv.net/)
1. `cp .envrc.template .envrc`
1. Fill in `API_V3_KEY` with a [V3 API key](https://api-v3.mbta.com/)
1. `direnv allow`

Note the various `_URL` values in `.envrc`, which default to the production
environments of the relevant apps — change these to e.g. point Screenplay to
your own local instances.

#### Copy configuration

1. Install the `aws` CLI and configure with your AWS credentials
   - To verify everything works, try: `aws s3 ls mbta-ctd-config`
1. Run `scripts/pull_configs.sh prod`

To copy config files from a different Screenplay environment, replace `prod` in
the command above.

#### Start the server

1. `mix deps.get`
1. `npm install --prefix assets`
1. `mix phx.server`
1. Visit <http://localhost:4444>

#### Optional: AWS credentials

In deployed environments, the app uses S3 for its configuration. If you ever
want to replicate this behavior locally, you'll need to provide the environment
variables `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`. For security reasons
these should only be [stored in 1Password][1] and not directly in your `.envrc`.

[1]: https://www.notion.so/mbta-downtown-crossing/Storing-Access-Keys-Securely-in-1Password-b89310bc67784722a5a218500f34443d?pm=c
