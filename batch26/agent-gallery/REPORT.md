# Agent Gallery — Targeted Fix: stats-row "Time saved" truncation

## Defect (real-browser QA)
- Stats-row label `Time saved` painted TRUNCATED as `Time sav…` in both themes, even on a 1919px-wide viewport.
- The other three labels (`Runs`, `Success`, `Escalated`) fit; `Time saved` is the longest and clipped first.
- Demo cycle and Next-agent interaction work — kept working.

## Root cause (checked against ./demo-original.js first)
- Checked `./demo-original.js` BEFORE editing (node only, no browser):
  - Original KPI CSS: `.ui-ag__kpis span{grid-area: label;font-size: 10.5px;color: var(--ui-ag-muted);white-space: nowrap}` — **no** `overflow:hidden`, **no** `text-overflow:ellipsis`.
  - Original labels logic: `[["Runs",...],["Success",...],["Time saved",...],["Escalated",...]]` verbatim.
  - Original `--ui-ag-open: min(70cqw, 1120px)`.
  - So the original does **NOT** truncate — per QA, the full label shows. Fix is warranted (not noting as same-behaviour).
- Replica `./index.html` BEFORE fix had:
  ```
  .kpis span{grid-area:label;font-size:10.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  ```
  with cell layout:
  ```
  .kpis>div{display:grid;grid-template-columns:minmax(0,1fr) 54px; ... column-gap:8px;padding:0 12px; ...}
  ```
  Inner label column ≈ `cell - 54px(spark) - 8px(gap) - 24px(padding)` ≈ ~54px on a 560px content width, so `Time saved` (~60-70px at 10.5px) overflows and the added `nowrap+hidden+ellipsis` renders `Time sav…`.
- Themes share the same rule, so both light and dark truncated.

## Fix (targeted, in-place, 1 rule)
- File: `./index.html` only. No rebuild.
- Change (39 bytes removed):
  - BEFORE: `.kpis span{grid-area:label;font-size:10.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}`
  - AFTER:  `.kpis span{grid-area:label;font-size:10.5px;color:var(--muted);white-space:nowrap}`
- This restores the original behaviour verbatim (nowrap without ellipsis clip), so all four labels paint in full in both themes. No other CSS/JS touched. Layout, `--open`, spark 54px, padding, grid unchanged.
- Preserved: `/*noflash*/` guard first in `<head>` + `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}` + `<meta name="color-scheme" content="light dark">`, in-place updates only (DOM built once, ticks mutate `textContent/class/attributes/styles`), zero `innerHTML` writes after init, demo data verbatim (7 items, triggers, guardrails, KPI hash math).

## Hard proof — md5 BEFORE vs AFTER (must differ)
```
6c2a271a17c77a23fa388ed202be112c  ./original-backup.html  (BEFORE, copy of original ./index.html)
c4cd70278d982e6f52bfb914c7e2d7de  ./index.html            (AFTER, fixed)
```
- BEFORE run: `md5sum ./index.html` → `6c2a271a17c77a23fa388ed202be112c`
- AFTER run:  `md5sum ./index.html` → `c4cd70278d982e6f52bfb914c7e2d7de`
- Hashes DIFFER (1 CSS rule changed). Original kept as `./original-backup.html` for before-run.

## Hard proof — harness FAIL on original, PASS on fixed
- Harness: `./harness.js` (in-dir, node only, DOM-stub). Usage: `node ./harness.js ./original-backup.html` / `node ./harness.js ./index.html`.
- Asserts as VISIBLE state: `.kpis span` has no `ellipsis` truncation + full `Runs/Success/Time saved/Escalated` text found in 21 screens in light AND dark via `applyTheme`, plus full-loop node identity (21 roots/screens/picks + caption), zero `innerHTML` writes, demo cycle + Next click, noflash, demo verbatim.
- `node --check ./harness.js` → OK. App JS extracted then `node --check` → OK.

### BEFORE (original, expect FAIL) — `node ./harness.js ./original-backup.html` → exit 1
```
HARNESS_OK [./original-backup.html]: noflash guard present
HARNESS_OK [./original-backup.html]: noflash inline bg present
HARNESS_OK [./original-backup.html]: color-scheme meta present
HARNESS_OK [./original-backup.html]: app script extracted (14621 chars)
KPIS_SPAN_RULE=.kpis span{grid-area:label;font-size:10.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
HARNESS_FAIL [./original-backup.html]: VISIBLE STATE FAIL: .kpis span still truncates (nowrap+hidden+ellipsis) -> 'Time saved' paints as 'Time sav…'
```

### AFTER (fixed, expect PASS) — `node ./harness.js ./index.html` → exit 0
```
HARNESS_OK [./index.html]: noflash guard present
HARNESS_OK [./index.html]: noflash inline bg present
HARNESS_OK [./index.html]: color-scheme meta present
HARNESS_OK [./index.html]: app script extracted (14621 chars)
KPIS_SPAN_RULE=.kpis span{grid-area:label;font-size:10.5px;color:var(--muted);white-space:nowrap}
HARNESS_OK [./index.html]: VISIBLE CSS: .kpis span does not truncate with ellipsis
HARNESS_OK [./index.html]: no ellipsis on kpi labels
HARNESS_OK [./index.html]: all four stat labels present (Runs/Success/Time saved/Escalated)
HARNESS_OK [./index.html]: zero innerHTML in app JS (static)
HARNESS_OK [./index.html]: demo data verbatim (7 items + guardrails)
HARNESS_OK [./index.html]: stub run: window.__ag present
HARNESS_OK [./index.html]: theme light: VISIBLE — all four labels present as full text (Time saved x21)
HARNESS_OK [./index.html]: theme dark: VISIBLE — all four labels present as full text (Time saved x21)
HARNESS_OK [./index.html]: full-loop node identity preserved (21 roots/screens/picks + caption)
HARNESS_OK [./index.html]: zero innerHTML writes after init + full loop
HARNESS_OK [./index.html]: demo cycle works (3 -> 4, caption "Onboarding coach. Guides new customers t…")
HARNESS_OK [./index.html]: Next agent interaction works
ALL_HARNESS_CHECKS_PASSED [./index.html]
```

## What matches / could not verify
- Matches: header, carousel centering, gradient art, vertical labels, screen sections/KPIs/sparklines, caption + arrows, keyboard, snap timing, responsive collapse, theme toggle, focus-visible. KPI numbers/math unchanged (`40+h%160`, `94+h%6%`, `(2+h%70/10).toFixed(1)h`, `1+h%7`).
- Checked light AND dark via `applyTheme('light'/'dark')` in stub (data-theme switches, labels still full, no theme-specific truncation).
- Could not verify pixel-exact 1919px paint (no browser per task) — proof is CSS-level (ellipsis removed, matching original) + stub VISIBLE text in both themes. No `rm /tmp`, no installs, node only.

## How to test
- `md5sum ./index.html ./original-backup.html` (must differ, see above)
- `node ./harness.js ./original-backup.html` (must FAIL with Time sav… message)
- `node ./harness.js ./index.html` (must print ALL_HARNESS_CHECKS_PASSED)
- Open `./index.html` in a browser at 1919px: stats row shows `Runs | Success | Time saved | Escalated` in full, light + dark (toggle top-right), click side panels / arrows / arrow-keys to cycle, loop restarts without flicker.
