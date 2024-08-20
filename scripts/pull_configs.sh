#!/bin/sh

# Copies live configuration from S3 to the local paths expected by `LocalFetch`
# modules.

set -eu

if [ $# -eq 0 ]; then
  echo "Usage: $0 <screenplay-env-name>" >&2
  exit 1
fi

case $1 in
  prod | dev | dev-green) true;;
  * )
    echo "Environment should be: prod | dev | dev-green" >&2
    exit 2
    ;;
esac

maybe_cp() {
  if [ -e "$2" ]; then
    printf '%s' "Overwrite $2? "
    read -r answer
    case $answer in
      [Yy]* ) aws s3 cp "$1" "$2";;
      * ) echo "Skipped.";;
    esac
  else
    aws s3 cp "$1" "$2"
  fi
}

maybe_cp s3://mbta-ctd-config/screenplay/"$1".json priv/alerts.json
maybe_cp s3://mbta-ctd-config/screenplay/"$1"/paess_labels.json priv/config/paess_labels.json
maybe_cp s3://mbta-ctd-config/screenplay/"$1"/place_descriptions.json priv/config/place_descriptions.json
maybe_cp s3://mbta-ctd-config/screenplay/"$1"/places_and_screens.json priv/config/places_and_screens.json
maybe_cp s3://mbta-ctd-config/screenplay/"$1"/screen_locations.json priv/config/screen_locations.json
