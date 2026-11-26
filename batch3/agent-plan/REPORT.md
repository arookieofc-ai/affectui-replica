# Agent Plan — REPORT

## What was built
`index.html` (36 KB, self-contained, no external deps) replicates the affectUI **Agent Plan** demo as a clean-room interactive page.

Layout mirrors the original `.ui-pl` card: tray + inner card (max-width 460px), header meta row (`Plan · 5 steps` + `~2 min` estimate with clock icon), 15px semibold title, numbered step list with vertical rail, add-step row, footer with hint/actions, `aria-live` announcements.

## Original demo data used (from `demo-original.js`, not invented)
- Title: `Prepare the Q3 board update` · Estimate: `~2 min`
- Steps (exact titles/details/tools):
  1. `Pull Q3 revenue and ARR` / `Monthly revenue, ARR and net retention` / `stripe.query`
  2. `Summarize product launches` / `Shipped projects and adoption` / `linear.search`
  3. `Build the KPI slides` / `Six charts in the board template` / `slides.create`
  4. `Draft the board memo` / `One page, wins, risks and asks` / `docs.write`
  5. `Send the draft to Maya for review` / (no detail) / `gmail.draft`
- Statuses: `Pending / In progress / Done / Failed / Skipped`
- Failure: step 3 (`slides`) fails first pass with `Slides API timed out after 30s` + `Retry from here` button
- Timings: revenue 1300ms, launches 1100ms, slides 1400ms, memo 1250ms, email 900ms — live per-step timer (`0.0s` under 10s) and footer elapsed; done shows `took Xs` title; done footer `Plan done in Xs`
- Strings: `Drag to reorder · double-click to rename`, `Add step` / `Add a step at the end`, `Run plan` / `Cancel` / `Run again`, `Press Enter to rename, Alt plus arrow keys to move, Delete to remove.`, `Running plan`

## Behaviour (own implementation)
- Draft: double-click/Enter renames inline, Alt+Up/Down or grip-drag reorders, Delete removes, input adds. Run plan disabled when empty.
- Run: sequential simulated run with spinner markers, rail fill, live timers (100ms tick). First pass fails on slides; retry button (focused after fail) resumes from that step; second pass / Run again succeeds.
- Cancel resets to original 5 steps draft. Keyboard focus, `aria-label`s, focus-visible rings, `prefers-reduced-motion` respected.

## Tokens
Light: `--page #fafaf9 --surface #ffffff --ink #171717/#1c1917 --muted #78716c --subtle #f5f5f4 --border #e7e5e4 --radius-lg 16px --radius 10px --radius-sm 6px --shadow 0 1px 2px…/0 4px 16px…`; waiting amber `#f59e0b/#fef3c7/#92400e`; failed `#c4320a/#fdf2f1`.
Dark: `--surface #1c1c1f --page #101012 --ink #ededed --muted #a1a1aa --subtle #26262a --border #2e2e33`; amber `#fbbf24/#451a03/#fde68a`.
Toggle: sun/moon button top-right, `data-theme` on `<html>`, default follows `prefers-color-scheme`, override saved to `localStorage`.

## Flicker fix (2026-11-25) — build DOM once, patch in place
- Defect: every state change (`setStatus`, run steps, retry, cancel, foot) called `render()`, which did `listEl.innerHTML=""` + `actionsEl.innerHTML=""` and rebuilt all rows/buttons from scratch; CSS animations restarted and unchanged rows were destroyed/recreated each step.
- Fix: `index.html` now builds each step row ONCE (`createStepRec`, keyed by step id in `stepMap`) and each footer button ONCE (`ensureFootBtns`). `syncSteps()` reorders via `appendChild` on existing nodes (move, never recreate) and drops only truly-removed ids; `updateStepRec()` patches `dataset`/ARIA/`hidden`/text nodes and rebuilds the small status marker only when its status key changes. `renderFoot()` toggles the persistent buttons + `hidden` flags. The 100ms `tickLive()` still only writes `textContent` of the live/elapsed spans — it never rebuilds. Loop restarts (`startRun`/`retryFrom`/`runAgain`/`cancelRun`) reuse the same nodes. Zero `innerHTML` assignments remain in the page script (all SVG built via `createElementNS` + `setAttribute("class",…)`); added `[hidden]{display:none !important}` so `hidden` survives author `display` rules; grip keeps its `pointerdown`-capture affordance; the head `/*noflash*/` theme guard is untouched. Data, timings (1300/1100/1400/1250/900ms), fail-once-on-slides choreography, retry focus nudge, drag/reorder, rename, add/remove and both themes are unchanged.
- Verification (node only, no browser): `verify-flicker.js` runs the real page script in a `vm` sandbox with a fake DOM + fake clock, drives Run → fail on step 3 → Retry → done → Run again in light AND dark, and asserts: (a) the 5 row `li` nodes (plus marker/name/aside children) are the identical objects before/after every transition and loop restart; (b) an `innerHTML` setter spy records 0 writes across both full loops, and `tickLive` contains no rebuild calls; (c) live text advances (`0.0s`→…), foot goes `Running plan` → `Step 3 failed: Build the KPI slides` → `Running plan` → `Plan done in Xs`, done rows show `took Xs`. All 45 checks pass; `node --check` clean; 44KB < 200KB. How to re-run: `node verify-flicker.js` in this directory.

## How to test
1. Open `index.html` in a browser.
2. Draft: double-click a step to rename, Alt+Arrow to move, `Add step` to append, × to remove.
3. Click `Run plan` → watch live timers → fails on step 3 with `Slides API timed out after 30s` → click `Retry from here` → completes → `Plan done in Xs` → `Run again`.
4. Click sun/moon toggle top-right; reload with OS dark mode to check default theme.
