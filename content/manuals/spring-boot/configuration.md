---
title: Configuration
description: Configure the Spring Boot starter with properties, environment variables, and deployment-safe defaults.
---

# Configuration

All settings use Spring Boot's `synapsys.*` configuration namespace. Keep public
configuration in `application.yaml` and inject URLs and credentials through the
environment or your platform's secret store.

## Recommended application configuration

```yaml title="application.yaml"
spring:
  application:
    name: billing-api

synapsys:
  enabled: ${SYNAPSYS_ENABLED:true}
  core-url: ${SYNAPSYS_CORE_URL}
  core-token: ${SYNAPSYS_CORE_TOKEN}
  worker-name: ${SYNAPSYS_WORKER_NAME:${spring.application.name}}
  host: ${SYNAPSYS_HOST:}
  heartbeat-interval: ${SYNAPSYS_HEARTBEAT_INTERVAL:5s}
  fail-fast: ${SYNAPSYS_FAIL_FAST:false}
  connect-timeout: ${SYNAPSYS_CONNECT_TIMEOUT:2s}
  request-timeout: ${SYNAPSYS_REQUEST_TIMEOUT:5s}
  shutdown-timeout: ${SYNAPSYS_SHUTDOWN_TIMEOUT:10s}
  capture-console: ${SYNAPSYS_CAPTURE_CONSOLE:true}
```

Spring translates property names to uppercase underscore environment names. For a
container or service definition, the minimum secret-bearing environment is:

```dotenv
SYNAPSYS_CORE_URL=https://core.example.com
SYNAPSYS_CORE_TOKEN=syn_replace_with_your_token
```

## Properties

| Property | Default | Description |
| --- | --- | --- |
| `synapsys.enabled` | `true` | `false` disables heartbeats and capture; useful in tests and developer runs. |
| `synapsys.core-url` | none | Required base URL of Core. |
| `synapsys.core-token` | none | Worker bearer token. Core rejects a heartbeat without it. |
| `synapsys.worker-name` | `spring.application.name` | Stable identity across restarts. Required if the application name is absent. |
| `synapsys.host` | machine hostname | Host label reported to Core. Set it when an automatic container hostname is not useful. |
| `synapsys.heartbeat-interval` | `5s` | Positive whole seconds between heartbeats. |
| `synapsys.fail-fast` | `false` | Fail startup if Core is unavailable instead of continuing to retry. |
| `synapsys.connect-timeout` | `2s` | HTTP connection timeout. |
| `synapsys.request-timeout` | `5s` | Whole heartbeat request timeout. |
| `synapsys.shutdown-timeout` | `10s` | Budget for stopping processes and attempting the final heartbeat. |
| `synapsys.capture-console` | `true` | Tee process stdout/stderr to Core; `false` leaves global streams untouched. |

Unknown `synapsys.*` properties fail startup. This is deliberate: a misspelled
timeout or URL should not silently leave a worker on an unexpected default.

## Environment patterns

Use the same artifact in every environment and change only injected values:

```yaml title="application-test.yaml"
synapsys:
  enabled: false
```

For production, use a distinct named worker token per service or trust boundary.
Rotate it by creating a replacement in Core **Settings**, update the deployment,
confirm `last used` on the new token, then revoke the old one.

## Availability behaviour

With the default `fail-fast: false`, an unavailable Core does not prevent the host
application from starting and does not stop work already running. The heartbeat
continues retrying. Use `true` only when joining Core is a hard requirement for that
deployment.

Next: [define process types and understand log capture](./processes-and-logs).

During Spring context destruction, the starter stops normal heartbeats, requests
cooperative stops, waits within `synapsys.shutdown-timeout`, attempts one final
heartbeat whose commands are ignored, restores console capture, and releases its
per-process executors. Shutdown is idempotent and non-throwing. Current `0.2.0`
starts a final request only if time remains, but does not shorten that request to a
smaller remaining budget; see [current client differences](/reference/client-lifecycle#current-implementation-differences).
