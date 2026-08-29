---
title: Start and stop a process
description: Register a small process, control it from the console, and inspect its captured output.
---

# Start and stop a process

A process is a named unit of work owned by one worker. Register one with your
library, restart the application, and Core will discover it on the next heartbeat.

## Spring Boot example

```java title="InvoicePoller.java"
@SynapsysProcess(name = "invoice-poller")
public class InvoicePoller extends AbstractEndlessProcess {
    @Override
    protected void runForever(StopSignal stopSignal) throws Exception {
        while (!stopSignal.isStopRequested()) {
            System.out.println("checking for invoices");
            Thread.sleep(5_000);
        }
    }
}
```

## Node.js example

Add this registration before `synapsys.start()`:

```js
synapsys.endless('invoice-poller', async (stop) => {
  while (!stop.requested) {
    console.log('checking for invoices');
    await stop.sleep('5s');
  }
});
```

## Drive it from the console

1. Open **Processes** and select `invoice-poller`.
2. Choose **Start**. The command is delivered on the next heartbeat.
3. Watch the state move from `idle` to `running`.
4. Open **Executions**, select the run, and open its logs.
5. Choose **Stop**. The worker receives a cooperative stop signal and reports
   `idle` after the process exits.

The console navigation and entity cards adapt to mobile screens. On a phone, open
the navigation drawer to move between Workers, Processes, Executions, Actions, and
Settings; the same start, stop, and log views remain available.

If a process stays in `stopping`, its body is not cooperating with cancellation.
Use the library-specific guides for the correct pattern:

- [Spring Boot processes and logs](/manuals/spring-boot/processes-and-logs)
- [Node.js processes and logs](/manuals/nodejs/processes-and-logs)
