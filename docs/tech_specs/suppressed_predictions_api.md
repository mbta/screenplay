# List Suppressed Predictions Messages

Lists all Suppressed Predictions defined by the stop*id, route_id and direction_id
Note: stop_id and location_id and place_id are \_almost* the same, minus JFK/UMass
JFK/UMass will use the child stop_ids being "jfk_umass_ashmont_platform" and "jfk_umass_braintree_platform"

**URL** : `/api/suppressed_predictions/suppression_data`

**Method** : `GET`

**Parameters**: None

**API key required** : YES

## Success Responses

**Code** : `200 OK`

**Response**:

```json
[
  {
    "direction_id": 1,
    "route_id": "Green-D",
    "location_id": "place-chhil",
    "suppression_type": null
  },
  {
    "direction_id": 0,
    "route_id": "Green-D",
    "location_id": "place-chhil",
    "suppression_type": null
  },
  {
    "direction_id": 1,
    "route_id": "Orange",
    "location_id": "place-tumnl",
    "suppression_type": null
  },
  {
    "direction_id": 0,
    "route_id": "Orange",
    "location_id": "place-tumnl",
    "suppression_type": null
  },
  {
    "direction_id": 1,
    "route_id": "Green-C",
    "location_id": "place-gover",
    "suppression_type": null
  },
  {
    "direction_id": 1,
    "route_id": "Green-D",
    "location_id": "place-gover",
    "suppression_type": null
  },
  {
    "direction_id": 0,
    "route_id": "Green-B",
    "location_id": "place-gover",
    "suppression_type": null
  },
  {
    "direction_id": 0,
    "route_id": "Green-C",
    "location_id": "place-gover",
    "suppression_type": null
  },
  {
    "direction_id": 1,
    "route_id": "Red",
    "location_id": "place-cntsq",
    "suppression_type": "stop"
  },
  {
    "direction_id": 0,
    "route_id": "Red",
    "location_id": "place-cntsq",
    "suppression_type": "stop"
  }
]
```

## Failure Responses

**Code** : `403 Forbidden`

**Response**:

`Invalid API key`
