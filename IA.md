# Documentation map and product knowledge

This file is the maintained source of truth for the public Synapsys documentation.
It records what is shipped, how the site is organised, and what must stay out of
consumer-facing pages. Verify release numbers against the public registry before
changing install snippets.

## Public product summary

Synapsys is a self-hosted control plane for background work that already lives in
applications and scripts. It gives operators one responsive web console to discover
workers, start and stop registered processes, inspect execution history, and read
per-run output. It does not replace the application's scheduler, queue, business
logic, or deployment platform.

Workers make outbound heartbeat requests to Core. A heartbeat reports current
process state and receives pending commands. Core never needs to open a connection
to a worker. Command tokens make retries idempotent.

## Shipped public surfaces

| Surface | Distribution | Public contract |
| --- | --- | --- |
| Core | `ghcr.io/jmarzoli/synapsys-core` | Container serving the operator console and HTTP API on port 8080 |
| Spring Boot starter | Maven Central: `org.basamento.synapsys:synapsys-spring-boot-starter` | Java 17+, Spring Boot 3.x, automatic discovery and lifecycle |
| Node.js SDK | npm: `@synapsys-io/sdk` | Node.js 16+, CommonJS and ESM, zero runtime dependencies |
| Raw API | `POST /api/v1/workers/heartbeat` | HTTP/JSON integration for any runtime |

Published versions verified on 2026-08-29: Spring Boot `0.1.0`, Node.js `0.1.1`.
Source repositories can be ahead of these releases; published docs must not be.

## Security facts consumers need

- The operator console requires a username and password. Its browser session is
  separate from worker authentication.
- Every worker heartbeat uses `Authorization: Bearer <worker-token>`.
- Operators can create and revoke named worker tokens in **Settings**. A generated
  secret is shown once; Core stores no retrievable copy.
- Core can accept an optional deployment-wide `SYNAPSYS_WORKER_TOKEN` for bootstrap.
  A worker receives that same secret as `SYNAPSYS_CORE_TOKEN`. Default installation
  examples use named tokens instead because they support independent rotation and
  revocation.
- Use HTTPS outside a trusted local machine and enable secure cookies.
- Captured process output is transmitted to Core. Document how to disable capture
  wherever a library supports that choice.

## User-visible capabilities

- Responsive console navigation for desktop, tablet, and mobile browsers.
- Worker, process, execution, and action views with search, filters, and paging.
- Start and cooperative stop commands.
- Endless and progressive process types.
- Execution history and captured stdout/stderr, grouped by run.
- Health endpoint at `GET /api/health`.
- Resilient heartbeats: a Core outage does not stop running user processes.

## Site structure

| Section | Route | Purpose |
| --- | --- | --- |
| Get started and concepts | `/docs` | Explain the problem, run Core, connect a worker, and understand the model |
| Tutorials | `/tutorials` | Small end-to-end tasks with runnable examples |
| Core manual | `/manuals/core` | Installation, authentication, configuration, console, and logs |
| Spring Boot manual | `/manuals/spring-boot` | Install, migrate existing work, configure environments, and define processes |
| Node.js manual | `/manuals/nodejs` | Install, migrate existing work, configure environments, and define processes |
| Raw API manual | `/manuals/raw-api` | Implement the heartbeat contract without an official library |
| Reference | `/reference` | Stable HTTP, state, and terminology reference |

Each manual is a separate Docusaurus docs instance so a library can be versioned
independently later. Concepts and tutorials remain unversioned and describe the
current supported experience.

### Tutorial groups

- **Fundamentals:** connect a worker, run endless work, run progressive work.
- **Application patterns:** adopt an existing Spring scheduled job, adopt a Node.js
  background loop, and diagnose a failed execution.
- **Operations:** deploy Core on Linux with HTTPS, rotate a worker token, and back up
  and upgrade Core.

The tutorial overview at `/tutorials` is the primary navigation target. Add a new
tutorial to the appropriate group in `sidebars/tutorials.ts`; do not append an
unstructured flat list.

## Product screenshots

Product captures live under `static/img/screenshots/` and render through
`src/components/ProductScreenshot.tsx`, which supplies the consistent frame and
caption treatment.

- Capture product content only—never browser chrome, address bars, private URLs,
  credentials, real tokens, or customer data.
- Prefer a 16:10 desktop capture around 1440 × 900. Use a dedicated mobile capture
  only when the responsive behavior is itself the subject.
- Use demo worker and process names that also make sense in the surrounding page.
- Keep the four stable subjects: summary, processes, execution logs, and worker-token
  settings. Replacing an image must not require rewriting page copy.
- Placeholder SVGs are acceptable until a sanitized live capture is available; their
  filenames end in `-placeholder.svg` so unfinished assets are easy to find.

## Editorial rules

- Write for developers evaluating or integrating Synapsys, and for operators who
  will run it—not for project maintainers.
- Start every page with the answer. Prefer runnable examples and observable results.
- Show environment variables through placeholders such as `${SYNAPSYS_CORE_TOKEN}`;
  never publish real credentials, private hosts, internal deployment paths, or
  implementation-only architecture.
- Do not document unreleased source as available. Planned integrations do not get
  empty pages or navigation entries.
- Every library manual must show the code before and after adoption, installation,
  environment setup, process types, shutdown, failure behaviour, and log capture.
- Raw API examples must include the bearer header and complete fields required for
  correctness. Treat `runId` as an opaque 64-bit value and echo it exactly.
- Desktop and mobile are both supported. Tables must scroll within the content area,
  tap targets must remain at least 44px on mobile, and representative pages must be
  checked at both widths before delivery.
- URLs are lowercase kebab-case and permanent. Prefer a redirect over a rename.

## Release update checklist

When Core or a library changes:

1. Verify the public artifact or image, not only the source tree.
2. Update this file's shipped surfaces, versions, and capability notes.
3. Update the affected manual, quickstart, Raw API contract, and reference page.
4. Build with broken links and anchors treated as errors.
5. Render the landing page, quickstart, and changed manual on desktop and mobile.
