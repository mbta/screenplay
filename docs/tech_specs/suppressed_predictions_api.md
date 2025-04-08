# List Suppressed Predictions Messages

Lists all Suppressed Predictions defined by the stop_id, route_id and direction_id
Note: stop_id and location_id and place_id are _almost_ the same, minus JFK/UMass
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
    "location_id": "place-aqucl",
    "route_id": "Blue",
    "direction_id": 1,
    "suppressed_type": null
  },
  {
    "location_id": "place-aqucl",
    "route_id": "Blue",
    "direction_id": 0,
    "suppressed_type": null
  },
  {
    "location_id": "place-ogmnl",
    "route_id": "Orange",
    "direction_id": 0,
    "suppressed_type": "terminal"
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
  },
  {
    "location_id": "place-hymnl",
    "route_id": "Green-B",
    "direction_id": 1,
    "suppressed_type": "stop"
  },
  {
    "location_id": "place-hymnl",
    "route_id": "Green-C",
    "direction_id": 1,
    "suppressed_type": "stop"
  },
  {
    "location_id": "place-hymnl",
    "route_id": "Green-D",
    "direction_id": 1,
    "suppressed_type": "stop"
  },
  {
    "location_id": "place-crtst",
    "route_id": "741",
    "direction_id": 0,
    "suppressed_type": "stop"
  },
  {
    "location_id": "place-crtst",
    "route_id": "742",
    "direction_id": 0,
    "suppressed_type": "stop"
  },
  {
    "location_id": "place-crtst",
    "route_id": "743",
    "direction_id": 0,
    "suppressed_type": "stop"
  },
  {
    "location_id": "place-crtst",
    "route_id": "746",
    "direction_id": 0,
    "suppressed_type": "stop"
  }
]
```

## Failure Responses

**Code** : `403 Forbidden`

**Response**:

`Invalid API key`
