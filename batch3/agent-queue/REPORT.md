# Agent Queue — replica report

## Fix pass 4, 2026-11-25 (FLICKER defect — full render() rebuilt the DOM every tick)
Root cause: every demo tick called `render()`, which did `chipsEl.innerHTML = ""`,
`wellEl.innerHTML = ""`, `workersEl.innerHTML = ""`, `svg.innerHTML = ""`,
`liveMsg.innerHTML = ""`, `popDl.innerHTML = ""` and `pauseIcon.innerHTML = ...`,
then re-created every row/card/chart node from scratch. Each step therefore
destroyed the live component tree: CSS animations (pulse, transitions) restarted,
focused/pressed nodes were detached mid-gesture, and the eye saw a full
flash/reload. Loop restarts wiped the containers the same way.
Fix in `index.html` (data, timings, choreography, interactions, themes untouched):
- Build-once/update-in-place: an init-time `buildStaticDom()` pre-creates every
  mutable node — 3 chip slots (each with 3 pre-parsed kind icons toggled by
  `display`, nm/dt spans, badge), 8 overflow square slots, empty/more notes,
  8 worker rows (avatar, nm/dt, bar+fill, state), chart SVG (3 grid lines,
  6 limit rects, area/line/dot paths), 3 y-labels, live `<b>`+`<span>`,
  pause play/pause icons, theme sun/moon icons, and 7 dialog dt/dd pairs.
  `render()` / `renderChart()` / `openJob()` now only mutate `textContent`
  (via a `setText` helper), attributes, `style.display`/`width`/`top`, and
  `setAttribute("class", …)` on the worker bar — zero `createElement`,
  zero `appendChild`/`remove`, zero `innerHTML` after init. Slots are
  positional: empty slots hide (`display:none` + `data-job-id` removed) so
  unchanged nodes keep object identity across ticks AND across 34 s loop
  restarts; focus is never detached (the old focus-restore workaround is gone).
- Per-node click/keydown closures (which captured stale job ids) now read the
  live `data-job-id` off their own persistent node; container delegation and
  the document-level `pointerdown`/`mousedown` capture + Enter/Space backup are
  unchanged, so press-to-open, arrows, Enter, Esc behave exactly as before.
- Dialog refresh while open (`openJob(openId, false)` from the tick) updates the
  same 7 prebuilt dt/dd pairs in place instead of wiping `popDl`.
- `paintThemeBtn` / pause icon toggle prebuilt icon spans by `display` instead
  of `innerHTML`, so theme switches also cause no rebuild.
- Small correctness fix inside the rewrite: `onJobKey` arrow navigation now
  skips hidden (unassigned) slots.
- Added `[hidden]{display:none !important}` (author-display guard for `popErr`);
  chart/SVG nodes are touched via `setAttribute` only (worker bar class too);
  early-theme `/*noflash*/` `<head>` guard byte-identical.
Verification: rewrote in-directory `verify-fix.js` (node only, no packages, no
browser; extracts the LAST `<script>` block since the old greedy extractor broke
on the `<head>` noflash guard). It boots the page in a DOM stub, then: (a) refs
to chip/grid/worker/chart/live/dialog/pause nodes captured after init are
asserted `===`-identical, in order and still attached, after 36×1000 ms ticks
(sim.t 106000→142000, ≥ one full 34 s loop incl. restart) plus rAF/250 ms ticks,
in light AND dark (`applyTheme("dark")`); (b) an instrumented `innerHTML` setter
asserts ZERO assignments after init across all ticks (old code did 6+ per tick);
(c) live message / waiting count / pill move through ≥3 distinct states with the
`Rate limited · Ns` window observed and cleared (loop choreography intact), in
both themes; press-time `pointerdown` capture still opens the popover and Enter
on the never-detached row opens the dialog. Result: 66/66 PASS. The old
rebuild-based expectations (e.g. asserting the pressed node gets detached) no
longer apply and were replaced. `index.html` is 64,082 B (< 200 KB).

## What was built
`index.html` (53 KB, self-contained, inline CSS + JS, system fonts only) replicating the
affectUI **Agent Queue** demo: a live queue of agent jobs flowing into workers, with a
backlog-depth chart. Open `index.html` in a browser to test; no build step, no network.

Layout (matches the original): header row (`Queue` + `agent-jobs` + Live/Rate-limited pill,
Pause button, worker stepper 1–8) → stats row (Waiting / Running n/total / Throughput /min /
Wait p95) → two columns (Backlog chips + overflow grid | worker rows with progress bars +
Done/Failed bins) → `Queue depth` chart → kind legend + live status message.

## Original demo data used (extracted from `demo-original.js`, never invented)
- **Workers:** Sonnet 5.5, GPT-6 Sol, Gemini 3.8 Flash, Haiku 5, GPT-6 mini, Gemini 3.8 Pro
  (Worker 1–6); starts with 4, stepper range 1–8.
- **LLM jobs:** Summarize ticket #4821+ / Zendesk, Draft reply – Acme/Globex/Initech/Umbrella/Hooli /
  Support inbox, Classify 12 support emails / Gmail, Translate release notes / DE, FR, JA,
  Write PR description #470+ / GitHub, Extract invoice fields #2190+ / PDF,
  Score lead – Northwind/Contoso/Fabrikam/Tailspin / HubSpot.
- **Tool jobs:** Scrape pricing page / acme.com/pricing, Embed 240 docs / pgvector,
  Sync HubSpot deals / HubSpot, Post digest to #support / Slack, Open PR #482+ / GitHub,
  Update roadmap page / Notion, Search docs: refunds / Docs.
- **Sub-agent jobs:** Run eval suite / 214 cases, Research competitor pricing / Researcher,
  Triage new GitHub issues / Triage agent.
- **Scripted cycle (34 s loop):** batch of 5× `Embed 240 docs · n/5` @1 s, `Draft reply – Acme VIP`
  (high priority, Enterprise SLA) @3.5 s, rate limit `Token limit 2M/min` for 9 s @7 s,
  fan-out 6× `Classify support emails · n/6` @10.5 s, flaky scrape → `Attempt 1: 504 Gateway
  Timeout from acme.com` → retry @19 s, `Refund order #1193` / Stripe →
  `The card issuer declined the refund – payments are never retried` @25 s.
- **Timings:** per-kind min/max durations, 300 ms worker cooldown, 120 s chart window,
  96 s retention, 106 s pre-roll so the chart/backlog look alive on load.

## Fix pass 3, 2026-11-25 (real-browser keyboard STILL dead — focus never reaches rows)
Why pass 2 fixed the mouse but not the keyboard: the press-time capture
listeners fire synchronously on `pointerdown`/`mousedown`, so clicks survive
the rebuild — but Tab focus does not. `render()` still replaces every chip /
square / worker-row node on each 250 ms step, detaching the focused node, so
the browser drops focus to `<body>`: the next Tab restarts at the top
(Pause/Resume, −/+ only), no focus ring ever appears on a task row, and
Enter/Space reach nothing. A second defect: `.worker[role=button]` had no
`:focus-visible` rule, so even a focused worker card showed no ring.
Fixes in `index.html` (mouse paths untouched, empty-state/pause untouched):
- `render()` now captures `document.activeElement.closest("[data-job-id]")`
  before rebuilding and re-focuses the replacement node with the same
  `data-job-id` afterwards (`focus({preventScroll:true})` with fallback);
  skipped while the dialog is open (focus belongs on Close); if that job is
  gone, focus moves to the first remaining job row. Backlog chips, overflow
  squares, and worker-card jobs therefore stay in the Tab order across ticks.
- Explicit `tabIndex = 0` on backlog/grid `button`s (native but now
  asserted), worker cards keep `role="button"` + `tabIndex = 0` +
  `aria-haspopup="dialog"` + `aria-expanded`; added
  `.worker:focus-visible{outline:2px solid var(--focus);outline-offset:2px}`
  to match `.chip`/`.sq`.
- Enter/Space reuse the existing `safeOpen` path (per-node keydown +
  container-delegated keydown + document capture backup) — unchanged, now
  reachable because focus survives.
Verification: extended in-directory `verify-fix.js` (node, no packages) with
section [9] that models the REAL keyboard gesture with no manual re-query —
Tab-focus a row, run a real 250 ms `tick()` rebuild, emulate the browser's
focus-drop if the node was detached (`activeElement` → root), then dispatch
Enter to *whatever is actually focused* and assert the dialog opens. Covers
backlog chip, overflow square (8 jobs injected so squares exist
deterministically), and worker-card job, plus Tab-focusability / `role` /
`aria-expanded` / `:focus-visible` CSS for all three shapes and Space-to-open.
Result on the fixed file: 44/44 PASS. The same harness with only the
focus-restore disabled fails 10/44 (every "focus still on the SAME job" +
"Enter opens" assertion), proving it reproduces the reported browser symptom
instead of false-passing; the old section-[4] style check (manual refocus
before Enter) still passes on the broken build, which is why it was kept but
no longer relied upon. Mouse sections [1]–[3]/[5], overlay [6], and
empty-state/pause [7] still pass unchanged. `index.html` is now 58,338 B
(< 200 KB); inline JS still passes `node --check`.

## Fix pass 2, 2026-11-25 (real-browser click STILL dead — real root cause)
Why pass 1 failed in a real browser: its stub dispatched a synthetic `click`
directly on the button with no rebuild in between, so 18/18 passed while the
real gesture kept failing. The actual defects, found by reading `tick()`:
1. `render()` ran on EVERY `requestAnimationFrame` (~60x/sec), not every
   250 ms: it destroyed and recreated every job button between the browser's
   `mousedown` and `mouseup`. The press lands on node v-N, the release on
   replacement node v-N+k, so the browser fires `click` on their nearest
   common ancestor (the persistent container, no `data-job-id`) instead of
   on the button — container delegation finds no id, nothing opens. This also
   explains the "covered/obscured" automation verdict and dead Tab+Enter
   (focus evaporates within ~16 ms, key events reach nothing).
2. No covering overlay exists: `.pop-backdrop`/`.pop` are `display:none`
   without `data-open` (verified in CSS), so suspect (a) is ruled out.
3. `openJob` itself was fine but unguarded — any throw would silently swallow
   the gesture.
Fixes in `index.html` (empty-state text and pause behaviour untouched):
- `tick()` now re-renders ONLY when a 250 ms sim step actually elapsed
  (`stepped` flag), so the DOM is stable inside a press→release gesture and
  for keyboard focus (progress bars still update 4x/sec).
- Document-level CAPTURE `pointerdown` + `mousedown` listeners resolve
  `data-job-id` from `event.target` and open synchronously on the live node
  before any rebuild can detach it; plus a document-level capture
  Enter/Space backup. `openJob`/`safeOpen` are idempotent, so press+click
  double-fire is harmless. All click/keydown paths now route through
  `safeOpen`, and `openJob` has a try/catch fallback that still shows the
  dialog and flips `aria-expanded`.
Verification with new `verify-fix.js` (node, no packages — models the REAL
failure: press on v-N → full `render()` tick → release/click retargeted to
the container; asserts dialog open + `aria-expanded` on the replacement node;
also worker-card press, Enter-after-rebuild, no-overlay CSS check,
empty-state/pause regression checks): 24/24 PASS on the fixed file. The same
harness run against the old behaviour (render-every-frame, no capture
listeners) fails 11/24 — including "press never opens" and "aria-expanded
never flips" — proving it reproduces the reported browser symptoms.
`index.html` is now 56,306 B (< 200 KB).

## Fix pass 1, 2026-11-25 (superseded — stub did not model the real failure)
Root cause of the click defect: `render()` rebuilds every job button and worker row
from scratch on each 250 ms tick (`chipsEl.innerHTML = ""` etc.), with click/keydown
listeners attached directly to those transient nodes. Any click (mousedown → mouseup)
or keyboard activation spanning a rebuild lands on a detached node, so its handler
never fires — and focus is dropped on every tick, so Enter/Space rarely reaches a live
button either. The dialog itself (`#pop` / `#backdrop` with `[data-open]`) was fine;
`openJob()` set the attributes correctly in isolation. There was no covering overlay
(`.pop-backdrop`/`.pop` are `display:none` when closed).
Fixes applied in `index.html`:
- Delegated open: one bubbling `click` + `keydown` listener on each persistent
  container (`#chips`, `#well`, `#workers`) resolves the job via
  `closest("[data-job-id]")` and calls `openJob(id)`, so rebuilds can't drop events.
  Per-node listeners are kept as a second path; `openJob` is idempotent.
- Worker rows now carry `data-job-id` + `aria-haspopup="dialog"` + `aria-expanded`
  (previously only backlog buttons had a job id); all `[data-job-id]` nodes sync
  `aria-expanded` on open/close.
- `openJob(id, doFocus)`: the 250 ms tick refresh now calls `openJob(openId, false)`
  so it no longer steals focus to Close on every tick; initial open still focuses
  Close, and `closePop()` restores focus to the invoking job.
- Click AND Enter/Space verified to open the dialog (queued job shows Move to front
  + Cancel) via an in-directory stub harness (`vm.Script` + minimal DOM stub, no
  packages): 18/18 assertions pass, including delegated-container click, direct
  button click, Enter keydown, worker-card click, and dialog surviving a `render()`.
- Empty state: `well` empty text is now exactly `Nothing waiting` (was `Grid clear.`
  / `Waiting for jobs…`); `Grid clear.` no longer appears anywhere.
- Minor sim fix matching the original: on flaky retry the worker cooldown is now
  keyed by the captured worker id (was `sim.free[j.worker || ""]` after `j.worker`
  had been cleared, so the cooldown never applied).
Kept v3 spec (tokens, dark mode, layout, behaviour); `node --check` passes.

## Pause / empty-state evidence (from `demo-original.js`, kept as-is)
- Pause keeping arrivals flowing IS the original behaviour. The original step
  function advances time, fires scripted arrivals, and tops up background arrivals
  (`for(;e.t>=e.next;)…`) unconditionally; only the progress/dispatch block is
  gated (`if(!e.limits.some(…)){ …progress…; if(!e.paused){ dispatch } }`). The
  replica does the same (arrivals + `fireOnce` run every tick; only dispatch is
  gated by `!sim.paused`), so nothing was changed here.
- The original empty-state element is `className:"ui-agq__empty"` with
  `children:"Nothing waiting"`, rendered when the waiting list is empty
  (`I.length===0`). The replica now uses that exact string.

## Interactions
Jobs arrive continuously, move into free workers, progress bars fill, jobs complete/fail/retry;
backlog chart updates live with rate-limit shading; Pause/Resume halts dispatch; stepper adds /
removes workers; clicking any queued/running job (or worker row) opens a details dialog
(status, waited, position, worker, priority, attempt, error) with Move-to-front, Cancel, Close;
keyboard: Tab + arrows navigate jobs, Enter opens, Esc closes. Narrow screens stack columns
and stats go 2×2. `prefers-reduced-motion` disables animation and slows the tick.

## Tokens, themes, verification
- All colours are CSS custom properties in two marked token blocks (`:root` light,
  `html[data-theme="dark"]` dark) using the v3 spec values (page `#fafaf9`, surface `#ffffff`,
  ink `#171717`, muted `#78716c`, border `#e7e5e4`, radii 16/10/6, waiting amber `#f59e0b` on
  `#fef3c7`/`#92400e`, dark: page `#101012`, surface `#1c1c1f`, ink `#ededed`, muted `#a1a1aa`,
  border `#2e2e33`, waiting amber `#fbbf24` on `#451a03` with `#fde68a` text).
- Two small deviations for contrast: light success text `#177245` (was `#1e8a4f`, 4.4→6.0:1 on
  white) and dark faint `#8e8e96` (was `#71717a`, 3.5→5.2:1); warning stat text uses the amber
  foreground token, not the dot colour.
- Sun/moon theme button top-right; default follows `prefers-color-scheme`, override persisted
  to `localStorage`.
- **Token audit:** regex `#[0-9a-fA-F]{3,8}` outside the two token blocks returns exactly one
  match — `#1193`, which is the order number inside the original job name
  `Refund order #1193`, not a colour. No other hard-coded colours (shadows use `rgba()`,
  chart uses `var()`/`currentColor`).
- **Contrast (normal text, WCAG AA ≥ 4.5):** light ink 17.9, muted 4.8, wait 6.4, err 5.5, ok 6.0;
  dark ink 14.5, muted 6.6, wait 12.0, faint 5.2 — all PASS. Checked by computing relative
  luminance in both themes; page renders finished in dark (not just inverted).
- **Sanity checks:** JS parses (`node --check` on the extracted inline script),
  every `getElementById` target exists, only URL-like string is the SVG namespace
  (no network), stub harness (`vm.Script` + DOM stub, no packages) opens the dialog
  via click AND Enter with Move to front / Cancel visible (18/18 pass), file is
  53 KB (< 200 KB limit, changed from 51,383 bytes).

## Could not verify
Pixel-perfect match against the deployed site (no screenshot tooling in this environment);
behaviour was verified against the compiled demo bundle's logic by reading, not copying it
(clean-room: all markup/CSS/JS written fresh).
