---
title: Secure integrations, Node.js, and execution logs
description: Core authentication, public libraries, and per-run output make Synapsys ready for a broader set of applications.
date: 2026-08-29
---

Synapsys now has a complete authenticated path from operator to worker, public
packages for Spring Boot and Node.js, and execution output visible in Core. Together,
these changes reduce the work needed to evaluate and adopt the system.

{/* truncate */}

## Separate credentials for people and software

Operators sign in to the Core console with a username and password. Workers use
bearer tokens on every heartbeat. Named worker tokens can be created and revoked in
Settings, and their secret is shown only at creation.

Keeping the two authentication paths separate makes token rotation predictable and
avoids putting an operator credential into an application deployment.

## Libraries from the registries developers already use

The Spring Boot starter is available from Maven Central as
`org.basamento.synapsys:synapsys-spring-boot-starter`. The Node.js SDK is available
from npm as `@synapsys-io/sdk`, with CommonJS, ESM, TypeScript declarations, and no
runtime dependencies.

Both integrations preserve the central adoption promise: keep business logic in the
application, mark or register the work, and let the library handle heartbeats,
commands, retries, and lifecycle.

## Output belongs to the execution

Official libraries capture stdout and stderr produced during a process run and send
it with later heartbeats. Operators can open an execution in Core and inspect its
output in context. Normal application output remains intact; capture is a copy, not
a redirect.

Because output can contain application data, the Node.js SDK also lets teams disable
capture independently while keeping process control enabled.

## Operate from desktop or mobile

The Core console adapts its navigation, listings, and controls for smaller screens.
Workers, processes, executions, actions, settings, and execution logs remain
navigable from a mobile browser through the same protected Core endpoint.
