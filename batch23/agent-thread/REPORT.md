# fix-agent-thread — TARGETED FIX REPORT

## Defect (real-browser QA)
Checklist header said `3 of 5 steps` but only 3 items EVER painted
(`Freeze scope`, `Verify billing webhooks`, `Sign off staging`).
Expanding the section still showed only those 3; steps 4 and 5 never
appeared in either theme.

## Original check (`demo-original.js`)
Read `./demo-original.js` before changing anything. It contains only the
9 demo modes (`live, decision, scrolled, offline, uploading, dictating,
away, error, loading`) plus `onNavigate` / `onShowTask` / `onOpenInbox`
routing. It contains **zero checklist data**: no `Freeze scope`, no
`Verify billing`, no `Sign off`, no `of 5 steps`, no steps 4/5 names or
states. There is no original 5-step list to restore verbatim.

Decision per task brief: since the original supplies no 4th/5th step to
copy, do NOT invent two generic steps. Correct the header to match the
3 real items instead, and note it here.

## Root cause
Replica hard-coded an inconsistent total: `taskMeta` initialized as
`research-agent · 3 of 5 steps · 44k / 200k`, tick updater rewrote the
same `3 of 5 steps` string every 8 ticks, and the `Tasks` footer route
set `Tasks · 3 of 5 steps` — while the checklist DOM only ever builds 3
nodes (`R.c1/R.c2/R.c3`). Count said 5, DOM said 3, in both themes.

## Fix (targeted, everything else identical)
`index.html` only, 3 strings, `5` → `3`:
- init: `research-agent · 3 of 5 steps · 44k / 200k` → `3 of 3 steps`
- tick: `"research-agent · 3 of 5 steps · "+tokens` → `3 of 3 steps`
- Tasks route: `Tasks · 3 of 5 steps` → `Tasks · 3 of 3 steps`

Not touched: `/*noflash*/` guard + bg style + `color-scheme` meta, CSS
tokens / dark theme, `checks` DOM (names/states verbatim: `✓ Freeze
scope`, `✓ Verify billing webhooks`, `○ Sign off staging`), expand
(`aria-expanded` + `hidden` in place), token counter (`44k → 47k → wrap
44k`), all 9 modes, decision Approve/Request-changes, composer, footer
routes. No `innerHTML` added (file still has zero occurrences).

## Verification (node only, no installs)
- `node --check` on extracted app JS: PASS (via harness).
- `node harness.js` (in-dir DOM stub, no deps): PASS in light AND dark:
  - VISIBLE state: header `3 of 3 steps` visible, no `3 of 5 steps`
    anywhere; all 3 step names visible collapsed AND expanded.
  - Expand: starts collapsed, click opens (`hidden=false`,
    `aria-expanded=true`) on the SAME `taskDetail` node, items still
    visible; second click collapses.
  - Token counter: starts 44k, 8 ticks → 45k (`ctxLabel` + `taskMeta`),
    → 46k → 47k → wraps to 44k; header stays `3 of 3 steps`.
  - Full-loop identity: snapshot `T.refs`, 25 ticks + cycle all 9 modes
    + 25 ticks, every ref `===`; zero `innerHTML` writes after init.
  - Theme toggle flips `data-theme` both ways in each run.
  - Static: `/*noflash*/`, tokens, dark tokens, v5 hover/tap/`tabular-nums`.

## How to test (browser)
Open `index.html`, check task card meta reads `3 of 3 steps`, expand it
— same 3 items, click `Tasks` footer (sub reads `Tasks · 3 of 3
steps`), watch `44k / 200k` tick up to `47k` then wrap, toggle sun/moon.
Re-run `node harness.js` to re-verify.

## Limits
No browser render check (node only per instructions). No steps 4/5
restored because `demo-original.js` provides none; if real original data
for steps 4/5 surfaces later, append two `check` nodes with that exact
data and revert header to `3 of 5 steps`.
