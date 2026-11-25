# Agent Queue — replica report

## What was built
`index.html` (50 KB, self-contained, inline CSS + JS, system fonts only) replicating the
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
- **Sanity checks:** JS parses (`node --check` equivalent via `vm.Script`), every
  `getElementById` target exists, only URL-like string is the SVG namespace (no network),
  file is 50 KB (< 200 KB limit).

## Could not verify
Pixel-perfect match against the deployed site (no screenshot tooling in this environment);
behaviour was verified against the compiled demo bundle's logic by reading, not copying it
(clean-room: all markup/CSS/JS written fresh).
