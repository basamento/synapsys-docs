---
title: Authentication
description: Configure the operator account, browser sessions, worker tokens, rotation, and HTTPS settings.
---

import ProductScreenshot from '@site/src/components/ProductScreenshot';

# Authentication

Core has separate credentials for operators and workers. Operator credentials open
a browser session; worker tokens authenticate the heartbeat API. Keep those trust
paths separate.

## Bootstrap the operator account

On the first start with an empty data volume, set:

```dotenv
SYNAPSYS_AUTH_USERNAME=operator
SYNAPSYS_AUTH_PASSWORD=replace-with-a-long-random-password
```

The values initialise the first account. Later environment changes do not overwrite
the persisted password. If you recreate Core with the same volume, use the original
account.

You can provide the password from a mounted secret file instead:

```dotenv
SYNAPSYS_AUTH_USERNAME=operator
SYNAPSYS_AUTH_PASSWORD_FILE=/run/secrets/synapsys_operator_password
```

## Bootstrap worker access

`SYNAPSYS_WORKER_TOKEN` is configured **on Core**. It defines one deployment-wide
bearer token that Core accepts from worker heartbeat requests, which can be useful
for headless bootstrap:

```dotenv
SYNAPSYS_WORKER_TOKEN=replace-with-a-different-long-random-token
```

The worker receives the same secret through its worker-side `SYNAPSYS_CORE_TOKEN`
setting and sends it as:

```http
Authorization: Bearer replace-with-your-worker-token
```

This shared credential is optional. Prefer named worker tokens for normal operation
because they can be rotated and revoked independently.

## Create named worker tokens

For ongoing operation, named tokens make ownership and rotation clearer:

1. Sign in to Core.
2. Open **Settings**.
3. Create a token with a name that identifies the service or environment.
4. Copy the secret immediately into your secret manager. It is shown once.
5. Inject it as `SYNAPSYS_CORE_TOKEN` in the worker.

Core displays token metadata and last use, but cannot reveal the secret again.

<ProductScreenshot
  src="/img/screenshots/core-settings-placeholder.svg"
  alt="Placeholder for worker token management in Synapsys Core Settings"
  caption="Settings shows token metadata and recent use without displaying stored secrets."
/>

## Rotate or revoke

Create a replacement first, deploy it to the worker, and confirm the new token has
been used. Then revoke the old token in **Settings**. A revoked token receives `401`
on its next heartbeat; running user code is not forcibly terminated, but the worker
cannot receive further commands until it has a valid credential.

## HTTPS and local development

Set `SYNAPSYS_AUTH_COOKIE_SECURE=true` whenever Core is served through HTTPS. Keep
worker URLs on `https://` as bearer tokens provide access to the control plane.

`SYNAPSYS_AUTH_DISABLED=true` disables both operator and worker authentication. It
is intended only for isolated local development and should never be used on a shared
network or internet-facing Core.
