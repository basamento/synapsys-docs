---
title: Processes and logs
description: Define endless and progressive Spring Boot processes, cooperate with stop commands, and inspect captured output.
---

# Processes and logs

The starter supports two process types: **endless** work that runs until stopped,
and **progressive** work that completes one run. Each process has a stable name
within its worker.

Core decides when these beans run; the starter is not a scheduler. Keep business
services free of Synapsys types, then add thin process beans at the application
boundary.

## Endless before and after: queue consumer

The business service can use ordinary Java cancellation and remain directly
testable:

```java title="Before: MessageConsumer.java"
@Service
public class MessageConsumer {
    public void consumeUntil(BooleanSupplier stopped) throws InterruptedException {
        while (!stopped.getAsBoolean()) {
            Message message = queue.poll(1, TimeUnit.SECONDS);
            if (message != null) {
                handle(message);
            }
        }
    }
}
```

The process bean adapts only the lifecycle signal; Spring injects the existing
service:

```java title="After: MessageConsumerProcess.java"
@SynapsysProcess(name = "message-consumer")
public class MessageConsumerProcess extends AbstractEndlessProcess {
    private final MessageConsumer consumer;

    public MessageConsumerProcess(MessageConsumer consumer) {
        this.consumer = consumer;
    }

    @Override
    protected void runForever(StopSignal stop) throws Exception {
        consumer.consumeUntil(stop::isStopRequested);
    }
}
```

The queue loop belongs to the consumer. One accepted start invokes it once.

## Progressive before and after: customer-file import

Finite logic returns naturally and has no Synapsys dependency:

```java title="Before: CustomerImporter.java"
@Service
public class CustomerImporter {
    public int importFile(Path path) throws IOException {
        List<Customer> customers = readCustomers(path);
        repository.saveAll(customers);
        return customers.size();
    }
}
```

The process wrapper runs exactly once per accepted start. No cancellation API is
invented because this method does not need it:

```java title="After: CustomerFileImportProcess.java"
@SynapsysProcess(name = "customer-file-import")
public class CustomerFileImportProcess extends AbstractProgressiveProcess {
    private final CustomerImporter importer;

    public CustomerFileImportProcess(CustomerImporter importer) {
        this.importer = importer;
    }

    @Override
    protected void run() throws Exception {
        importer.importFile(Path.of("/imports/customers.csv"));
    }
}
```

For large cancellable batches, make the business API accept a neutral cancellation
callback and have the wrapper supply `this::checkCancelled` at safe record
boundaries.

## Endless process

```java
@SynapsysProcess(name = "invoice-poller")
public class InvoicePoller extends AbstractEndlessProcess {
    @Override
    protected void runForever(StopSignal stopSignal) throws Exception {
        while (!stopSignal.isStopRequested()) {
            System.out.println("polling invoices");
            pollInvoices();
            Thread.sleep(5_000);
        }
    }

    @Override
    protected void onStop() {
        closeResources();
    }
}
```

Stopping is cooperative. Check the signal inside loops and ensure blocking calls
eventually return. `onStop()` is optional cleanup; the process body must still exit.

## Progressive process

```java
@SynapsysProcess(name = "monthly-report")
public class MonthlyReport extends AbstractProgressiveProcess {
    @Override
    protected void run() throws Exception {
        for (Account account : accounts()) {
            checkCancelled();
            buildReportFor(account);
            System.out.println("completed " + account.id());
        }
    }
}
```

A progressive process returns to `idle` when `run()` completes. Call
`checkCancelled()` at useful boundaries so a stop command can end a long run.

## Captured output

While a process is running, text written to stdout or stderr is copied to Core and
attached to that execution. It still appears in the application's normal console.
Open **Executions**, choose a run, and select its logs to inspect the captured lines.

Only output produced inside a Synapsys process execution is attributed. Ordinary
application logs outside a run are not sent. Because captured output leaves the
worker, do not print secrets or regulated data.

Starter diagnostics use the application's SLF4J implementation and begin with
`[Synapsys] `. A healthy heartbeat is silent. Console capture replaces
`System.out`/`System.err` with thread-attributed tees; a Logback appender bound to
the original stream before startup, a file appender, or work handed to an
application-owned thread pool bypasses capture. The queues and UTF-8 heartbeat
batches are bounded, and shutdown restores streams only while the starter still
owns them. Set `synapsys.capture-console=false` to leave them untouched.

## Failure behaviour

An exception from the process marks that process `failed`, records its output, and
does not crash the host application or block other processes. Starting it again
creates a new execution. Core becoming unavailable does not stop a running process;
the worker reports its latest state when connectivity returns.

## Testing

Disable the starter when a test should not make network calls:

```properties title="src/test/resources/application.properties"
synapsys.enabled=false
```

This keeps the dependency on the classpath while disabling the heartbeat loop and
console capture.

Unit-test `MessageConsumer` and `CustomerImporter` directly. Use a Spring context
test to verify process discovery, unique names, and disabled configuration; use a
fake Core for command-token, deferred-start, malformed-response, log-retry,
`failed`, and shutdown behavior.

Starts and stops are idempotent. A start received while an old body is stopping is
deferred without acknowledgement or `runId` replacement, and no process can overlap
itself. An unhandled `Throwable` is captured and transitions only that process to
`failed`. See the [shared lifecycle contract](/reference/client-lifecycle).
