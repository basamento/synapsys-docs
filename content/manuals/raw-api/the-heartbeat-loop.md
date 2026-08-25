---
title: The heartbeat loop
description: The request, the response, and the token comparison at the centre of it.
sidebar_position: 2
---

# The heartbeat loop

## Request

```http
POST /api/v1/workers/heartbeat HTTP/1.1
Content-Type: application/json
```

```json
{
  "workerName": "billing-jobs",
  "framework": "custom",
  "host": "billing-01",
  "heartbeatInterval": 5,
  "processes": [
    {
      "name": "nightly-sync",
      "type": "endless",
      "currentState": "running",
      "ackToken": 7
    }
  ]
}
```

### Fields

| Field | Type | Notes |
|---|---|---|
| `workerName` | string | Stable across restarts. This is your identity. |
| `framework` | string | Your runtime. Omit it and the Core records `unknown` — it never guesses. |
| `host` | string | Omit it and the Core falls back to the TCP remote address, usually a container IP. |
| `heartbeatInterval` | integer | **Seconds.** Match the interval you actually use. |
| `processes[].name` | string | Unique within this worker, not globally. |
| `processes[].type` | string | `endless` or `progressive`. |
| `processes[].currentState` | string | `idle`, `running`, `stopping` or `failed`. |
| `processes[].ackToken` | integer | The last `desiredToken` you applied. The most important field in the document. |

Send **every** process you own on **every** beat, not just the ones that changed.

## Response

```json
{
  "processes": [
    {
      "name": "nightly-sync",
      "desiredState": "stopping",
      "desiredToken": 8
    }
  ]
}
```

A `runId` is present when the Core has assigned one to an in-flight execution.
Carry it back unchanged on subsequent beats.

## The comparison

This is the whole protocol:

```
for each process in response:
    if process.desiredToken > stored_ack_token[process.name]:
        apply(process.desiredState)
        stored_ack_token[process.name] = process.desiredToken
```

Three rules that clients get wrong:

1. **`desiredState: "idle"` is not a stop.** It means there is no outstanding
   command. Stop is `stopping`.
2. **Update `ackToken` after applying, not before.** If you update first and then
   crash, the command is lost — the Core will consider it acknowledged.
3. **Equal tokens are duplicates.** Only strictly greater means "new".

## Failure handling

The Core being unreachable is not a reason to stop anything. Keep your processes
running, keep your `ackToken` values, and keep retrying. Command state lives in
the Core's database, not in the connection — a restart on either side converges
on the next successful beat.

Use a connect timeout and a request timeout. A hung Core must not stall the loop.
