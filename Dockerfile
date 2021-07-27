#WIP

# 1.) Get the Elixir dependencies within an Elixir container
FROM hexpm/elixir:1.12.2-erlang-24.0.4-alpine-3.14.0 as elixir-builder

WORKDIR /root

# Install git
RUN apk --update add git make
