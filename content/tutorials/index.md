---
title: Tutorials
description: Task-oriented Synapsys walkthroughs for developers and operators, from the first worker to a production Linux deployment.
slug: /
sidebar_position: 0
---

# Tutorials

Use these walkthroughs to learn Synapsys by completing real integration and
operations tasks. Start with the fundamentals if this is your first worker, or jump
directly to the application or deployment pattern that matches your job.

<div className="tutorial-grid">
  <a className="tutorial-card" href="/tutorials/hello-worker">
    <span className="tutorial-card__step">01 · Fundamentals</span>
    <strong>Connect the first worker</strong>
    <span>Authenticate an application and verify its first heartbeat.</span>
  </a>
  <a className="tutorial-card" href="/tutorials/progressive-process">
    <span className="tutorial-card__step">03 · Fundamentals</span>
    <strong>Run finite work safely</strong>
    <span>Complete, cancel, and inspect a progressive process.</span>
  </a>
  <a className="tutorial-card" href="/tutorials/adopt-a-spring-scheduled-job">
    <span className="tutorial-card__step">04 · Application pattern</span>
    <strong>Adopt an existing job</strong>
    <span>Keep business logic and replace unmanaged scheduling or timers.</span>
  </a>
  <a className="tutorial-card" href="/tutorials/deploy-core-on-linux">
    <span className="tutorial-card__step">07 · Operations</span>
    <strong>Deploy Core on Linux</strong>
    <span>Use Docker Compose, persistent storage, health checks, and HTTPS.</span>
  </a>
</div>

## Suggested learning paths

### Developer: integrate an application

1. [Hello worker](/tutorials/hello-worker)
2. [An endless process](/tutorials/endless-process) or
   [a progressive process](/tutorials/progressive-process)
3. [Adopt a Spring scheduled job](/tutorials/adopt-a-spring-scheduled-job) or
   [a Node.js background job](/tutorials/adopt-a-node-background-job)
4. [Diagnose a failed execution](/tutorials/diagnose-a-failed-execution)

### Operator: run Core

1. [Deploy Core on Linux](/tutorials/deploy-core-on-linux)
2. [Rotate a worker token](/tutorials/rotate-a-worker-token)
3. [Back up and upgrade Core](/tutorials/backup-and-upgrade-core)

Each tutorial links to the relevant manual when you need the complete configuration
or protocol reference.
