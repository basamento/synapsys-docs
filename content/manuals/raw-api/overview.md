---
title: Overview
description: Speaking the Synapsys protocol directly, with no starter.
sidebar_position: 1
---

# Raw API

Raw API is a supported way to connect to Synapsys, on the same footing as the
Spring Boot starter. It is what you use when your runtime has no starter — and
also the fastest way to understand what a starter is doing on your behalf.

## What you are implementing

One endpoint, called on a timer:

```
POST {coreUrl}/api/v1/workers/heartbeat
```

There is nothing else. No registration call, no authentication handshake, no
websocket, no callback. A correct client is a loop, a JSON document, and a
comparison between two integers.

## What you need

- An HTTP client
- A JSON encoder
- A timer
- Somewhere to keep one integer per process (`ackToken`)

## Read in this order

1. [The heartbeat loop](./the-heartbeat-loop) — the request, the response, and
   what to do with it
2. [Client checklist](./checklist) — everything a correct client must do, as a
   flat list to work through

The [protocol concept page](/docs/concepts/heartbeat-protocol) explains *why* the
design is shaped this way. This manual assumes you have decided to implement it
and want the details.
