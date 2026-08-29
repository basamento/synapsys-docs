---
title: Processes and logs
description: Define endless and progressive Spring Boot processes, cooperate with stop commands, and inspect captured output.
---

# Processes and logs

The starter supports two process types: **endless** work that runs until stopped,
and **progressive** work that completes one run. Each process has a stable name
within its worker.

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
