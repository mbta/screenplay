ARG ALPINE_VERSION=3.21.3
ARG ELIXIR_VERSION=1.17.3
ARG ERLANG_VERSION=27.3.4
ARG NODE_VERSION=22.18.0

# first, get the Elixir dependencies within an Elixir + Alpine Linux container
FROM hexpm/elixir:${ELIXIR_VERSION}-erlang-${ERLANG_VERSION}-alpine-${ALPINE_VERSION} as elixir-builder

ENV LANG="C.UTF-8" MIX_ENV="prod"

WORKDIR /root
ADD . .

# Install git
RUN apk --no-cache add git make

# Install Hex+Rebar
RUN mix do local.hex --force, local.rebar --force
RUN mix do deps.get --only prod

# next, build frontend assets within a node.js container
FROM node:${NODE_VERSION} as assets-builder

WORKDIR /root
ADD . .

# copy in elixir deps required to build node modules for phoenix
COPY --from=elixir-builder /root/deps ./deps

RUN npm --prefix assets ci
RUN npm --prefix assets run deploy

# now, build the application back in the elixir container
FROM elixir-builder as app-builder

ENV LANG="C.UTF-8" MIX_ENV="prod"

RUN apk add --no-cache --update curl

WORKDIR /root

RUN curl https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem -o aws-cert-bundle.pem

# add frontend assets compiled in node container, required by phx.digest
COPY --from=assets-builder /root/priv/static ./priv/static

RUN mix do compile --force, phx.digest, sentry.package_source_code, release

# finally, use an Alpine container for the runtime environment
FROM hexpm/erlang:${ERLANG_VERSION}-alpine-${ALPINE_VERSION}

ENV MIX_ENV="prod" TERM="xterm" LANG="C.UTF-8" PORT="4000"

WORKDIR /root
ADD . .

# add frontend assets with manifests from app build container
COPY --from=app-builder /root/priv/static ./priv/static
# add application artifact comipled in app build container
COPY --from=app-builder /root/_build/prod/rel/screenplay .

COPY --from=app-builder --chown=screenplay:screenplay /root/aws-cert-bundle.pem ./priv/aws-cert-bundle.pem

# run the application
CMD ["bin/screenplay", "start"]
