# Agent Queue — replica report

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
