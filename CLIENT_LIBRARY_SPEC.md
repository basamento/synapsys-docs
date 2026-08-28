# Synapsys client library specification

The contract every official Synapsys client library implements, whatever the
language or framework.

This document is **internal**. It lives outside `content/`, so it is not published
to the docs site. It exists so that the Go, Node, Python and future libraries
behave like the same product rather than four independent interpretations of it.

**Status:** v1, derived from `synapsys-spring-boot-starter` 0.1.0.

## What this covers, and what it does not

The **wire protocol** is specified elsewhere and is not repeated here:

- `content/manuals/raw-api/checklist.md` — everything a correct client must do
- `content/manuals/raw-api/the-heartbeat-loop.md` — request and response shape
- `content/reference/state-machine.md` — legal states and transitions
- `openapi.yaml` in the Core repository — the machine-readable contract

Read the checklist first. It is the protocol source of truth, and a client that
satisfies it is *correct*. This document is about everything that makes such a
client a **library people want to adopt**: naming, configuration, the API a user
writes against, logging, failure behaviour, and packaging.

Where the two disagree, the checklist and `openapi.yaml` win.

---

## 0. Prime directive: adoption cost

**The library must be trivial to add to an application that already exists,
including an old one nobody wants to touch.**

This outranks elegance, feature completeness, and internal purity. Concretely:

- **Add the dependency, set two config values, run.** No mandatory initialisation
  call, no builder, no manual wiring of a client object, no code change at the
  application's entry point.
- **Declaring a process is the only code a user writes.** One annotation,
  decorator, interface, or registration call — whichever is idiomatic — plus a
  method body they already had.
- **Existing code must be adoptable without restructuring.** Someone with a
  fifteen-year-old scheduled job should be able to move its body into a process
  and change nothing else. Assume their code prints to stdout, blocks threads,
  and does not know what a coroutine is.
- **The library must be removable.** Deleting the dependency and the process
  declarations must leave a working application.
- **Defaults must be safe.** Every setting except the Core URL and token has a
  working default.
- **Never fail the host application** for a Synapsys-only problem, unless the
  user explicitly asked for that with `fail-fast`.

When a design choice trades adoption cost against anything else, adoption cost
wins, and the trade gets recorded in this document.

---

## 1. Naming

### 1.1 Package and artifact names

The pattern is `<product>-<language-or-framework>-<kind>`, where `kind` follows
each ecosystem's own vocabulary:

| Ecosystem | Artifact | Notes |
| --- | --- | --- |
| Maven/Gradle | `synapsys-spring-boot-starter` | `-spring-boot-starter` is a term of art; third-party starters must not be prefixed `spring-boot-` |
| npm | `@synapsys-io/node-sdk` | the scope is `@synapsys-io` |
| PyPI | `basamento-synapsys` | flat namespace; an unrelated `synapsys` package already exists |
| Go | `github.com/basamento/synapsys-go-sdk` | the module path is the name; there is no registry |
| NuGet | `Basamento.Synapsys.<Framework>` | prefix reservation applies |

**Do not use the word "starter" outside Spring.** In Node and Go it means
"boilerplate you clone", which is the opposite of a dependency.

### 1.2 The `framework` identifier

Every heartbeat carries a `framework` string telling Core which client is
speaking. Lowercase, no spaces, no version:

```
springboot   go   node   python   dotnet   quarkus
```

Pick it once per library and never change it — Core stores it and operators
filter on it. Never send `unknown`; that is Core's fallback for clients that omit
the field.

### 1.3 Configuration namespace

All settings live under a single `synapsys` namespace, using each ecosystem's
normal casing convention:

```
synapsys.core-url          properties / YAML  (kebab-case)
SYNAPSYS_CORE_URL          environment variables
synapsys.coreUrl           JS/TS object config
synapsys_core_url          Python
```

The **canonical name is the kebab-case form**. Every other spelling is a
transliteration of it, and documentation uses the canonical name when discussing
a setting in the abstract.

### 1.4 User-facing type names

Keep these recognisable across languages, so documentation and support
conversations transfer:

| Concept | Name |
| --- | --- |
| Marker that a class/function is a Synapsys process | `SynapsysProcess` |
| Base type for a process that runs until stopped | `EndlessProcess` |
| Base type for a process that runs to completion | `ProgressiveProcess` |
| Cooperative stop signal handed to endless processes | `StopSignal` |
| Optional cleanup hook | `onStop` |
| Body of an endless process | `runForever` |
| Body of a progressive process | `run` |

Prefix with `Abstract`, suffix with `Base`, or drop the affix entirely as the
language demands. Keep the root word.

---

## 2. Configuration

Every library implements this set. Names are canonical; defaults are normative.

| Setting | Default | Required | Meaning |
| --- | --- | --- | --- |
| `synapsys.core-url` | — | **yes** | Base URL of Core. |
| `synapsys.core-token` | — | no\* | Bearer token. |
| `synapsys.worker-name` | framework's app name | **yes** | Identity across restarts. Fail startup if unresolvable. |
| `synapsys.enabled` | `true` | no | `false` disables heartbeats and console capture entirely. |
| `synapsys.host` | machine hostname | no | Reported to Core. Null is allowed; Core falls back to the remote address. |
| `synapsys.heartbeat-interval` | `5s` | no | Positive whole seconds. Reject fractional values. |
| `synapsys.fail-fast` | `false` | no | Fail application startup when Core is unreachable. |
| `synapsys.connect-timeout` | `2s` | no | TCP connect timeout. |
| `synapsys.request-timeout` | `5s` | no | Whole-request timeout. |

\* Not required by the library, but Core rejects heartbeats without it. Warn
loudly at startup rather than failing.

### Rules

- **`enabled: false` must be a complete no-op.** No heartbeat task, no console
  capture, no network calls, no startup validation. This is what makes the
  library safe inside a test suite, and it is the reason the setting exists.
- **Unknown keys under `synapsys.*` should fail startup** where the framework
  supports strict binding. A typo that silently leaves a default in place is
  worse than a crash. Where strict binding is unavailable, log a warning naming
  the unrecognised keys.
- **Timeouts are mandatory.** A client with no request timeout will eventually
  hang its loop against a wedged Core.
- Startup **echoes the resolved configuration once** at INFO — worker name,
  process count, Core URL, host, interval. This turns "why is nothing appearing
  in the console" into a five-second diagnosis.

---

## 3. The user-facing API

A user declares a process by writing a class or function that:

1. is marked as a Synapsys process, idiomatically for the language;
2. supplies a **name**, defaulting to something stable and derivable (class name,
   function name, registration key) when not given explicitly;
3. implements exactly one body — `runForever` or `run`;
4. optionally implements `onStop`.

Names are **unique per worker**. Two processes sharing a name is a startup
failure, not a warning: Core addresses processes by name within a worker, and a
duplicate silently misroutes commands.

Discovery is idiomatic — reflection and component scanning where that is the
norm, an explicit registration list where it is not. **Explicit registration is
acceptable and often better**: it costs the user one line and removes an entire
class of "why wasn't my process picked up" problems.

### Endless processes

```
process Poller is endless:

    runForever(stopSignal):
        while not stopSignal.isStopRequested():
            doWork()
            sleep(5s)

    onStop():                     # optional
        releaseResources()
```

The contract: the body **polls the stop signal cooperatively** and returns
promptly once it is set. The library additionally interrupts or cancels the
underlying thread where the language allows, but must not rely on that alone.

### Progressive processes

```
process MonthlyReport is progressive:

    run():
        for item in items:
            checkCancelled()      # library-provided cancellation point
            process(item)
```

The contract: the body **runs to completion**, and reaching the end returns the
process to `idle` on its own.

---

## 4. Behaviour

### 4.1 Startup

```
on application start:
    if not config.enabled:
        return                                  # complete no-op

    validate config:
        heartbeat-interval is a positive whole number of seconds  else fail startup
        core-url is present                                       else fail startup
        worker-name resolves                                      else fail startup
        core-token is present                                     else WARN, continue

    processes = discover()
    assert names are unique                                       else fail startup

    reachable = GET {core-url}/api/health
    if not reachable:
        if config.fail-fast: fail startup
        else: WARN "Core is unreachable at {url} | heartbeat retries will continue"

    install console capture
    log INFO "Worker '{name}' registered {n} process(es) | core={url} host={host} heartbeat={interval}"
    start heartbeat loop
```

Startup **never blocks on Core being available** unless `fail-fast` is set. A
worker that starts while Core is down and converges when it returns is the normal
case, not an error.

### 4.2 The heartbeat loop

```
every heartbeat-interval:
    try:                                        # nothing escapes this block
        tick()
    catch anything:
        log ERROR "Unexpected heartbeat failure | heartbeat retries will continue"
```

> **The loop must be unkillable.** On many runtimes a scheduled task that throws
> is cancelled permanently, and the worker then goes silent with no further
> output. Wrap the whole tick, catch the broadest error type the language has,
> and never rethrow.

```
tick():
    logs = logQueue.drain(maxEntries: 100, maxBytes: 96_000)   # UTF-8 bytes

    payload = {
        workerName:        config.worker-name,
        framework:         "<this library's identifier>",
        host:              config.host,
        heartbeatInterval: interval in whole seconds,
        processes: [ for each process:
            { name, type, currentState, ackToken, runId } ],
        logs: logs
    }

    try:
        response = POST {core-url}/api/v1/workers/heartbeat
                        body:    payload
                        headers: Authorization: Bearer {core-token}
                        timeouts: connect, request
    catch transportError as e:
        logQueue.requeueFront(logs)             # do not lose them
        markCoreUnavailable("Failed to contact Core", cause: e)
        return

    if response.status not in 2xx:
        logQueue.requeueFront(logs)
        markCoreUnavailable("Heartbeat rejected by Core with status {status}")
        return

    markCoreAvailable()
    applyCommands(response)
```

Not optional:

- **Send every process on every beat**, including idle ones. Silence is how Core
  decides a worker is gone.
- **Requeue drained logs at the front on any failure.** Dropping them on a
  transient network error loses exactly the output the user needs.
- **Parse responses leniently.** Unknown fields are ignored, never rejected — see
  §7.2.

### 4.3 Applying commands

```
applyCommands(response):
    for update in response.processes:
        process = findByName(update.name)
        if process is null:
            log WARN "Core sent a command for unknown process '{name}' | ignoring"
            continue                            # never fatal

        try:
            apply(process, update)
        catch anything as e:
            log ERROR "Command handling failed for process '{name}'"
            process.currentState = failed
            # ackToken deliberately not advanced: Core redelivers next beat
```

```
apply(process, update):
    token = update.desiredToken
    if token is absent: return                  # nothing to do

    process.runId = update.runId                # track even for known tokens
    if token <= process.ackToken: return        # duplicate or stale

    process.desiredState = update.desiredState
    process.desiredToken = token

    if update.desiredState == "idle":     command = none    # NOT a stop
    if update.desiredState == "running":  command = start
    if update.desiredState == "stopping": command = stop

    if command == start:
        log INFO "Starting process '{name}' (type={type}, token={token}, runId={runId})"
        process.handleStart(update.runId)
    if command == stop:
        log INFO "Stopping process '{name}' (type={type}, token={token})"
        process.handleStop()

    process.ackToken = token                    # only after the handler returned
```

> **`idle` is not a stop.** Core resets `desiredState` to `idle` to mean "no
> outstanding command". A client that reads it as an instruction shuts down
> everything it owns on the first quiet beat.

> **Acknowledge after, never before.** If the handler throws, the token stays
> unacknowledged and Core redelivers. A client that acknowledges first and then
> crashes has silently lost the command.

**One failing process must never affect another.** Isolation is per-process,
inside the loop, as above.

### 4.4 Process lifecycle

```
endless.handleStart(runId):
    if state in (running, stopping): return
    state = running                             # BEFORE the thread starts
    spawn thread:
        with logCaptureScope(name, runId):
            try:
                runForever(stopSignal)
            catch cancellation:
                pass
            catch error as e:
                state = failed
                captureToCore(e)
                log ERROR "Endless process '{name}' failed"
                # never rethrow: it would surface raw on the host's console
        if state != failed: state = idle
```

> **Set `running` synchronously, before the worker thread starts.** Setting it
> inside the thread leaves a window where a second start command observes `idle`
> and spawns a duplicate.

```
endless.handleStop():
    if state != running: return
    state = stopping
    stopSignal.set()
    try: onStop()
    catch error: log ERROR, continue            # cleanup must not abort the stop
    interrupt/cancel the worker thread if the language allows
```

```
progressive.handleStart(runId):
    if state not in (idle, failed): return
    if a run is still in flight: return
    state = running                             # BEFORE submitting
    submit to this process's own executor:
        with logCaptureScope(name, runId):
            try:
                run()
            catch cancellation:
                cancelled = true
            catch error as e:
                state = failed
                captureToCore(e)
                log ERROR "Progressive process '{name}' failed"
                # never rethrow: it would vanish into an uninspected future
        if cancelled or stopRequested:
            try: onStop()
            catch error: log ERROR
        if state != failed: state = idle
```

```
progressive.handleStop():
    if no run in flight: return
    stopRequested = true
    state = stopping
    cancel the run
```

**Each progressive process gets its own isolated execution context** — a
dedicated single-thread executor, goroutine, or task queue. A shared pool lets
one slow process block another's start command.

### 4.5 Shutdown

```
on application stop:
    uninstall console capture              # restore the original streams
    stop the heartbeat loop
    cancel process executors
    log INFO "Worker stopped"
```

Shutdown must be **idempotent and non-throwing**. It runs during teardown, where
an exception is at best noise and at worst masks the real cause.

---

## 5. Console capture

Output a process writes while running is streamed to Core and shown against that
run. This is one of the main reasons to use a library rather than call the API
directly, and the feature most likely to be implemented badly.

```
install():
    remember the original stdout/stderr
    replace them with a tee that writes through to the original
    and, when the current execution context belongs to a process, enqueues a line

open(processName, runId) -> scope:
    binds the current thread/task/context to that process,
    restoring the previous binding on close

uninstall():
    restore the original streams, but only if they are still ours
```

Rules:

- **The application's own console must be unaffected.** Everything still reaches
  the real stdout/stderr, in order. A tee, never a redirect.
- **Capture only inside an execution scope.** Output from application code that is
  not running a process is not Synapsys's business.
- **Bind by execution context** — thread-local, async-local, context variable —
  never globally. Two concurrent processes must not interleave.
- **Bound the queue** (10,000 entries) and **truncate long lines** (16,000
  characters), dropping oldest on overflow. A runaway loop must not exhaust
  memory.
- **Budget the batch in bytes, not characters** — 96 KB per beat, measured as
  UTF-8. Character counts under-measure by up to 4× on non-Latin scripts.
- **Attach a monotonic sequence number per run**, so Core can order lines sharing
  a timestamp.
- **Always uninstall on shutdown.** Replacing global streams and never restoring
  them leaks across application contexts and breaks test suites.
- Capture stderr as level `error`, stdout as `info`.
- Capture uncaught process exceptions as stderr lines, so the stack trace reaches
  the console in Core.

Where a language makes global stream replacement genuinely unsafe, capture at the
logging-framework level instead and **say so in that library's README**. Do not
silently ship without the feature.

---

## 6. Logging

The library logs through the **application's own logging framework**, never to
stdout directly.

### Prefix

Every line the library emits starts with:

```
[Synapsys] 
```

One space after the bracket. This is what lets a user grep the library out of
their logs, and lets support ask them to. It applies to exception messages the
library raises, too.

### Levels

| Level | Use for | Examples |
| --- | --- | --- |
| `ERROR` | The library or a process failed in a way the user must see | process crashed, command handler threw, unexpected loop error |
| `WARN` | Degraded but self-correcting, or misconfiguration | Core unreachable, missing token, unknown process name from Core |
| `INFO` | Lifecycle events expected at human frequency | startup summary, process started/stopped, connection restored, worker stopped |
| `DEBUG` | Diagnostics | per-process discovery, health-check URL and result, repeated failures |

### Rules

- **Nothing at INFO on a per-heartbeat cadence.** A worker beating every five
  seconds must be silent in a healthy steady state. This is the most common way a
  client library makes itself unwelcome.
- **Log transitions, not states.** "Core connection restored" once, not "Core is
  up" forever. Repeated failures drop to DEBUG after the first WARN.
- **Always log the cause.** A bare "Failed to contact Core" with no exception
  gives the user no way to tell DNS from TLS from a timeout.
- **Never log the token**, in any form, at any level — including inside URLs,
  request dumps, and exception messages.
- **Never let a library exception reach the user's console uncaught.** A raw stack
  trace with no prefix, from a thread they did not create, is the worst possible
  failure presentation.
- Include the process name, quoted, in every process-scoped message: `'my-poller'`.
- Structured key/value context is preferred where the ecosystem supports it; the
  prefix stays regardless.

---

## 7. Resilience invariants

The properties that separate a library people trust from one they rip out. Each
has cost real debugging time somewhere.

1. **The heartbeat loop can never die.** Catch everything at the tick boundary.
2. **Unknown response fields are ignored.** Core evolves independently; a client
   that rejects a new field breaks in the field, at a moment the user cannot fix,
   for a reason they cannot see. Configure the JSON parser explicitly — most
   default to strict.
3. **One process cannot affect another.** Isolate command handling and execution
   per process.
4. **User code exceptions never propagate into library machinery.** Catch at the
   boundary, record `failed`, report through the logger.
5. **Core being down is not an error state for processes.** Keep running, keep
   retrying. Never stop a process because a heartbeat failed.
6. **Command state survives a Core restart.** It lives in Core's database; the
   client simply keeps reporting its `ackToken`.
7. **Never open an inbound port.** Everything is outbound.
8. **Startup never hangs.** Every network call has a timeout.
9. **The library is removable and disableable** — see §0 and `synapsys.enabled`.

---

## 8. Security

- Send the token as `Authorization: Bearer {token}`. Never in a query string,
  never in a URL, never logged.
- **Warn when the Core URL is not HTTPS and a token is set**, unless the host is
  loopback. A bearer token over plaintext HTTP is a credential leak, and the user
  usually has not noticed.
- **Do not follow redirects**, or disable them if the HTTP client follows by
  default. A redirect can forward the `Authorization` header to another host.
- Document that console capture **transmits process output to Core**, including
  anything the user prints. This is the feature working as designed, and also a
  data path they must be able to reason about. It must be disableable.
- Do not require, read, or store any credential other than the Core token.

---

## 9. Testing

Beyond the protocol tests in `raw-api/checklist.md`, every library proves:

- [ ] A second start command while running does **not** create a second execution.
- [ ] A process whose body throws ends in `failed`, and the exception does not
      reach the host console uncaught.
- [ ] A process whose `onStop` throws still stops, and the heartbeat survives.
- [ ] A command handler that throws does not prevent other processes receiving
      commands on the same beat, and does not kill the loop.
- [ ] A heartbeat response containing unknown fields parses successfully.
- [ ] Console capture restores the original streams on uninstall.
- [ ] Log batching respects the byte budget with multi-byte characters.
- [ ] Drained logs are not lost when the heartbeat fails.
- [ ] `enabled: false` produces zero network calls and unmodified streams.
- [ ] Startup with Core down succeeds; with `fail-fast` it fails.

---

## 10. Packaging and release

- **Publish to the ecosystem's default public registry.** A user must not have to
  add a custom repository.
- **Semantic versioning.** Libraries version independently; none has to match
  Core's version.
- Declare the **minimum runtime version** and keep it conservative. Legacy
  applications are an explicit target — see §0.
- **Keep the dependency footprint minimal.** Prefer the standard library. Every
  transitive dependency is a potential conflict in someone else's build, and a
  conflict at that layer is a reason not to adopt.
- Ship a README containing at minimum: install snippet, one example of each
  process type, the full settings table, and the licence.
- Releases are cut from a tag by CI, never from a developer machine.

---

## 11. Keeping this document current

When a change affects more than one library:

1. Update this document **first**, in the same change that alters the reference
   implementation.
2. If the change touches the wire protocol, update `openapi.yaml` and
   `raw-api/checklist.md` — those, not this file, are the protocol's source of
   truth.
3. Record it below, so each library can see what it owes.

### Change log

| Date | Change | Libraries affected |
| --- | --- | --- |
| 2026-08-28 | Initial specification, extracted from `synapsys-spring-boot-starter` 0.1.0 | all future |

### Known gaps in the surrounding contract

Found while writing this document; not yet resolved:

- `openapi.yaml` does **not** document the `logs` array in `HeartbeatRequest`,
  although Core accepts and stores it and the Spring starter sends it on every
  beat.
- `openapi.yaml` declares **no security scheme**, although Core requires a bearer
  token on the heartbeat endpoint.

Both should be fixed in the Core repository before a second library is written
against the OpenAPI file.
