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

- **Add the dependency, set two config values, run.** No initialisation call where
  the framework provides a lifecycle to hook; exactly one otherwise. No builder, no
  manual wiring of a client object, and no code change beyond the entry point.

  Spring, Nest and Fastify all expose a lifecycle, so those integrations start
  themselves and cost the user nothing. Plain Node, Go and Python have nothing to
  hook, and a single explicit `start()` is the honest minimum there — inventing an
  import side effect to avoid it would be worse, because it cannot be disabled,
  ordered, or removed.
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
| npm | `@synapsys-io/sdk` | the scope is `@synapsys-io`; on npm the ecosystem is implied, so it is not repeated in the name |
| PyPI | `basamento-synapsys` | flat namespace; an unrelated `synapsys` package already exists |
| Go | `github.com/basamento/synapsys-go-sdk` | the module path is the name; there is no registry |
| NuGet | `Basamento.Synapsys.<Framework>` | prefix reservation applies |

**Do not use the word "starter" outside Spring.** In Node and Go it means
"boilerplate you clone", which is the opposite of a dependency.

### 1.2 The `framework` identifier

Every heartbeat carries a `framework` string telling Core which client is
speaking. Lowercase, no spaces, no version:

```
springboot   nodejs   python   go
```

**Core validates this field against a fixed set.** `WorkerFramework.Valid()` accepts
`springboot`, `nodejs`, `python`, `go` and `unknown`, and coerces anything else to
`unknown` — the exact failure this rule exists to prevent. A new library must have
its identifier added to Core's enum, to the filter list in `collection.go`, and to
the frontend card types, **before** the library ships. Until that is done, `dotnet`
and `quarkus` are not usable values.

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
| `synapsys.shutdown-timeout` | `10s` | no | How long shutdown waits for running processes to become terminal. Languages with a caller-supplied deadline — Go's `ctx` — use that instead of a setting. |
| `synapsys.capture-console` | `true` | no | Stream process-scoped output to Core. Global stream replacement is not safe in every ecosystem; see §5 and §8. |

\* Not required by the library, but Core rejects heartbeats without it. Warn
loudly at startup rather than failing.

Libraries may add settings their ecosystem needs — a Node client accepts a `logger`
object, because Node has no ambient logging framework to discover. Additions are
recorded in the change log, and anything that turns out to be general is promoted
into this table.

### Rules

- **`enabled: false` must be a complete no-op.** No heartbeat task, no console
  capture, no network calls, no startup validation. This is what makes the
  library safe inside a test suite, and it is the reason the setting exists.
- **Unknown keys under `synapsys.*` fail startup, in every language.** A typo that
  silently leaves a default in place is worse than a crash: the worker runs on
  defaults forever and nothing says why. Where the framework binds strictly, turn
  that on — the Spring starter uses `ignoreUnknownFields = false`. Where the
  language would otherwise ignore an unrecognised key, as a plain JavaScript object
  or a Python `**kwargs` does, **validate the option set explicitly and raise**. The
  error names both the keys that were passed and the full set that was expected:

  ```
  [Synapsys] Unknown Synapsys options: 'heratBeatinterval'. Expected any of:
  'enabled', 'coreUrl', 'coreToken', 'workerName', ...
  ```

  This check runs **even when `enabled` is false**. A disabled test run is exactly
  where such a typo would otherwise hide. It is a check on the arguments the caller
  passed, not startup validation, so the no-op rule above does not exempt it.

- **Durations carry units.** Every duration setting is written `'30s'`, `'5m'`,
  `'250ms'` or `'2h'`, in whatever spelling the ecosystem uses for such a literal. A
  plain number is accepted and means **milliseconds**, but a unitless string is
  rejected with a message naming both forms: `'30'` reads as seconds to about half
  the people who write it, and guessing either way is silently wrong for the other
  half.

  `heartbeat-interval` is further constrained to a positive whole number of seconds,
  because the wire format has no other representation. `'1500ms'` is a startup
  failure, never a silent rounding.

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
schedule the next beat one heartbeat-interval AFTER the previous one settles:
    try:                                        # nothing escapes this block
        tick()
    catch anything:
        log ERROR "Unexpected heartbeat failure | heartbeat retries will continue"
```

> **Fixed delay, never fixed rate.** A fixed-rate scheduler tries to catch up: a Core
> that answers slower than one interval leaves a backlog that fires back to back the
> moment it recovers, which is a burst aimed at a service that has only just come
> back. Re-arm the timer after each tick settles instead. This also makes overlap
> impossible; where a scheduler can still overlap — `setInterval` on Node — an
> explicit in-flight guard skips the beat rather than stacking it. Timing uses the
> platform's monotonic clock wherever one is available, so a wall-clock adjustment
> cannot produce a burst either.

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

    if response.body is not a readable HeartbeatResponse:
        logQueue.requeueFront(logs)
        markCoreUnavailable("Core returned a malformed heartbeat response")
        return

    markCoreAvailable()
    applyCommands(response)
```

> **A 2xx that is not a readable response is a failure, not a quiet success.**
> `processes` is required by `HeartbeatResponse`, so an empty body, an unparseable
> one, or one with no `processes` array all mean the same thing: this beat delivered
> no commands. Treating it as success acknowledges nothing while silently discarding
> the drained log lines, and hides a broken proxy or a half-written response behind a
> worker that looks healthy. Requeue and mark Core unavailable, exactly as for a
> transport failure. This is about the response's *shape*: unknown **fields**, and
> desired states this client version has never heard of, are still ignored — see §7.2.

Not optional:

- **Send every process on every beat**, including idle ones. Silence is how Core
  decides a worker is gone.
- **Requeue drained logs at the front on any failure.** Dropping them on a
  transient network error loses exactly the output the user needs.
- **Parse responses leniently.** Unknown fields are ignored, never rejected — see
  §7.2.
- **`runId` is an opaque 64-bit token, never a number to compute with.** Core
  generates it from the wall clock in nanoseconds, so it is a 19-digit int64. Any
  language whose JSON numbers are IEEE-754 doubles — JavaScript above all, but also
  Lua, and Java/C# clients that deserialise into `double` — silently rounds it and
  echoes back a value that is close to, but not, what Core sent.

  The failure is invisible from both ends. The heartbeat still succeeds, nothing is
  logged, and Core's log ingestion joins on `run_id`, matches no execution, and
  discards the lines *deliberately*, so that stale logs cannot fail a healthy
  heartbeat. The symptom is console output that never appears, with nothing
  anywhere to explain it.

  Carry it as a string, a big integer, or the language's native int64, and echo it
  back byte for byte. **Send it as a JSON number**: Core's DTO is `*int64` and Go
  will not unmarshal a JSON string into one. `ackToken` and `desiredToken` are also
  int64, but they are small increments and safe as ordinary numbers — they are also
  compared numerically, so they must stay numbers.

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

    if token <= process.ackToken: return        # duplicate or stale

    process.desiredState = update.desiredState
    process.desiredToken = token

    if update.desiredState == "idle":     command = none    # NOT a stop
    if update.desiredState == "running":  command = start
    if update.desiredState == "stopping": command = stop

    if command == start:
        log INFO "Starting process '{name}' (type={type}, token={token}, runId={runId})"
        outcome = process.handleStart(update.runId)
    if command == stop:
        log INFO "Stopping process '{name}' (type={type}, token={token})"
        outcome = process.handleStop()

    if outcome != deferred:
        process.ackToken = token                # only after the handler returned
```

> **`idle` is not a stop.** Core resets `desiredState` to `idle` to mean "no
> outstanding command". A client that reads it as an instruction shuts down
> everything it owns on the first quiet beat.

> **Acknowledge after, never before.** If the handler throws, the token stays
> unacknowledged and Core redelivers. A client that acknowledges first and then
> crashes has silently lost the command.

> **A start received while the previous run is `stopping` is deferred.** Do not
> acknowledge it and do not replace the old run's `runId`. Core redelivers the
> same token; as soon as the old goroutine/task is terminal, start the new run and
> acknowledge it. Acknowledging the start as a no-op loses the new run forever.

**One failing process must never affect another.** Isolation is per-process,
inside the loop, as above.

### 4.4 Process lifecycle

```
endless.handleStart(runId):
    if state == stopping: return deferred
    if state == running: return handled
    process.runId = runId
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
    return handled
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
    if state == stopping or a run is still in flight: return deferred
    if state == running: return handled
    process.runId = runId
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
    return handled
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
    deadline = now + shutdown budget            # synapsys.shutdown-timeout, or ctx
    stop the normal heartbeat loop and prevent another beat from starting
    request cooperative stop for every running process
    wait until deadline for processes to become terminal
        for each still in flight at the deadline:
            log WARN "Process '{name}' did not stop before the shutdown timeout"
    if now < deadline:
        send one best-effort final heartbeat with final states and queued logs
            bounded by min(deadline - now, request-timeout)
            ignore commands in its response
            log transport failure locally; never fail or extend shutdown for it
    else:
        log DEBUG "Shutdown budget exhausted | skipping the final heartbeat"
    uninstall console capture / close transport resources
    log INFO "Worker stopped"
```

**The deadline is a hard bound on the whole sequence.** If it is already exhausted
when the processes have been waited for — or was zero on entry — the final heartbeat
is **skipped**, not attempted with a fresh timeout. A library that sends it anyway
runs past the deadline its caller set, which is the one thing a shutdown bound exists
to prevent. Losing one snapshot is cheaper than blocking a container's termination
grace period, and Core marks the worker inactive on its own soon after.

**Order matters at the end.** Console capture is uninstalled *after* the final
heartbeat, so that everything the stop sequence printed — cleanup hooks included —
gets one chance to reach Core.

**Shutdown is idempotent, non-throwing, and safe to call concurrently.** A second
call while the first is still running joins it or returns; it never starts a second
teardown, and exactly one final heartbeat is sent however many times it is called.

**A process that outlasts the budget is reported, not killed.** No language here can
safely stop a thread, goroutine or task it does not own. Such a process is named in a
WARN, kept observed, and — this is the part that matters — still counts as in flight,
so a later start command is deferred rather than overlapping it (§4.4).

Shutdown must be **idempotent and non-throwing**. It runs during teardown, where
an exception is at best noise and at worst masks the real cause. Business logic
that ignores cancellation may remain alive after the bound: the library cannot
safely kill a thread or goroutine. The application owns the final decision to
keep waiting or exit.

In Go, returning `ctx.Err()` from `Worker.Stop(ctx)` when business goroutines miss
the caller's deadline is the idiomatic non-panicking form of that last decision.
Transport or final-heartbeat failures are logged but never included in the return
value.

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
  them leaks across application contexts and breaks test suites. Restore only if
  the streams are still yours: something installed on top of you must not be
  clobbered.
- Capture stderr as level `error`, stdout as `info`.
- Capture uncaught process exceptions as stderr lines, so the stack trace reaches
  the console in Core.
- **Never enqueue a line whose trimmed message is empty**, and never one with a null
  `runId`. `sequence` must also be 1 or greater. Core now skips an unreadable log
  entry and keeps the rest of the beat, as it always did for `processes`, so one such
  line no longer costs the worker its commands — but it is silently dropped, and a
  client that emits them is throwing away output it believes it sent. Send only
  entries Core can store.
- **Console capture must be individually disableable**, separately from
  `synapsys.enabled`. §8 requires it, because capture is a data path out of the
  application that a user must be able to reason about and switch off without
  losing remote control of their processes. The canonical setting is
  `synapsys.capture-console`, default `true`.

Where a language makes global stream replacement genuinely unsafe, capture at the
logging-framework level instead and **say so in that library's README**. Do not
silently ship without the feature.

**Where global replacement is used, its limits are documented, not glossed over.**
Java (`System.setOut`), Node (`process.stdout.write`) and Python (`sys.stdout`) all
replace a process-wide stream, and each library's README states plainly: only one
capture is installed per process; only output that actually travels through the
replaced entry point is captured, so a logger holding the original stream or writing
to a file descriptor bypasses it; the originals are restored on shutdown only if they
are still the ones the library installed, so a wrapper installed on top is never
clobbered; the library's own log lines bypass the capture entirely, through handles
taken before installation, so it can neither recurse nor ship its own diagnostics to
Core as user output; and the queue, line length and per-beat batch are all bounded,
dropping oldest.

**Go exception.** Go's stdout and stderr are process-global, while goroutines have
no goroutine-local storage. Replacing `os.Stdout`/`os.Stderr` cannot reliably tell
which concurrent process produced a line and can interfere with the host
application. The Go SDK therefore captures only explicit process-scoped sinks: a
`*slog.Logger` and/or `io.Writer` supplied by the worker. They tee to the
application's destination while queueing the same lines for Core. The sinks work
with the standard `log` package (`log.New(writer, ...)`), `slog`, and third-party
loggers that accept an `io.Writer` or `slog.Handler`. Plain `fmt.Print` and writes
directly to `os.Stdout`/`os.Stderr` are not captured. `synapsys.capture-console`
enables or disables these sinks; it never swaps global streams in Go.

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
- **The startup health probe is unauthenticated.** Core serves `GET /api/health`
  without a security scheme, and a credential is not sent to an endpoint that does not
  ask for one: every place a token travels is a place it can leak. Bearer
  authentication applies to `POST /api/v1/workers/heartbeat` and nothing else.
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
- [ ] A start received while the previous run is `stopping` is **not** acknowledged,
      does not replace the active `runId`, does not start a second execution, and is
      applied when Core redelivers it after that run becomes terminal.
- [ ] A duplicate start for the running execution is a handled no-op that does not
      reassign the active `runId`; a stop for an inactive process is a handled no-op.
- [ ] A body that ignores cancellation outlasts the shutdown budget, is reported by
      name, is not killed, and blocks a replacement execution from overlapping it.
- [ ] Shutdown sends exactly one final heartbeat, ignores its response commands, and
      survives that heartbeat failing, timing out, or being skipped for an exhausted
      budget.
- [ ] Shutdown is idempotent under repeated and concurrent calls.
- [ ] A 2xx heartbeat response that is empty or unparseable requeues its logs in
      order and acknowledges nothing.
- [ ] A slow Core delays the loop instead of producing a catch-up burst, and two
      heartbeats are never in flight at once.

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
| 2026-08-28 | npm artifact renamed `@synapsys-io/node-sdk` → `@synapsys-io/sdk`; on npm the ecosystem is implied by the registry | Node |
| 2026-08-28 | §1.2 framework identifier for Node corrected `node` → `nodejs`, to match the value Core's `WorkerFramework.Valid()` actually accepts; noted that Core's enum gates every future library's identifier | Node, Go, .NET |
| 2026-08-28 | §0 relaxed: "no initialisation call" becomes "none where the framework provides a lifecycle; exactly one otherwise". Plain Node, Go and Python have nothing to hook | Node, Go, Python |
| 2026-08-28 | §2 new rule: **durations carry units**, a bare number means milliseconds, a unitless string is rejected | all |
| 2026-08-28 | §2 new rule: **unknown options fail startup in every language**, including dynamic ones where the runtime would ignore them, and the check runs even when disabled | all |
| 2026-08-28 | §5 new rules: never enqueue a blank-message or null-`runId` log line, because Core rejects the whole heartbeat for one; console capture must be individually disableable via `synapsys.capture-console`, now in the §2 settings table | all |
| 2026-08-28 | §2 notes that libraries may add ecosystem-specific settings; Node adds `logger`, `log-level` | all |
| 2026-08-28 | §4.2 new rule: **`runId` is an opaque int64** and must round-trip exactly. Found in the Node SDK, where JSON.parse rounded Core's 19-digit nanosecond id and every captured log line was then silently discarded by Core | all, especially JS/TS |
| 2026-08-28 | Core no longer rejects a heartbeat for one unreadable `logs` entry: it skips the entry and applies the rest, as it already did for `processes`. §5's client rule is unchanged; its rationale is not | all |
| 2026-08-29 | Core, its framework filter, and the console now recognize the `go` framework identifier | Go, Core |
| 2026-08-29 | §4 defines start-while-stopping as a deferred, unacknowledged command, preserving the active run id until the old run is terminal | all |
| 2026-08-29 | §4.5 defines bounded cooperative shutdown followed by one best-effort final heartbeat whose response commands are ignored | all |
| 2026-08-29 | §5 records Go's process-scoped `slog`/`io.Writer` capture contract and prohibits unsafe global stdout/stderr interception | Go |
| 2026-08-29 | §4.2 new rule: **heartbeats are scheduled at a fixed delay, never a fixed rate**, and never overlap. A slow Core delays the loop rather than producing a catch-up burst | all |
| 2026-08-29 | §4.2 new rule: a **2xx heartbeat response that is empty or not a readable `HeartbeatResponse` is a protocol failure** — requeue the drained logs, acknowledge nothing, mark Core unavailable. Unknown *fields* remain ignored | all |
| 2026-08-29 | §4.5 tightened: the shutdown budget is a **hard bound on the whole sequence**. The final heartbeat is bounded by `min(remaining budget, request-timeout)` and **skipped entirely** when the budget is already exhausted. Capture is uninstalled after it, not before. Shutdown is idempotent under concurrent calls and sends exactly one final beat | all |
| 2026-08-29 | §2 new setting `synapsys.shutdown-timeout`, default `10s`, for languages with no caller-supplied deadline. Go keeps using `ctx` | Node, Python, Spring |
| 2026-08-29 | §8 new rule: the **startup health probe is unauthenticated**, matching Core, which serves `/api/health` with no security scheme | all |
| 2026-08-29 | §5 requires each library that replaces a global stream to document the limits of doing so in its README | Node, Python, Spring |
| 2026-08-29 | §9 checklist extended with the deferred-start, shutdown, malformed-response and scheduling cases | all |
| 2026-08-29 | Node, Python and Spring brought in line with §4.3–§4.5: deferred starts, run-id preservation, bounded shutdown with a final heartbeat. Spring gains `capture-console`, which §2 had required and it did not implement — and which `ignoreUnknownFields = false` had been turning into a startup failure | Node, Python, Spring |

### Known gaps in the surrounding contract

**Closed since v1.** `openapi.yaml` now documents the `logs` array in
`HeartbeatRequest` and declares the `bearerAuth` security scheme. Both were fixed in
the Core repository before the Node SDK was written against them.

Also closed: `ProcessLogCapture` in the Spring starter skipped only `line.isEmpty()`,
so a process printing a line of whitespace enqueued a blank-message entry that Core
rejected the whole heartbeat for — dropping every process command on that beat — and
that the client requeued at the front and retried forever, leaving the worker deaf to
start and stop. Fixed on the starter's `main` by skipping a line whose trimmed
message is empty, using Go's definition of whitespace rather than Java's narrower
one; it ships in 0.1.2, which is not yet on Central. Core was hardened in the same
change: `toSyncServiceRequest` now skips an unreadable log entry and keeps the rest
of the batch, mirroring what it has always done for `processes`, so no client can
wedge itself this way again — which is what actually closes the gap for workers
already running an older starter. `openapi.yaml` documents the new skip semantics.

Open, found while aligning the Node, Python and Spring libraries with this document:

- **The Go SDK accepts an empty 2xx heartbeat body as success.** `transport.heartbeat`
  decodes only a non-empty body, so a 200 with no body yields an empty
  `heartbeatResponse` and the beat is treated as healthy. Under the §4.2 rule added on
  2026-08-29 that is a protocol failure. Go is otherwise the reference for every rule
  in §4; this one case is a divergence to fix in the Go SDK, not a licence for the
  other libraries to copy it. Malformed (as opposed to empty) JSON is already handled
  correctly there.

- **`ProcessInfoDTO` in the Spring starter is shared between request and response**, so
  the worker used to echo its own `desiredState` and `desiredToken` back to Core on
  every beat. Harmless — Core ignores unknown request fields — but it is not what
  `HeartbeatProcess` in `openapi.yaml` describes. Both fields are now omitted from the
  request. Splitting the DTO in two would express the asymmetry better than the
  `NON_NULL` annotations that currently carry it.

Open, found while writing the Node SDK:

- **Core's `WorkerFramework` enum must be extended for each planned library.** Go
  is now accepted end to end. `dotnet` and `quarkus` would still be recorded as
  `unknown`; their enum, filter, and frontend values must be added before those
  libraries ship.

- **Core uses `time.Now().UnixNano()` as the `runId`.** It is unique and cheap, but
  it is also a 19-digit int64 that no IEEE-754 double can represent, which cost the
  Node SDK a silent log-loss bug before release. Clients can and now do handle it,
  but a smaller monotonic counter, or a string id, would remove the trap for every
  future library. Worth considering before a third client is written.

- **Workers flap after a single missed beat.** `toNeuronDTO` marks a worker inactive
  after one heartbeat interval, which disables the Start/Stop buttons in the
  console. A 2.5–3x grace multiplier was proposed and deferred.
