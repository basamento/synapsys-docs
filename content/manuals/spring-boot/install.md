---
title: Install
description: Add the Synapsys starter to a Spring Boot application.
sidebar_position: 1
---

# Install the Spring Boot starter

:::info Not published yet
The artifact is not on Maven Central. Build and install it locally:

```bash
git clone https://github.com/JMarzoli/synapsys-springboot-starter.git
cd synapsys-springboot-starter
./mvnw install
```

A Maven wrapper is included, so Maven does not need to be on your PATH.
:::

## Maven

```xml title="pom.xml"
<dependency>
  <groupId>com.synapsys</groupId>
  <artifactId>synapsys-springboot-starter</artifactId>
  <version>1.0-SNAPSHOT</version>
</dependency>
```

## Gradle

```kotlin title="build.gradle.kts"
implementation("com.synapsys:synapsys-springboot-starter:1.0-SNAPSHOT")
```

## Minimum configuration

```yaml title="application.yaml"
spring:
  application:
    name: billing-jobs

synapsys:
  core-url: http://localhost:8080
```

The starter auto-configures itself. There is nothing to enable and no annotation
to add to your application class.

## Requirements

- **Java 17 or later.** The starter targets Java 17. The bundled example and
  workspace development scripts use Java 21; its Lombok version is not currently
  compatible with JDK 25.
- Spring Boot 3.x.

Next: [configuration](./configuration).
