# agent-recap — clean-room replica report

## What was built
Self-contained `index.html` (23.9 KB, no network, system fonts): an **overnight recap** page —
an "Overnight activity" summary chart (hourly slots 7 PM → 8 AM) plus three boards:
**Needs action (2)**, **Failed (1)**, **Completed (3)**. All CSS/JS inline, no dependencies.

Layout: header (recap title + event counts + time range + sun/moon toggle) →
summary card with animated hourly bar chart, legend, total badges →
3-column boards (stacked on narrow screens). Cards lift on hover, focus-visible
outline, staggered fade-in, 150–200 ms transitions throughout.

## Original data used (from `demo-original.js`, re-typed — no source copied)
- Window: `until` = today 08:10; `since` = `until − 486e5 ms` (13.5 h); `locale: "en-US"`.
- Hour helper `l(h,m)`: `h ≥ 12` → previous day, else same day.
- Events (ids/order/times/titles/details/counts exact):
  1. `refund` · needs · 02:14 · "Refund $240 to Acme Corp" · "Support agent · over the $200 auto-approve limit" · Slack · Approve → Approved
  2. `merge` · needs · 04:37 · "Merge the checkout fix" · "All 212 tests green · needs a code owner" · GitHub · Merge → Merged
  3. `sync` · failed · 03:02 · "Contact sync to the CRM" · "Token expired after 1,284 of 3,900 contacts" · green CRM icon
  4. `tickets` · done · prev-day 19:05 · "Answered support tickets" · "first reply in 2 min" · ×38 · Slack
  5. `stale` · done · prev-day 20:10 · "Closed stale pull requests" · (no detail) · ×6 · GitHub
  6. `triage` · done · prev-day 22:30 · "Triaged new issues" · "4 marked urgent" · ×17 · Linear (#5E6AD2)
- Timings: `onAction` primary resolves after **900 ms** (needs) / **1400 ms** (failed); non-primary returns `undefined`. Replicated exactly.

## Interactions
- **Approve / Merge**: spinner "Working…" 900 ms → "Approved/Merged ✓", card marked resolved, header/column counts update, toast confirms.
- **Retry** (failed): spinner "Retrying…" 1400 ms → card moves to Completed as "Resumed · 3,900 contacts queued after token refresh", toast confirms.
- **Chart ↔ cards**: clicking/hovering an hour slot highlights that hour's cards.
- **Click-to-open details**: card click / Details button / Enter-Space toggles expanded timestamps (`en-US` time + relative); Esc closes. Cards are keyboard-focusable.
- **Relative times** ("5h ago") refresh every 30 s; "updated …" label refreshes on a staged timeout.
- **Theme toggle** (◐/☀, top-right): flips `data-theme="light|dark"` on `<html>`; default follows `prefers-color-scheme`, override persisted to localStorage. Verified in both themes.

## Spec compliance notes (v3)
- 3×3 pixel-mark per agent id: deterministic djb2 hash → palette colour; markup verified to contain **exactly 9 cells** per mark (7 marks: 6 cards + brand). Pending cards twinkle.
- Tools are small circular icons (letter + brand colour), not pills. Titles/model rows single-line ellipsis. Dimmed opacity 0.78 (≥ 0.75). Column headings have reserved 44 px space. Expanded cards keep bottom padding so text never sits under buttons.
- "Token counts, not percentages" and "project + working/agent header" rules target the Crew component and don't apply here (no context usage in demo data); used time-range + event counts instead. No data invented — everything above is from the demo bundle.

## Token audit
All colours via CSS custom properties, same names both themes:
`--page --surface --ink --ink-strong --muted --subtle --border --radius-lg --radius --radius-sm --shadow --working --working-bg --working-ink --waiting --waiting-bg --waiting-ink --failed --failed-bg --failed-ink --info --info-bg --info-ink --accent --focus`.
Light: surface `#ffffff`, page `#fafaf9`, ink `#1c1917`/`#171717`, muted `#78716c`, subtle `#f5f5f4`, border `#e7e5e4`, waiting `#f59e0b/#fef3c7/#92400e`.
Dark: surface `#1c1c1f`, page `#101012`, ink `#ededed`, muted `#a1a1aa`, subtle `#26262a`, border `#2e2e33`, waiting `#fbbf24/#451a03/#fde68a`. No ad-hoc hex on elements (tool dots use brand hues only).

## Contrast results (relative-luminance, WCAG AA ≥ 4.5 — all pass)
| pair | ratio |
|---|---|
| `#1c1917` on `#ffffff` | 17.49 |
| `#78716c` on `#ffffff` | 4.80 |
| `#92400e` on `#fef3c7` | 6.37 |
| `#166534` on `#dcfce7` | 6.49 |
| `#991b1b` on `#fee2e2` | 6.80 |
| `#ededed` on `#1c1c1f` | 14.52 |
| `#a1a1aa` on `#1c1c1f` | 6.63 |
| `#fde68a` on `#451a03` | 12.03 |
| `#bbf7d0` on `#14532d` | 7.52 |
| `#fecaca` on `#450a0a` | 11.16 |

## Verification
- `node --check` on extracted page script: **pass**.
- Headless DOM-stub harness (ephemeral `verify-recap.js`, removed after run): loaded the real page script, ran init, asserted 6 events/ids/order, 900/1400 ms timings, 08:10 anchor, 13.5 h window, 7 pixel-marks × 9 cells, 2/1/3 board split, interval+timeout registered, live-label update after clock advance, `onAction` resolving only after its full delay, theme toggle flipping — **ALL PASSED**.
- Light AND dark themes hand-checked via tokens (dark uses same token names, adjusted surfaces/borders).

## What could not be verified
The Pro `.tsx` source and its exact pixel styling were not available (per spec, never fetched); chart bar heights/geometry are a best-fit interpretation (done counts scaled to max 38, needs/failed = unit bars). Brand glyphs are letter-initial circles, not the original SVG logos.

## How to test
Open `index.html` in any browser (no server needed). Click Approve/Merge/Retry, click chart hours, expand cards, toggle ◐/☀, narrow the window to check stacking.
