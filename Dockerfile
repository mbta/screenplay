# first, get the Elixir dependencies within an Elixir + Alpine Linux container
FROM hexpm/elixir:1.13.4-erlang-25.0-alpine-3.15.4 AS elixir-builder

ENV LANG="C.UTF-8" MIX_ENV="prod"

WORKDIR /root
ADD . .

# Install git
RUN apk --no-cache add git make

# Install Hex+Rebar
RUN mix do local.hex --force, local.rebar --force
RUN mix do deps.get --only prod

# next, build frontend assets within a node.js container
FROM node:14 as assets-builder

WORKDIR /root
ADD . .

# copy in elixir deps required to build node modules for phoenix
COPY --from=elixir-builder /root/deps ./deps

RUN npm --prefix assets ci
RUN npm --prefix assets run deploy

# now, build the application back in the elixir container
FROM elixir-builder as app-builder

ENV LANG="C.UTF-8" MIX_ENV="prod"

WORKDIR /root

# add frontend assets compiled in node container, required by phx.digest
COPY --from=assets-builder /root/priv/static ./priv/static

RUN mix do compile --force, phx.digest, release

# finally, use an Alpine container for the runtime environment
FROM alpine:3.15.4

ENV MIX_ENV="prod" TERM="xterm" LANG="C.UTF-8" PORT="4000"

WORKDIR /root
ADD . .

# erlang-crypto requires system library libssl1.1
RUN apk add --no-cache \
  # erlang-crypto requires system library libssl1.1
  libssl1.1 \
  # Erlang/OTP 24+ requires a glibc version that ships with asmjit
  libstdc++ libgcc ncurses-libs

# add frontend assets with manifests from app build container
COPY --from=app-builder /root/priv/static ./priv/static
# add application artifact comipled in app build container
COPY --from=app-builder /root/_build/prod/rel/screenplay .

# run the application
CMD ["bin/screenplay", "start"]
