# List Active Messages

Lists all PA messages that are currently eligible to play.

**URL** : `/api/pa-messages`

**Method** : `GET`

**Parameters**: None

**API key required** : YES

## Success Responses

**Code** : `200 OK`

**Response**:

```json
[
  {
    "id": 1,
    "sign_ids": ["sign_1", "sign2"],
    "priority": 0,
    "interval_in_minutes": 4,
    "visual_text": "This message will be played.",
    "audio_text": "This message will be played."
  },
  {
    "id": 2,
    "sign_ids": ["sign_3", "sign4"],
    "priority": 0,
    "interval_in_minutes": 3,
    "visual_text": "This message will be played.",
    "audio_text": "This message will be played."
  },
  {
    "id": 3,
    "sign_ids": ["sign_1"],
    "priority": 0,
    "interval_in_minutes": 2,
    "visual_text": "This message will be played.",
    "audio_text": "This message will be played."
  },
  {
    "id": 4,
    "sign_ids": ["sign_1"],
    "priority": 0,
    "interval_in_minutes": 2,
    "visual_text": "This message will be played.",
    "audio_url": "www.example.com/audio_url"
  }
]
```

## Failure Responses

**Code** : `403 Forbidden`

**Response**:

`Invalid API key`
