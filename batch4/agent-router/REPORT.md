# agent-router replica — REPORT

## What was built
- Single self-contained `index.html` (40,893 bytes, no network, system fonts) replicating the
  affectUI Pro **agent-router** component: a router agent assigning incoming requests to agents
  by confidence, or to a human.
- Clean-room implementation: own HTML/CSS/JS written from the demo's behaviour. No code copied
  from `demo-original.js`; only behaviour/data were extracted.
- How to test: open `index.html` in a browser. The demo loops automatically; click any request
  card to open its score panel and reroute it; click an agent to pin/focus it; use arrows +
  Enter/Escape; toggle the theme button top-right.

## Original data used (exact, from demo-original.js)
- Router: `Router`, model `Claude Haiku`.
- Agents: `Billing`/`Claude Sonnet` (load .2, queue 1), `Tech support`/`GPT-5` (load .35, queue 2),
  `Sales`/`Gemini 2.5 Flash` (load .1, queue 0), `Support lead`/`Human` (human, load 0).
- Flow requests r1–r4 with exact titles, senders, channels, previews, targets, confidences
  (.94/.90/.92/.48), full score maps, reasons, working strings, tags:
  - r1 `Refund for order #4821` (maria@northwind.io, email) → billing — "Mentions a double charge…"
  - r2 `Can't log in after reset` (Jonas · Chat, chat) → tech — "Login and password reset…"
  - r3 `Pricing for 300 seats` (Acme · Ticket, ticket) → sales — "A large seat count…"
  - r4 `Delete all my data` (lena@fastmail.com, email) → human — "A legal request with a deadline…"
- Static routed items: e2 `Invoice address change` → billing (.96), e1 `API returns 502` → tech (.88).
- Timings exactly as original: steps `new:900ms → routing:1700ms → routed:2600ms`, first-item
  delay 1200ms, end-of-loop pause 4200ms, then loop restarts. Reduced-motion shows the final
  state with no timers.
- Behaviour matched: router activity `Reading "…"` while routing else `Waiting for requests`;
  picked agent becomes `Working` with the request's `working` string, load +.25, queue count;
  human becomes `Needs you` when escalated; header shows `N routing / N needs you / N routed`;
  reroute panel sorts scores desc, announces `X → Y (N%)` in the aria-live region.
- Pixel-mark: deterministic 3×3 per agent id (≥5 cells on; human always solid 9), delays
  `[0,120,240,120,240,360,240,360,480]`, twinkle animation while working. Markup contains
  exactly 9 `<i>` cells per mark (verified). Agent colours use the original 6-entry palette.
- Nothing invented: all names/models/tasks/scores/reasons/timings are the original demo data.

## Interactions
- Auto-play loop through r1→r4 with new/routing/routed states; static e1/e2 stay routed.
- Click request → detail panel (title, preview, sorted score bars, reason, reroute buttons).
- Reroute updates assignment + live announcement; manual overrides reset on loop restart.
- Click agent → pins it (others dim to opacity .78, never below .75 per spec v3).
- Keyboard: roving focus, Arrow/Home/End navigation, Enter/Space activate, Escape clears.
- Responsive: `lanes` (wide, slot→hub→agent lanes with task-queue inboxes + human badge),
  `columns` (3-col), `narrow` (<560px, stacked). Single-line ellipsis everywhere; no text
  under buttons; reserved heading space per column.

## Token audit
- All colours via CSS custom properties; no ad-hoc hex per element. Light tokens match spec
  (surface #ffffff, page #fafaf9, ink #171717, muted #78716c, subtle #f5f5f4, border #e7e5e4,
  radii 16/10/6, soft shadow, 999px pills, 3px meter bar, 150–200ms transitions).
- Dark theme via same tokens (surface #1c1c1f, page #101012, ink #ededed, muted #a1a1aa,
  subtle #26262a, border #2e2e33, darker shadows); amber waiting adjusted to #fbbf24 on
  #451a03 / text #fde68a. Toggle switches `data-theme` on `<html>`; default follows
  `prefers-color-scheme`. Both themes visually finished (cards, inboxes, panel, links).

## Contrast results (computed)
- Light: ink/surface 17.9, muted/surface 4.8, brand 5.5, warn 6.4, danger 4.8 — all ≥ 4.5.
  Light ok-pill (green 3.9) passes UI 3:1, same as original.
- Dark: ink 14.5, muted 6.6, brand 7.4, ok 7.8, warn 12.0, danger 6.1 — all ≥ 4.5.
- Dimmed nodes stay at opacity .78 (≥ .75), fully legible.

## Verification
- `node --check` on the extracted page script: OK.
- Headless stub-DOM run (temporary `verify.cjs`, since removed): loaded the page script,
  advanced the timer queue 10 steps — header cycled `2 routed → 1 routing → 3 routed …`,
  all original data strings present, 4 pixel-marks × exactly 9 cells, theme/keyboard/no-network
  checks passed (`VERIFY OK`). A previous component froze with 8 cells; this one asserts
  9 cells per mark in the harness.

## What could not be verified
- Pixel-perfect match to the original site (only the compiled demo chunk was available).
- Real browser paint / SVG link geometry (stub DOM has no layout; links fall back safely).
- `prefers-reduced-motion` and `prefers-color-scheme` paths were code-reviewed, not run live.
