---
title: What Synapsys is
description: What the product does, what it deliberately does not do, and who it is for.
sidebar_position: 1
slug: /start
---

# What Synapsys is

Most companies do not know what is running where. A cron job on a server someone
left. A Python script on a laptop. A Spring service nobody restarts because they
are not sure what depends on it.

Synapsys gives all of them one place to be registered, started, stopped and
accounted for — whatever language they are written in, whatever machine they sit
on.

## The model

- A **Core** is the central node. One binary, one database, one console.
- A **worker** (a *neuron*) is one of your applications. It connects out to the
  Core and never accepts inbound connections.
- A **process** is a unit of work inside a worker — a job, a loop, a task.
- An **execution** is one run of a process, with a start, an end and an outcome.

## What it does not do

- **It does not run your code.** Your process stays in your application, on your
  machine, with your dependencies. Synapsys starts and stops it; it does not host
  it.
- **It is not a scheduler.** There is no cron syntax. If you need a schedule, your
  process owns it.
- **It is not a queue.** Nothing is distributed to workers. A process belongs to
  exactly one worker.

## Where to go next

1. [Run the Core](/docs/start/run-the-core) — one command
2. [Your first worker](/docs/start/first-worker) — add the starter, watch it appear
3. [Start and stop a process](/docs/start/start-and-stop) — drive it from the console
