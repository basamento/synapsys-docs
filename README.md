# synapsys-docs

The documentation website for the [Synapsys](https://github.com/JMarzoli/synapsys-core-go)
ecosystem. Built with [Docusaurus 3](https://docusaurus.io/).

## Run it

```bash
npm install
npm run start
```

The dev server comes up at <http://localhost:3000/>.

```bash
npm run build      # production build into build/
npm run serve      # serve the production build locally
npm run typecheck  # tsc, no emit
```

Requires Node 20 or later.

## Layout

```
content/
  concepts/      /docs        — Get started and Concepts (the default instance)
  tutorials/     /tutorials   — numbered, cumulative, language-tabbed
  manuals/
    core/        /manuals/core
    spring-boot/ /manuals/spring-boot
    raw-api/     /manuals/raw-api
  reference/     /reference
blog/                         — releases and design notes
design/                       — the design system (see design/README.md)
sidebars/                     — one file per docs instance
src/pages/index.tsx           — the landing page
```

Each directory under `content/` is a **separate Docusaurus docs instance**, which
is what makes per-component versioning possible later. Everything ships
unversioned today — the system is v1 until the first public release — but the
instances exist separately from day one so that turning versioning on never has
to move a URL.

Go and Python manuals are deliberately absent until those starters exist.

## Before you edit

Two documents are worth reading first, because most of the non-obvious choices
are recorded there rather than being visible in the code:

- **[IA.md](./IA.md)** — the page list, the instance and versioning boundaries,
  and the conventions (URL rules, the Raw API tab, what ships first).
- **[design/README.md](./design/README.md)** — the visual system: colour, type,
  the dark-mode rule, logo usage, responsive breakpoints.

## Things that will bite you

- **Broken internal links fail the build.** `onBrokenLinks`, `onBrokenAnchors`
  and `onDuplicateRoutes` are all set to `throw`. This is deliberate — it is the
  cheapest guardrail a growing docs site has.
- **`design/tokens.css` is imported, not copied.** `src/css/custom.css` pulls it
  in directly. Edit the design folder, not a duplicate.
- **The `h3`–`h6` font reset in `tokens.css` is load-bearing.** Infima applies one
  heading font to every level; stopping the display face at `h2` is only possible
  by overriding it back. Delete that block and the type system silently reverts.
- **The `.markdown table` overflow rule is load-bearing too.** Infima does not make
  tables scroll, and one wide table makes every page scroll sideways on a phone.
- **The navbar is dark in both themes** by design. `--ifm-navbar-background-color`
  is set once, outside any theme block, on purpose.
- **`.md` files are parsed as MDX.** HTML comments do not work — use
  `{/* truncate */}` in blog posts, not `<!-- truncate -->`.
