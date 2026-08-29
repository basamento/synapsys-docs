---
title: Rotate a worker token
description: Replace a worker credential without interrupting a running process or losing command delivery.
sidebar_position: 8
---

# Rotate a worker token

Rotate worker tokens by overlapping the old and new credentials. Running process
code does not stop when a heartbeat credential changes, but commands and new output
cannot reach Core while the worker is presenting an invalid token.

## 1. Create the replacement

Sign in to Core, open **Settings**, and create a named token that identifies the
worker and environment. Copy the secret immediately into your secret manager; Core
cannot display it again.

## 2. Update the worker

Replace `SYNAPSYS_CORE_TOKEN` in the application's secret or deployment definition,
then roll out or restart the worker using your normal deployment process.

Do not revoke the old token yet.

## 3. Confirm the new credential

In Core, verify that:

- the worker remains active;
- process states continue updating;
- the replacement token's **last used** value changes after the rollout;
- no heartbeat `401` appears in the worker's application logs.

Wait at least a few heartbeat intervals so every instance in a replicated deployment
has time to move to the new secret.

## 4. Revoke the old token

Revoke the old token in **Settings**. Revocation is immediate. Any forgotten worker
instance still using it begins receiving `401` on its next heartbeat, which makes a
partial rollout visible.

## Recovery

If a worker becomes inactive after revocation, redeploy it with the replacement
secret. Do not paste the token into logs, support tickets, shell history, or a Core
URL. If the replacement may have been exposed, create another token and repeat the
rotation.
