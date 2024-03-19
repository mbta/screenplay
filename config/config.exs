# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

# Configures the endpoint
config :screenplay, ScreenplayWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "drimL+OI78FRmMU5+sERpEFHEwpUIrTo1CMAafmiAXM+YjD0G5tJHQlkcZyQanhu",
  render_errors: [view: ScreenplayWeb.ErrorView, accepts: ~w(html json), layout: false],
  pubsub_server: Screenplay.PubSub,
  live_view: [signing_salt: "vSiyKz7D"]

config :screenplay,
  config_fetcher: Screenplay.Config.S3Fetch,
  config_s3_bucket: "mbta-ctd-config",
  record_sentry: false

# Include 2 logger backends
config :logger,
  backends: [:console, Sentry.LoggerBackend]

# Do not send local errors to Sentry
config :sentry,
  dsn: "",
  environment_name: "dev",
  included_environments: []

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Use Jason for JSON parsing in ExAws
config :ex_aws, json_codec: Jason

config :screenplay, ScreenplayWeb.AuthManager, issuer: "screenplay"

# Placeholder for Keycloak authentication, defined for real in environment configs
config :ueberauth, Ueberauth,
  providers: [
    keycloak: nil
  ]

config :screenplay,
  station_screen_orientation_list: %{
    red: [
      %{
        name: "Alewife",
        portrait: true,
        landscape: false
      },
      %{
        name: "Davis",
        portrait: true,
        landscape: false
      },
      %{
        name: "Porter",
        portrait: true,
        landscape: false
      },
      %{
        name: "Harvard",
        portrait: true,
        landscape: false
      },
      %{
        name: "Central",
        portrait: true,
        landscape: false
      },
      %{
        name: "Kendall/MIT",
        portrait: true,
        landscape: false
      },
      %{
        name: "Charles/MGH",
        portrait: true,
        landscape: false
      },
      %{
        name: "Park Street",
        portrait: true,
        landscape: false
      },
      %{
        name: "Downtown Crossing",
        portrait: true,
        landscape: false
      },
      %{
        name: "South Station",
        portrait: true,
        landscape: false
      },
      %{
        name: "Broadway",
        portrait: true,
        landscape: true
      },
      %{
        name: "Andrew",
        portrait: false,
        landscape: false
      },
      %{
        name: "JFK/UMass",
        portrait: true,
        landscape: false
      },
      %{
        name: "Savin Hill",
        portrait: false,
        landscape: false
      },
      %{
        name: "Fields Corner",
        portrait: false,
        landscape: false
      },
      %{
        name: "Shawmut",
        portrait: false,
        landscape: false
      },
      %{
        name: "ASHMONT",
        portrait: false,
        landscape: false
      },
      %{
        name: "North Quincy",
        portrait: false,
        landscape: false
      },
      %{
        name: "Wollaston",
        portrait: false,
        landscape: false
      },
      %{
        name: "Quincy Center",
        portrait: true,
        landscape: true
      },
      %{
        name: "Quincy Adams",
        portrait: false,
        landscape: false
      },
      %{
        name: "BRAINTREE",
        portrait: false,
        landscape: false
      }
    ],
    orange: [
      %{
        name: "Oak Grove",
        portrait: false,
        landscape: false
      },
      %{
        name: "Malden Center",
        portrait: true,
        landscape: true
      },
      %{
        name: "Wellington",
        portrait: true,
        landscape: false
      },
      %{
        name: "Assembly",
        portrait: false,
        landscape: false
      },
      %{
        name: "Sullivan Square",
        portrait: true,
        landscape: true
      },
      %{
        name: "Community College",
        portrait: false,
        landscape: false
      },
      %{
        name: "North Station",
        portrait: true,
        landscape: false
      },
      %{
        name: "Haymarket",
        portrait: true,
        landscape: true
      },
      %{
        name: "State",
        portrait: true,
        landscape: false
      },
      %{
        name: "Downtown Crossing",
        portrait: true,
        landscape: false
      },
      %{
        name: "Chinatown",
        portrait: false,
        landscape: false
      },
      %{
        name: "Tufts Medical Center",
        portrait: true,
        landscape: true
      },
      %{
        name: "Back Bay",
        portrait: true,
        landscape: true
      },
      %{
        name: "Massachusetts Avenue",
        portrait: true,
        landscape: false
      },
      %{
        name: "Ruggles",
        portrait: true,
        landscape: false
      },
      %{
        name: "Roxbury Crossing",
        portrait: false,
        landscape: false
      },
      %{
        name: "Jackson Square",
        portrait: false,
        landscape: false
      },
      %{
        name: "Stony Brook",
        portrait: false,
        landscape: false
      },
      %{
        name: "Green Street",
        portrait: false,
        landscape: false
      },
      %{
        name: "Forest Hills",
        portrait: true,
        landscape: false
      }
    ],
    blue: [
      %{
        name: "Bowdoin",
        portrait: false,
        landscape: false
      },
      %{
        name: "Government Center",
        portrait: true,
        landscape: false
      },
      %{
        name: "State",
        portrait: true,
        landscape: false
      },
      %{
        name: "Aquarium",
        portrait: false,
        landscape: true
      },
      %{
        name: "Maverick",
        portrait: true,
        landscape: true
      },
      %{
        name: "Airport",
        portrait: true,
        landscape: true
      },
      %{
        name: "Wood Island",
        portrait: false,
        landscape: false
      },
      %{
        name: "Orient Heights",
        portrait: false,
        landscape: false
      },
      %{
        name: "Suffolk Downs",
        portrait: false,
        landscape: false
      },
      %{
        name: "Beachmont",
        portrait: false,
        landscape: false
      },
      %{
        name: "Revere Beach",
        portrait: false,
        landscape: false
      },
      %{
        name: "Wonderland",
        portrait: false,
        landscape: false
      }
    ],
    silver: [
      %{
        name: "World Trade Center",
        portrait: false,
        landscape: true
      }
    ],
    green: [
      %{
        name: "North Station",
        portrait: true,
        landscape: false
      },
      %{
        name: "Haymarket",
        portrait: true,
        landscape: true
      },
      %{
        name: "Government Center",
        portrait: true,
        landscape: false
      },
      %{
        name: "Park Street",
        portrait: true,
        landscape: false
      },
      %{
        name: "Boylston",
        portrait: true,
        landscape: false
      },
      %{
        name: "Arlington",
        portrait: true,
        landscape: false
      },
      %{
        name: "Copley",
        portrait: true,
        landscape: false
      },
      %{
        name: "Hynes Convention Center",
        portrait: false,
        landscape: false
      },
      %{
        name: "Kenmore",
        portrait: true,
        landscape: true
      },
      %{
        name: "Prudential",
        portrait: false,
        landscape: true
      },
      %{
        name: "Symphony",
        portrait: false,
        landscape: false
      }
    ]
  }

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
