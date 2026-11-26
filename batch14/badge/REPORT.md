# Badge — replica report

## What was built
`index.html` (single self-contained file, ~15KB, no network, system fonts only) replicating the
affectUI **Badge** demo: a "Runs" card with header counts, six status rows, and a footer.
Clean-room implementation written from the observed demo behaviour — no compiled source copied.

- **Header pattern:** page topbar shows project name "Runs" + working count ("1 running") +
  agent ("Triage agent") with a sun/moon theme toggle top-right; the card head itself matches the
  original exactly ("Runs [6]" left, "Needs you [99+]" right).
- **Badges:** pill (`999px`), sizes sm (20px h / 11px) and md (22px h / 12px), tones neutral /
  info / success / warning / danger / purple, dot + live halo (1.8s pulse), icon (clock, pause),
  and count badges with `99+` max-cap. Count formatting mirrors the original: floor, clamp at 0,
  `Intl.NumberFormat` grouping, cap at max with `+`.
- **Dark mode:** visible toggle switching `data-theme="light"|"dark"` on `<html>`, persisted to
  `localStorage` (`badge-theme`). All colours flow through CSS custom properties (no ad-hoc hex
  per element); dark theme re-maps surface/page/ink/muted/border plus per-tone badge palettes.
  Default theme is **light**, the original demo's appearance (guard falls back to
  `prefers-color-scheme` when no stored choice exists; stub/test env resolves to light).
- **No-flash guard:** `<head>` starts with the `/*noflash*/` inline script (stored theme, else
  `prefers-color-scheme`, clamped to light/dark) plus `html{background:#fafaf9}` /
  `html[data-theme="dark"]{background:#101012}` and `<meta name="color-scheme" content="light dark">`.
- **In-place updates only:** all content is static markup; the page script caches node references
  once at init and the 2s keep-alive tick only sets the existing card's `data-tick` attribute.
  No `innerHTML` anywhere in the page script; hover/focus are CSS-only (`:hover`,
  `:focus-visible`); no dialogs/popovers; `[hidden]{display:none!important}` guard included;
  static SVGs carry classes via attributes (script creates no SVG, so no `.className`-on-SVG risk).
- **Pixel-marks:** intentionally omitted — the Badge demo has no agent avatar identities (only the
  "Triage agent" text label), so per the spec there is nothing to render as a 3x3 mark.

## Original data/behaviour matched (verbatim from demo-original.js)
All six rows with exact titles/metas/labels: "Sync invoices to billing-api / Started 2 min ago /
Running" (info, live dot), "Draft replies for 14 tickets / Waiting since 10:42 / Needs you"
(warning, dot), "Weekly usage report / Finished in 3m 12s / Done" (success), "Migrate webhooks
to v2 / Rate limited by GitHub / Failed" (danger), "Re-index the help center / Tomorrow at 06:00
/ Scheduled" (clock icon), "Clean up stale branches / Paused by Mara / Paused" (pause icon);
header "Runs" + count 6, "Needs you" + warning count 128 (`aria-label="128 waiting"`, visible
`99+` via max 99 cap); footer "Triage agent" + purple md "Beta". Live halo timing (1.8s
cubic-bezier), ellipsis truncation, count pill geometry, and dark badge palettes all match.

## Verification (node only — no browser launched)
- `node --check` on both extracted scripts (noflash guard + main): **OK**.
- In-dir stub harness `harness.cjs` (`node harness.cjs`): **ALL CHECKS PASSED** (63 checks),
  including: verbatim strings, tone/size/live/count-cap rendering, token + dark-override
  presence, no external assets, `<200KB`, no `innerHTML` in page script, CSS-visibility audit
  (no `display:none`/`visibility:hidden`/`color:transparent`/`font-size:0` on text classes),
  script execution in stub DOM, `countText(128,99)==="99+"`, 5-tick full-loop with **node
  identity preserved** and **zero innerHTML writes**, counts intact after loop, and theme
  **light default → dark applies → light restores** (both themes checked).
- Could not verify: pixel-perfect rendering vs the live site (headless Chrome unavailable in this
  environment); checked tokens/contrast by inspection instead.

## How to test
Open `index.html` in any browser (double-click or `python3 -m http.server` + visit the file).
Click the Dark/Light toggle top-right to check both themes. Live "Running" dot should pulse.
