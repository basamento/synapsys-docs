---
title: Adopt a Spring scheduled job
description: Move an existing @Scheduled job behind Synapsys control without rewriting its business service.
sidebar_position: 4
---

# Adopt a Spring scheduled job

This pattern moves operational control from `@Scheduled` to Synapsys while keeping
the existing service method intact. It is useful when a team needs an on-demand job,
execution history, and visible output instead of an automatic fixed schedule.

## Before

```java
@Component
public class InvoiceImportSchedule {
    private final InvoiceService invoices;

    @Scheduled(cron = "0 0 2 * * *")
    public void importInvoices() {
        invoices.importNewInvoices();
    }
}
```

## Add the starter and connection

Install the [Spring Boot starter](/manuals/spring-boot/install), then inject the
Core URL and worker token:

```yaml
synapsys:
  core-url: ${SYNAPSYS_CORE_URL}
  core-token: ${SYNAPSYS_CORE_TOKEN}
```

## After

```java
@SynapsysProcess(name = "invoice-import")
public class InvoiceImportProcess extends AbstractProgressiveProcess {
    private final InvoiceService invoices;

    public InvoiceImportProcess(InvoiceService invoices) {
        this.invoices = invoices;
    }

    @Override
    protected void run() {
        invoices.importNewInvoices();
    }
}
```

The business service did not change. Remove the `@Scheduled` entry—or disable it in
the same release—so the old scheduler and Synapsys cannot run the job concurrently.

## Roll it out safely

1. Deploy to a non-production environment and confirm the process appears as `idle`.
2. Start it from Core and verify the result and execution output.
3. Confirm a second click or repeated heartbeat does not create a duplicate run.
4. Deploy the change that disables the old schedule and enables the Synapsys process
   together.
5. If the job is long-running, add `checkCancelled()` between batches before making
   Stop available to operators.

Synapsys does not provide cron scheduling. If the job must still run on a clock, keep
your scheduler as the caller or use your automation platform to invoke the control
API under an operator integration designed for that purpose.
