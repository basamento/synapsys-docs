---
title: Processes, cancellation, and tests
description: Register realistic Go Endless and Progressive business logic with and without contexts.
---

# Processes, cancellation, and tests

Every body returns an `error`. An unexpected error or recovered panic transitions
that process to `failed`; normal completion or a cancellation caused by an accepted
stop returns it to `idle`. A panic in a goroutine created by business code is outside
the SDK recovery boundary.

## Endless: event-stream consumer

Before Synapsys, the service is ordinary context-aware Go code:

```go title="Before: consumer.go"
type EventConsumer struct {
    Events <-chan Event
    Log    *slog.Logger
}

func (c *EventConsumer) Consume(ctx context.Context) error {
    for {
        select {
        case <-ctx.Done():
            return ctx.Err()
        case event := <-c.Events:
            c.Log.Info("event handled", "eventId", event.ID)
        }
    }
}
```

After adoption, register the existing method. The process logger gives structured
records both to the application and to Core during this run:

```go title="After: processes.go"
consumer := &EventConsumer{
    Events: events,
    Log:    worker.Logger("event-consumer"),
}

err := worker.Register(
    synapsys.EndlessContext("event-consumer", consumer.Consume),
)
```

This is one invocation containing a genuine consumer loop. The SDK never calls a
finite “receive one event” function repeatedly to fake an Endless process.

## Progressive: customer-file import

Finite work that does not need cancellation remains a zero-argument method:

```go title="Before: importer.go"
type CustomerImporter struct {
    Path string
}

func (i *CustomerImporter) Import() error {
    customers, err := readCustomers(i.Path)
    if err != nil {
        return err
    }
    return saveCustomers(customers)
}
```

Register it without inventing an unused context:

```go title="After: processes.go"
importer := &CustomerImporter{Path: "/imports/customers.csv"}
err := worker.Register(
    synapsys.Progressive("customer-file-import", importer.Import),
)
```

For a large cancellable import, keep an idiomatic `Import(ctx context.Context)`
method and use `ProgressiveContext`. One accepted start invokes it once; returning
naturally is what completes the process.

## Existing stop mechanisms

A blocking legacy listener can stay context-free and expose cleanup:

```go
synapsys.Endless(
    "socket-listener",
    listener.Serve,
    synapsys.WithOnStop(listener.Close),
)
```

Endless cleanup starts as soon as stop is accepted so it can unblock the body.
Progressive cleanup runs after a requested stop. Cleanup errors are reported but do
not abort the lifecycle transition.

Starts and stops are idempotent. A start while stopping remains unacknowledged and
is retried after the old goroutine becomes terminal. No declaration overlaps itself.
See the [shared lifecycle contract](/reference/client-lifecycle).

## Testing recommendations

- Unit-test `Consume` with a cancellable context and `Import` directly; neither test
  needs Synapsys.
- Check registration errors for blank or duplicate names and nil bodies/hooks.
- Use a fake HTTP server to verify exact int64 run IDs, command tokens, log requeue,
  transport failure, malformed responses, and final-heartbeat behavior.
- Run `gofmt -w .`, `go vet ./...`, `go test ./...`, and `go test -race ./...`.
