# Synapsys design system

The visual system for the Synapsys documentation site. Everything here is
decided; nothing here is built yet.

---

## What is in here

| Path | What it is |
|---|---|
| `tokens.css` | The token layer. Import it once and both Infima and shadcn read from it. |
| `logo/` | Four SVGs, drop-in ready. |
| `artboards/` | Source of the design canvas — one `.dc.html` per board, plus `canvas.json`. |

## The decisions

**Direction — "Product".** Marketing-forward and confident: saturated violet, a
deep indigo hero band, chunky rounded cards. Chosen over three alternatives
(dark instrument panel, editorial serif, blueprint schematic) because the
audience is developers *and* the companies that adopt them, and the landing page
has to work on someone who arrives from a search with five seconds of patience.

**Type.**

- **Bricolage Grotesque** — display sizes, `h1`, `h2`.
- **Plus Jakarta Sans** — body, and `h3` down at weight 700.
- **IBM Plex Mono** — code, labels, metadata.

The display face deliberately stops at `h2`. A long reference page stacks a
dozen smaller headings and Bricolage turns noisy at that size and repetition.
Infima applies one heading font to every level, so `tokens.css` resets `h3`–`h6`
by hand — that override is load-bearing, do not delete it.

**Colour.** Brand violet `#5F3DF2`, teal `#12B5A0` for running/success, amber for
stopping/caution, red for failed/danger. Every support colour has a light-ground
and a dark-ground variant, because the same hex cannot clear contrast on both.
Every text/ground pair in `tokens.css` is measured and meets WCAG AA; the ratios
are printed on the token sheet in the canvas.

**Responsive.** Two breakpoints, and only two. **996px** is Docusaurus's own —
below it the sidebar becomes a drawer, the TOC hides, content takes the full
width. All of that is free; do not invent a competing breakpoint for the docs
shell. **640px** belongs to the landing page, where every section is custom
React: grids collapse to one column and buttons go full width.

Three things are *not* free and are specified in `tokens.css`:

- **Tap targets.** Desktop rows are ~30px, which is right with a mouse and fails
  the 44px touch floor. The `@media (max-width: 996px)` block raises them rather
  than loosening the desktop layout.
- **Table overflow.** Infima does not make tables scroll. One wide table pushes
  the entire document and every page starts scrolling sideways on a phone. The
  `.markdown table` rule is what prevents it — do not remove it.
- **The version selector** pins to the top of the mobile drawer instead of
  scrolling away with the nav tree. On a phone it is the only signal that you
  are reading older docs.

**Dark mode.** The hero band never changes. In dark mode its own colour
(`#17123A`) becomes the page surface and everything that was white drops to
`#0F0B24` beneath it, so the band stops reading as a band and becomes the
ground. The navbar is therefore dark in *both* themes — `--ifm-navbar-background-color`
is set once, outside any theme block, on purpose.

## Logo — Nucleus

A soma with three axons leaving it, each ending in a terminal: one Core, many
neurons reaching out. Built on a 48 grid — ground `r22`, soma `r6`, terminals
`r4` on a `r15` orbit at −90° / 30° / 150°, axons `2.6` wide.

| File | Use |
|---|---|
| `logo/synapsys-mark.svg` | Primary. Navbar, READMEs, everywhere. |
| `logo/synapsys-favicon.svg` | Browser tab only, 32px and below. |
| `logo/synapsys-mark-mono.svg` | One colour via `currentColor`, true knockout. Print, stamps. |
| `logo/synapsys-mark-plain.svg` | No badge circle, transparent ground. |

**The favicon is a different drawing, not a resize.** At 16px the 2.6 axon falls
under one device pixel and greys out, so the variant keeps the geometry and
thickens everything — axon 4.5, soma 7.5, terminals 5.5, orbit pulled to 13.5,
ground bled to the edge. Use `synapsys-mark.svg` above 32px and
`synapsys-favicon.svg` below it.

**Teal terminals are load-bearing** — they are the part that reads as "workers".
Do not recolour them, rotate the mark (one axon always points straight up),
scale it non-uniformly, or put the badge version on a violet ground (use mono or
no-badge there).

There is no lockup SVG on purpose. The wordmark is live Bricolage Grotesque at
800 with `-0.025em` tracking, assembled in markup so it stays selectable,
translatable and crisp. A flattened lockup would only be needed for print, and
would want the type outlined by an illustrator.

## Using `tokens.css`

Import it before anything else, then reference the `--syn-*` semantic names —
not the raw ramp — from your own components:

```css
@import "./tokens.css";

.thing {
  background: var(--syn-surface-raised);
  color: var(--syn-text-body);
  border: 1px solid var(--syn-border);
  border-radius: var(--syn-radius-lg);
}
```

Dark mode keys on `[data-theme='dark']`, which is what Docusaurus stamps on
`<html>`. If Tailwind is added later, point it at the same selector rather than
its default `.dark`:

```js
darkMode: ['class', '[data-theme="dark"]']
```

Tailwind's preflight collides with Infima's base styles — disable it, and prefix
Tailwind's utilities (`tw-`) since Infima and Tailwind both claim `.container`.

## Regenerating the canvas

The `.dc.html` files in `artboards/` are the source. They are edited as files
and re-seeded; the published canvas is the output, not the master. Editing a
board in the canvas UI and saving makes the *published* version newer than these
files — extract it back before making further local edits.

## Still open

- **Information architecture** — the actual page list. Sidebar shape and
  versioning boundaries fall out of it.
- **OpenAPI spec** for the heartbeat contract, in `synapsys-core`.
  Prerequisite for a generated API reference.
- **Invented content in the mockups** — worker names, process counts and the
  `v2.1` version number are stand-ins. The 5s heartbeat is the real default.
