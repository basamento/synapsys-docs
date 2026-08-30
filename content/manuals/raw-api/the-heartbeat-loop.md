---
title: The heartbeat loop
description: Send an authenticated process snapshot, receive commands, acknowledge tokens, and report execution logs.
---

# The heartbeat loop

Send a heartbeat every few seconds with a bounded timeout. Every request is a full
process snapshot and must carry a worker bearer token.

Schedule the next beat once the previous one has settled, rather than on a fixed
rate. A Core that answers slower than one interval then delays the loop instead of
leaving a backlog that fires back to back the moment it recovers. Two heartbeats are
never in flight at the same time.

The startup health probe, `GET /api/health`, is unauthenticated: it asks for no
credential, so none is sent.

## Request

```bash
curl --request POST 'https://core.example.com/api/v1/workers/heartbeat' \
  --header "Authorization: Bearer ${SYNAPSYS_CORE_TOKEN}" \
  --header 'Content-Type: application/json' \
  --data '{
    "workerName": "billing-api",
    "framework": "unknown",
    "host": "billing-01",
    "heartbeatInterval": 5,
    "processes": [
      {
        "name": "invoice-poller",
        "type": "endless",
        "currentState": "idle",
        "ackToken": 0,
        "runId": null
      }
    ],
    "logs": []
  }'
```

`heartbeatInterval` is a positive whole number of seconds. Send every process on
every request, including idle processes.

## Response

```json
{
  "processes": [
    {
      "name": "invoice-poller",
      "type": "endless",
      "currentState": "idle",
      "desiredState": "running",
      "desiredToken": 1,
      "ackToken": 0,
      "runId": 1788012345678901234
    }
  ]
}
```

For each returned process:

1. Ignore a token lower than or equal to the locally acknowledged token.
2. Map `running` to start and `stopping` to cooperative stop.
3. Treat `idle` as “no outstanding command,” not as a stop instruction.
4. Handle the command.
5. Advance `ackToken` only after handling succeeds.
6. Echo the assigned `runId` on later process snapshots and log entries.

If a start is returned while the previous execution is still `stopping`, defer
it: do not advance `ackToken` and do not replace the old execution's `runId`.
Core will return the same command again. Apply and acknowledge it after the old
execution becomes terminal.

A 2xx response whose body is empty, unparseable, or missing `processes` delivered no
commands. Treat it as a failed beat: requeue the drained log lines at the front of
the queue, acknowledge nothing, and retry on the next beat. Unknown *fields*, and
desired states a client has never heard of, are still ignored — that is forward
compatibility, and it is a different thing from a response the client cannot read.

`runId` is an opaque signed 64-bit value. JavaScript and other runtimes backed by
IEEE-754 numbers cannot represent every value exactly. Parse and preserve it with a
64-bit-safe JSON strategy, then send it back as a JSON number without changing its
digits.

## Report logs

Add complete lines produced during a run:

```json
{
  "processName": "invoice-poller",
  "runId": 1788012345678901234,
  "sequence": 1,
  "timestamp": "2026-08-29T09:30:00Z",
  "source": "stdout",
  "level": "info",
  "message": "poll completed"
}
```

Sequence numbers increase within a run. Use `stderr` with `error` for error output.
Do not send blank messages, a missing `runId`, or a sequence below one. Bound the
queue and batch size so a noisy process cannot exhaust memory or create an oversized
heartbeat.

If the request fails or Core rejects it, put drained log lines back at the front of
the queue and retry later. A heartbeat failure must never stop a user's running
process or terminate the loop.

On application shutdown, stop the normal loop, request cooperative stops, and
wait up to an application-defined bound. Then make one best-effort heartbeat with
the final states and queued logs. Ignore commands in that response: shutdown must
not start new work. A failure of this final request is diagnostic only and must
not block or fail shutdown. Bound that request by
`min(remaining shutdown budget, request timeout)`, and skip it when no time remains.
