---
title: Processes, cancellation, and tests
description: Register realistic Endless and Progressive Python business logic with decorators or explicit calls.
---

# Processes, cancellation, and tests

Decorators return the original function unchanged. The explicit
`register_endless()` and `register_progressive()` methods are equivalent and useful
in application factories. Functions may accept no argument or one `StopSignal`;
business logic that does not need cancellation is not forced to accept one.

## Endless: inbox consumer

Before Synapsys, keep the listener directly testable and free of SDK imports:

```python title="Before: business.py"
import queue
import threading

class InboxConsumer:
    def __init__(self, inbox: queue.Queue[str], logger):
        self.inbox = inbox
        self.logger = logger

    def consume_until(self, stopped: threading.Event) -> None:
        while not stopped.is_set():
            try:
                message = self.inbox.get(timeout=1)
            except queue.Empty:
                continue
            self.logger.info("message processed", extra={"message_id": message})
            self.inbox.task_done()
```

After adoption, only the composition root knows Synapsys. `StopSignal.event` is the
standard `threading.Event` the existing method already accepts:

```python title="After: app.py"
from basamento_synapsys import StopSignal, Synapsys
from business import InboxConsumer

worker = Synapsys(worker_name="mail-worker")
consumer = InboxConsumer(inbox, application_logger)

@worker.endless(name="inbox-consumer")
def consume_inbox(stop: StopSignal) -> None:
    consumer.consume_until(stop.event)
```

This is one long-lived business invocation. The queue wait and loop belong to the
consumer; the SDK never schedules or repeatedly invokes it. Cancellation is
cooperative.

## Progressive: customer-file import

The finite importer is ordinary code and returns naturally:

```python title="Before: business.py"
class CustomerImporter:
    def import_file(self, path: str) -> int:
        imported = 0
        for customer in read_customers(path):
            save_customer(customer)
            imported += 1
        return imported
```

Because this method does not need in-flight cancellation, register the existing
zero-argument callable directly:

```python title="After: app.py"
importer = CustomerImporter()
worker.register_progressive(
    lambda: importer.import_file("/imports/customers.csv"),
    name="customer-file-import",
)
```

For a large cancellable batch, accept `StopSignal` in the thin adapter and call
`stop.raise_if_requested()` between records. The business method can instead accept
a neutral callback or `threading.Event` if it must remain SDK-free.

## Async and cleanup

`async def` functions use the same decorators. A stop cancels the task at its next
await point; `StopSignal.wait_async()` and `raise_if_requested()` are available.
Existing blocking listeners can register without a signal and expose their native
close method:

```python
worker.register_endless(
    listener.run_forever,
    name="socket-listener",
    on_stop=listener.close,
)
```

Cleanup errors are logged and captured but do not abort stopping. An unrelated
unhandled business exception transitions only that process to `failed`; a later
Core start can run it again. Start and stop commands are idempotent, starts while
stopping are deferred, and no process overlaps itself. The shared rules are in the
[client lifecycle contract](/reference/client-lifecycle).

## Testing recommendations

- Unit-test `InboxConsumer.consume_until()` with a local event and queue; test
  `CustomerImporter.import_file()` directly.
- Verify the adapter registers unique stable names before `start()`.
- In integration tests use `enabled=False`, or a fake Core to exercise command
  tokens, deferred starts, `failed`, malformed responses, and bounded shutdown.
- For async code, test once with `start_async()` on the application's real event-loop
  policy.
