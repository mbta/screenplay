# List Suppressed suppression_type

Lists all Suppressed suppression_type defined by the stop_id, route_id and direction_id

_Note_: JFK/UMass (place-jfk) will use the child stop_ids.

**URL** : `/api/suppressed-predictions/suppression_data`

**Method** : `GET`

**Parameters**: None

**API key required** : YES

## Success Responses

**Code** : `200 OK`

**Response**:

```json
[
  {
    "stop_id": "place-aqucl",
    "route_id": "Blue",
    "direction_id": 1,
    "suppression_type": "none"
  },
  {
    "stop_id": "place-aqucl",
    "route_id": "Blue",
    "direction_id": 0,
    "suppression_type": "none"
  },
  {
    "stop_id": "place-ogmnl",
    "route_id": "Orange",
    "direction_id": 0,
    "suppression_type": "terminal"
  },
  {
    "stop_id": "place-hymnl",
    "route_id": "Green-B",
    "direction_id": 1,
    "suppression_type": "stop"
  },
  {
    "stop_id": "place-hymnl",
    "route_id": "Green-C",
    "direction_id": 1,
    "suppression_type": "stop"
  },
  {
    "stop_id": "place-hymnl",
    "route_id": "Green-D",
    "direction_id": 1,
    "suppression_type": "stop"
  },
  {
    "stop_id": "place-crtst",
    "route_id": "741",
    "direction_id": 0,
    "suppression_type": "stop"
  },
  {
    "stop_id": "place-crtst",
    "route_id": "742",
    "direction_id": 0,
    "suppression_type": "stop"
  },
  {
    "stop_id": "place-crtst",
    "route_id": "743",
    "direction_id": 0,
    "suppression_type": "stop"
  },
  {
    "stop_id": "place-crtst",
    "route_id": "746",
    "direction_id": 0,
    "suppression_type": "stop"
  },
  {
    "stop_id": "70085",
    "route_id": "Red",
    "direction_id": 0,
    "suppression_type": "stop"
  },
  {
    "stop_id": "70086",
    "route_id": "Red",
    "direction_id": 1,
    "suppression_type": "none"
  },
  {
    "stop_id": "70095",
    "route_id": "Red",
    "direction_id": 0,
    "suppression_type": "stop"
  },
  {
    "stop_id": "70096",
    "route_id": "Red",
    "direction_id": 1,
    "suppression_type": "none"
  }
]
```

## Failure Responses

**Code** : `403 Forbidden`

**Response**:

`Invalid API key`
