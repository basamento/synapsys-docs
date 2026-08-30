---
title: Install and adopt
description: Add the Synapsys Spring Boot starter from Maven Central and wrap existing background work.
---

# Install and adopt

The Spring Boot starter turns application beans into remotely operated Synapsys
processes. It discovers them, manages their lifecycle, sends heartbeats, and captures
per-run console output without adding a controller or inbound port.

**Requirements:** Java 17 or later, Spring Boot 3.x, a reachable Core, and a worker
token.

## Install from Maven Central

Maven needs no additional repository:

```xml title="pom.xml"
<dependency>
  <groupId>org.basamento.synapsys</groupId>
  <artifactId>synapsys-spring-boot-starter</artifactId>
  <version>0.2.0</version>
</dependency>
```

Gradle:

```groovy title="build.gradle"
implementation 'org.basamento.synapsys:synapsys-spring-boot-starter:0.2.0'
```

## Before and after

Suppose an application starts a poller itself:

```java title="Before: InvoicePoller.java"
@Component
public class InvoicePoller {
    @Scheduled(fixedDelay = 30_000)
    public void poll() {
        invoiceService.importNewInvoices();
    }
}
```

With Synapsys, the business call stays where it is. The process runs only after an
operator starts it and cooperates when asked to stop:

```java title="After: InvoicePoller.java"
@SynapsysProcess(name = "invoice-poller")
public class InvoicePoller extends AbstractEndlessProcess {
    private final InvoiceService invoiceService;

    public InvoicePoller(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @Override
    protected void runForever(StopSignal stopSignal) throws Exception {
        while (!stopSignal.isStopRequested()) {
            invoiceService.importNewInvoices();
            Thread.sleep(30_000);
        }
    }
}
```

`@SynapsysProcess` is a Spring stereotype, so component scanning finds it. Omit
`name` to use the bean name, but an explicit stable name is easier to recognise in
the console.

## Minimum configuration

```yaml title="application.yaml"
spring:
  application:
    name: billing-api

synapsys:
  core-url: ${SYNAPSYS_CORE_URL}
  core-token: ${SYNAPSYS_CORE_TOKEN}
```

```dotenv title="runtime environment"
SYNAPSYS_CORE_URL=https://core.example.com
SYNAPSYS_CORE_TOKEN=syn_replace_with_your_token
```

The starter auto-configures itself and starts with the application. The worker
should appear in Core within five seconds.

Next: [configure environments and failure behaviour](./configuration).

Version `0.2.0` is available from Maven Central. See the
[starter source](https://github.com/basamento/synapsys-spring-boot-starter), the
[Maven example](https://github.com/JMarzoli/synapsys-spring-boot-starter-maven-example),
the [Gradle example](https://github.com/JMarzoli/synapsys-spring-boot-starter-gradle-example),
and the [publication matrix](/reference/client-libraries).
