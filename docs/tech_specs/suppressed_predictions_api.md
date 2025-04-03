# List Suppressed Predictions Messages

Lists all Suppressed Predictions defined by the stop_id, route_id and direction_id
Note: stop_id and location_id and place_id are _almost_ the same, minus JFK/UMass
JFK/UMass will use the child stop_ids being "jfk_umass_ashmont_platform" and "jfk_umass_braintree_platform"

**URL** : `/api/suppressed_predictions/all`

**Method** : `GET`

**Parameters**: None

**API key required** : YES

## Success Responses

**Code** : `200 OK`

**Response**:

```json
[
  {
    "stop_id": "place-one",
    "route_id": "route-one",
    "direction_id": 1
  },
  {
    "stop_id": "place-one",
    "route_id": "route-one",
    "direction_id": 0
  },
  {
    "stop_id": "place-two",
    "route_id": "Green-B",
    "direction_id": 0
  },
  {
    "stop_id": "place-two",
    "route_id": "Green-C",
    "direction_id": 0
  },
  {
    "stop_id": "place-three",
    "route_id": "741",
    "direction_id": 0
  },
  {
    "stop_id": "place-three",
    "route_id": "742",
    "direction_id": 0
  },
  {
    "stop_id": "place-three",
    "route_id": "743",
    "direction_id": 0
  },
  {
    "stop_id": "place-three",
    "route_id": "746",
    "direction_id": 0
  },
  {
    "stop_id": "jfk_umass_ashmont_platform",
    "route_id": "Red",
    "direction_id": 0
  },
  {
    "stop_id": "jfk_umass_braintree_platform",
    "route_id": "Red",
    "direction_id": 0
  }
]
```

## Failure Responses

**Code** : `403 Forbidden`

**Response**:

`Invalid API key`
