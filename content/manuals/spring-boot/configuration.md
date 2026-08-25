---
title: Configuration
description: Every synapsys.* property the starter reads.
sidebar_position: 2
---

# Configuration

Every property lives under the `synapsys` prefix.

:::caution A typo fails startup
The starter binds with `ignoreUnknownFields = false`. An unrecognised
`synapsys.*` key stops the application from booting rather than being silently
ignored.

This is deliberate. A misspelled `heartbeat-interval-ms` that binds to nothing
leaves a worker running on defaults with no indication why — and that is far more
expensive to find than a failed boot with the bad key named in the error.
:::

## Properties

| Property | Type | Default | Notes |
|---|---|---|---|
| `synapsys.core-url` | String | — | **Required.** Base URL of the Core, no trailing slash. |
| `synapsys.worker-name` | String | `spring.application.name` | Must be stable across restarts — it is how the Core recognises a returning worker. |
| `synapsys.host` | String | machine hostname | Set it explicitly when the resolved name is meaningless, as with a container id. |
| `synapsys.heartbeat-interval` | Duration | `5s` | Duration syntax: `5s`, `500ms`, `1m`. |
| `synapsys.fail-fast` | boolean | `false` | Whether an unreachable Core at startup stops the application. |
| `synapsys.connect-timeout` | Duration | `2s` | Connect timeout for the heartbeat call. |
| `synapsys.request-timeout` | Duration | `5s` | Read timeout for the heartbeat call. |

## A full example

```yaml title="application.yaml"
spring:
  application:
    name: billing-jobs

synapsys:
  core-url: http://synapsys-core.internal:8080
  worker-name: billing-jobs
  host: billing-01.eu-west
  heartbeat-interval: 5s
  fail-fast: false
  connect-timeout: 2s
  request-timeout: 5s
```

## Choosing an interval

The interval is the upper bound on how long a start or stop takes to be picked
up. Five seconds is a reasonable default for background jobs.

Lowering it makes the console feel more responsive and costs one HTTP request per
worker per interval. Raising it beyond about thirty seconds makes the console feel
broken, because a button press appears to do nothing for half a minute.

## `fail-fast`

Left `false`, an application whose Core is unreachable still starts, still runs
its processes, and keeps retrying the heartbeat in the background. Set it `true`
only when a worker is worthless without the Core — most are not.
