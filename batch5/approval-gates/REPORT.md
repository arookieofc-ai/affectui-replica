# approval-gates — replica report

## What was built
Self-contained `index.html` (43,115 bytes, no network, system fonts) replicating the
affectUI Pro "approval-gates" component: a summary header + a stack of agent approval
requests decided one by one, with diffs/reasons, a pager, holds line, and a Decided list.
All code is original; the compiled demo (`demo-original.js`) was read only to extract
data, timings, and behaviour.

## Original data used (verbatim strings, not code)
- Title `Approvals`, task `Launch the new pricing page`.
- Gate `migrate` — Coder / Tool call / `Run the database migration` / `Writes to the
  production database` / pre-approved `6m ago`, JSON migration input, files
  `prices, plans, subscriptions`, context `Wrote 2026_11_05_add_seat_prices.sql`,
  `Dry run passed on staging`.
- Gate `prices` — Coder / File change / `Change prices in pricing.ts` /
  `Changes what customers pay from Monday` / `1m ago`, 6-line diff of
  `src/billing/pricing.ts` (seat 8→10, team 12→15 + minSeats 3), holds
  `Deploy to production, Post to #launch` → auto-approved at **t=3.6s**.
- Gate `email` — Growth agent / Message / `Email 1,284 trial users` /
  `Sends to customers outside the team` / `just now`, subject+body input, holds
  `Schedule the send` → auto-edited at **t=7.4s** with note
  `Changed to: Subject: Our new plans – your price stays`.
- Gate `browser` — appears at **t=5.2s**, Researcher / Sub-agent /
  `Start a browser agent` / `Signs up for competitor trials on its own`,
  prompt about Linear/Notion/Figma trials, holds `Compare checkout flows` →
  auto-rejected at **t=10.6s** with note `Rejected – read public pages only, no sign-ups`.
- Loop **14s**, tick **100ms**, leave animation **360ms**, live while t<10.6.
- Labels: `Tool call/Arguments`, `File change/Changes`, `Sub-agent/Prompt`,
  `Message/Message`; outcomes `Approved / Approved with changes / Rejected`;
  pill `Waiting on you / Running / Done / Stopped`; run line
  `Paused – N steps wait on M gates` / `Stopped at "…"`.

## Interactions
Approve / Reject / Edit (`Ask for changes` for file kind, textarea + `Approve with
changes`, Cmd/Ctrl+Enter submits, Esc cancels) / Full context toggle (Before this +
Touches) / pager ‹ n of m › / back-card click-to-select / expandable Decided rows /
←/→ keyboard paging / Replay demo button / polite live-region announcements /
user decision pauses the auto-run (as in the original). Reduced-motion disables animation.

## Agent identity: 3x3 pixel-mark
Each agent id hashes (FNV-1a) to a hue + symmetric 3×3 bit pattern rendered as a
`.px` mark containing **exactly 9 `<i>` cells** (verified in harness, initial and
mid-demo states). The front (blocking) card's mark twinkles; decided rows keep the
original check/cross status icons.

## Token audit
All colours come from CSS custom properties under `html[data-theme]`; no ad-hoc hex
per element. Light: surface `#ffffff`, page `#fafaf9`, ink `#171717`, muted `#78716c`,
subtle `#f5f5f4`, border `#e7e5e4`, radius 16/10/6px, pills 999px via badge radius,
shadow soft 2-layer, waiting amber `#f59e0b`/`#fef3c7`/`#92400e`. Dark: surface
`#1c1c1f`, page `#101012`, ink `#ededed`, muted `#a1a1aa`, subtle `#26262a`, border
`#2e2e33`, waiting `#fbbf24` on `#451a03`/text `#fde68a`. Theme toggle top-right,
`data-theme` on `<html>`, default from `prefers-color-scheme`. Both themes checked.

## Contrast results (WCAG AA, small text ≥ 4.5)
Light: ink/surface 17.93 ✓, muted/surface 4.80 ✓, wait 6.37 ✓, ok 5.27 ✓ (darkened
`#1e8a4f`→`#157347` from the original value to pass), danger 4.82 ✓, brand 5.49 ✓
(darkened `#2f6bff`→`#2456d6` to pass), on-solid/solid 17.93 ✓.
Dark: ink 14.52 ✓, muted 6.63 ✓, wait 12.03 ✓, ok 6.83 ✓, danger 6.73 ✓,
brand 6.74 ✓, on-solid 15.72 ✓.

## Verification
- `node --check` on the extracted page script: OK.
- Headless DOM-stub run (fake timers, `t` advanced 0→11s): **33/33 checks passed** —
  initial front card, auto-approve at 3.6s, browser arrival at 5.2s, edit at 7.4s,
  reject/stopped at 10.6s, leaving-card lifecycle, holds line, replay reset,
  theme toggle both ways, click + keyboard delegation, 9-cell pixel-marks.
- `index.html` < 200KB (43KB), zero external references.

## How to test
Open `index.html` in a browser: watch the 14s loop auto-decide, click Approve/Reject,
Edit, Full context, pager arrows, Decided rows, Replay demo, and the Dark/Light toggle.
