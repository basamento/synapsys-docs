# Information architecture

The page list for the Synapsys docs site, and the versioning boundaries that
fall out of it. Decided before scaffolding, because Docusaurus's folder layout
and version snapshots are expensive to change afterwards.

---

## 1. Versioning

**The whole system stays `v1` through the first public release, so no version
dropdown ships.** Every docs instance launches unversioned.

That is a launch decision, not a permanent one. The instances are still created
as separate Docusaurus docs plugins from day one, because splitting a single
instance apart later means moving every URL, whereas turning versioning *on* for
an instance that already exists is one command and costs nothing until used.

When versioning does arrive, this is the intended shape — recorded now so the
folder layout does not have to change to accommodate it:

| Instance | Path | Will version by |
|---|---|---|
| `concepts` (default) | `/docs` | never — describes the model, not a release |
| `tutorials` | `/tutorials` | never — always targets latest |
| `core` | `/manuals/core` | Core releases |
| `spring-boot` | `/manuals/spring-boot` | starter releases |
| `go`, `python` | `/manuals/<lang>` | their own releases |
| `raw-api` | `/manuals/raw-api` | API version (`v1`) |
| `reference` | `/reference` | API version (`v1`) |

Two calls in there that are not obvious:

- **The reference will version by API version, not Core release.** The endpoint is
  already `/api/v1/workers/heartbeat` — the contract carries its own version and
  moves far more slowly than the Core. Tying it to Core releases would produce a
  run of identical snapshots.
- **Concepts and tutorials will never carry a dropdown.** If the token dance
  changes, that is `v2` of the API and those pages get rewritten, not forked.

---

## 2. Page list

### Landing — `/`

Single custom page. Not a docs instance.

### Get started — `/docs/start`

The funnel. Four pages, no more; anything longer belongs in a tutorial.

- `index` — What Synapsys is, and what it is not
- `run-the-core` — One Docker command
- `first-worker` — Add the starter, point it at the Core, watch it appear
- `start-and-stop` — Drive a process from the console

### Concepts — `/docs/concepts`

The pages nobody else can write, because no single repo owns them.

- `architecture` — Core, workers, processes, executions, and how they relate
- `neurons-and-processes` — The biological naming; names unique per worker, not
  globally; addressing by id
- `heartbeat-protocol` — The loop, the single endpoint, the request/response shape
- `token-idempotency` — Why commands are matched by token and not by state
- `execution-states` — `idle` / `running` / `stopping` / `failed`; observed vs
  commandable; `idle` is not a stop
- `process-types` — Endless vs progressive, and the cancellation model for each
- `actions-and-runs` — What an execution record is and when a run id exists
- `security-model` — Outbound-only, what the Core trusts, what it never does

### Tutorials — `/tutorials`

Numbered and cumulative, RabbitMQ style. Language-tabbed with a shared `groupId`
so the choice follows the reader across the whole series.

1. `hello-worker` — Register and appear
2. `endless-process` — The stop signal and cooperative shutdown
3. `progressive-process` — A finite run, and cancelling one mid-flight
4. `handling-commands` — Applying a command exactly once, by token
5. `tracking-executions` — Runs, history, and what "failed" means

Every tutorial carries a **Raw API** tab alongside the language tabs (see §4).
There is deliberately no "how to write a starter" tutorial: with the wire format
shown next to every code sample on the site, that page would only be restating
what the reader has already seen five times.

### Manuals — `/manuals/<connection-method>`

**Core** — `install`, `configuration`, `database-and-migrations`, `the-console`,
`networking-and-cors`, `backup-and-restore`, `upgrading`, `troubleshooting`

Then one manual per **connection method**, all four peers of each other:

**Spring Boot** — `install`, `configuration`, `writing-processes`, `lifecycle`,
`testing`, `troubleshooting`, `upgrading`

**Go** and **Python** mirror that shape when the starters exist.

**Raw API** — `overview`, `registering`, `the-heartbeat-loop`,
`applying-commands`, `reporting-executions`, `checklist`

The Raw API manual is not a fallback for people whose language is missing — it is
a supported integration path with the same standing as the starters, and it is
what a team with an unusual runtime actually uses. `checklist` is the page that
replaces the old "write a starter" tutorial: a flat list of everything a correct
client must do, in order, with nothing else on the page.

### Reference — `/reference`

- `http-api` — Entry point to the OpenAPI-backed HTTP contract.
- `heartbeat-payload` — The request and response objects, field by field
- `glossary` — Neuron, process, execution, action, run, token
- `state-machine` — The full state table, in one place, linkable

### Blog — `/blog`

Release notes and design notes. Every release gets an entry; the token
idempotency model and the `failed`-as-observed-state decision are both worth
write-ups.

---

## 3. What ships first

Publishing the whole tree at once is not realistic and not necessary. A first
release is credible with **fifteen pages**:

- Landing
- Get started, all four
- Concepts: `architecture`, `heartbeat-protocol`, `execution-states`
- Tutorials 1 and 2
- Core manual: `install`
- Spring Boot manual: `install`, `configuration`
- Raw API manual: `the-heartbeat-loop`, `checklist`

Everything else can land incrementally without moving a URL. The two not to
defer are **`concepts/heartbeat-protocol`** and **`manuals/raw-api/checklist`** —
between them they are the entire contract, and they are what a team evaluating
Synapsys for an unsupported runtime reads before deciding.

---

## 4. The Raw API tab

Raw API is one of four connection methods, which makes it a **tab in every
language-tabbed code block on the site**, not just a section of its own:

```
[ Spring Boot ][ Go ][ Python ][ Raw API ]
```

The consequence is the point: the wire format ends up documented inline on every
page that shows code, rather than quarantined in a reference nobody opens. A
reader on the Python tab is one click from seeing the exact HTTP call their
starter is making — which is also the fastest way to debug one.

It costs discipline. Every code sample has to be written four times, and the Raw
API tab has to stay honest: real headers, real payloads, real tokens, no
`...` elisions in the places that matter. A wrong Raw API tab is worse than an
absent one, because it is the tab people copy when nothing else works.

Until the Go and Python starters exist, their tabs are simply absent — not
present-and-empty, and not marked "coming soon" (see conventions).

---

## 5. Conventions

- **URLs are lowercase-kebab and permanent.** Prefer a redirect over a rename.
- **One `h1` per page**, matching the sidebar label. If the two need different
  wording, the sidebar label is wrong.
- **Every concept page opens with a one-paragraph answer**, then detail. A reader
  arriving from a search should be able to leave after the first paragraph.
- **Code samples are language-tabbed** with a shared `groupId`, always including
  Raw API — so adding Go later does not restructure the page.
- **Nothing is documented that is not implemented.** Planned starters appear as
  planned on the landing page and nowhere else; no empty tabs, no "coming soon"
  pages in the sidebar.

---

## 6. Open

- **Does `/docs/start` belong inside the concepts instance or its own?** Currently
  planned as a category inside `concepts`. Its own instance only if it ever needs
  independent versioning, which is unlikely.
- **OpenAPI publication**: the source specification now lives in
  `synapsys-core-go/openapi.yaml`. The remaining release task is to publish a
  rendered reference from it without introducing a second hand-maintained
  contract.
- **Which starters actually follow Spring Boot.** The connection methods are
  currently Spring Boot, Go, Python and Raw API; Node and .NET were dropped from
  the earlier plan. Each one that lands adds one `/manuals/` instance.
- **Search**: Algolia DocSearch (free for public docs, needs the site live and
  crawlable first) or a local index. Deferrable, but it affects nothing structural.
