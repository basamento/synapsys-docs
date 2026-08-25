---
title: Your first worker
description: Add the starter to a Spring Boot application and watch it appear in the console.
sidebar_position: 3
---

# Your first worker

A worker is an application of yours that heartbeats to the Core. Nothing needs to
be registered in advance — the first heartbeat is the registration.

## Add the dependency

:::info Not published yet
The starter is not on Maven Central. Build it locally and install it into your
local repository first:

```bash
git clone https://github.com/JMarzoli/synapsys-springboot-starter.git
cd synapsys-springboot-starter
./mvnw install
```
:::

```xml title="pom.xml"
<dependency>
  <groupId>com.synapsys</groupId>
  <artifactId>synapsys-springboot-starter</artifactId>
  <version>1.0-SNAPSHOT</version>
</dependency>
```

## Point it at the Core

```yaml title="application.yaml"
spring:
  application:
    name: billing-jobs

synapsys:
  core-url: http://localhost:8080
```

That is the minimum. `worker-name` falls back to `spring.application.name`, the
host is taken from the machine, and the heartbeat interval defaults to 5 seconds.

:::caution
A typo in any `synapsys.*` key **fails startup**. That is deliberate — a silently
ignored setting is far more expensive to debug than a failed boot. If the
application will not start, read the key name in the error before anything else.
:::

## Start it

Run your application. Within one heartbeat interval it appears in the console at
http://localhost:8080 with no processes yet.

Next: [start and stop a process](./start-and-stop).
