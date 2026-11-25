# agent-state-machine — replica report

## What was built
`index.html` (55 KB, self-contained, no network, system fonts only): a clean-room
replica of the affectUI Pro **agent-state-machine** component — an agent rendered as
a state diagram with transitions, counts, and a current-state glow.

- **Header**: 3x3 pixel-mark identity + agent name + model, right side shows the
  live transition total ("N transitions") and a status badge with pulse while running.
- **Diagram**: 10 state cards on a 4x3 grid with per-state accent colours, routed SVG
  edges (straight / elbow / same-column verticals / top back-lane / self-loop),
  origin dots, a start marker, and count chips (`N×`, dashed when never taken).
- **Current-state glow**: agent-coloured ring + sheen sweep; waiting/error/final
  variants tint amber/red/green; a 4-beam light animation runs along the most
  recently taken edge.
- **Interactions**: states auto-advance on the original dwell schedule, then HOLD at
  "Waiting for you" until the user clicks Approve/Reject (see note below);
  hover/focus a state to trace its chain (connected edges/nodes light up in agent
  colour + glow, the rest dim to 0.55/0.45/0.30); click a state for its card
  (kind chip, Now chip, description, tool icons, Time here / Entered, leaves-to
  list); click a count chip for the transition card (Retry/Back/Transition chip,
  route, detail, Taken / Share of exits); waiting + current card offers
  **Approve** (advance) / **Reject** (restart); Esc closes; keyboard-focusable
  throughout; `prefers-reduced-motion` disables animation.
- **Page frame**: run title "Billing fix" + "1 working · 1 agent" + sun/moon theme
  toggle (top-right, `data-theme` on `<html>`, stored choice wins, otherwise follows
  `prefers-color-scheme`).

## Original data used (transcribed from demo-original.js, not copied as code)
- Agent: id `atlas`, name `Atlas`, model `Claude Opus 5.5`.
- 10 states with exact labels/colours/descriptions/tools/positions, e.g.
  `Planning #8b5cf6`, `Recalling memory #6366f1`, `Calling tool #0ea5e9`,
  `Waiting for you` (waiting) `#e8a200`, `Delegating #f97316`,
  `Reading results #14b8a6`, `Running tests #84cc16`, `Fixing error` (error)
  `#e5484d`, `Writing answer #ec4899`, `Done` (final) `#1fa855`.
- All 16 transitions with labels and the three detail strings
  ("The test runner timed out after 30s …", "The first search found the caller …",
  "test_invoice_totals: expected 104.99, got 105.00").
- The 18-step visit timeline with exact dwell times
  (2000…3800 ms, 33.8 s loop + 420 ms fade) and per-state average times
  (plan 6 s … ask 41 s); same time/count formatters (`3s`, `2m 05s`, `12.5K`).
- Pixel-mark: deterministic hash → ≥5-on 3×3 pattern with per-cell delays
  0/120/240/120/240/360/240/360/480 ms and twinkle while busy; glyph set
  (ring / clock / cross / bullseye); kind labels ("Waits for a person" etc.).

## QA fixes (visual round 1, 2026-11-25)
1. **Clipped state card (round 1)** — the popover used a fixed below/above
   offset with no clamping, so tall cards overflowed the canvas and the
   track's `overflow-y:hidden` made buttons unclickable. Fixed then with
   estimated flip + clamping + `max-height`/`overflow-y:auto`; track changed
   to `overflow-y:auto` + paddings. Superseded by round 2 below.

## QA fixes (visual round 2, 2026-11-25 — card bottom clipped, both themes)
- **Symptom re-checked by browser QA**: the details card for "Recalling memory"
  / "Waiting for you" showed "Time here / Entered" half-cut with "Leaves to"
  + Approve/Reject hidden below the fold INSIDE the card behind an internal
  scrollbar. Root cause: the round-1 fix capped the card to canvas space
  (middle-row nodes have only ~112px below / ~150px above inside the ~356px
  canvas for a ~230–330px card), so `max-height + overflow-y:auto` *guaranteed*
  an internal scrollbar. Scrolling is explicitly not acceptable at ~1920x900.
- **Fix**:
  - `#asm-pop` moved out of `.asm-track/.asm-zoom` to be a direct child of
    `section.asm` (no scrolling/clipping ancestor can cut it anymore).
  - Card compacted to match: `.pop` gap 8→6, padding 12/12/14→8/10/10,
    title 13/18→12.5/16, text clamp 4→3, tools gap 4→3, stats/list
    padding 8→6 with tighter type, actions padding 8→6, buttons 28px/13px→
    26px/12.5px. Tallest card (plan, 4 leaves-to rows) is now ~260px;
    mem ~200px, ask (with Approve/Reject) ~228px. Desktop `.pop` is
    `max-height:none; overflow:visible` — no internal scrollbar (an internal
    scroll remains ONLY in the ≤560px narrow fallback media query).
  - `renderPop` rewritten viewport-aware: `popNaturalHeight()` estimates the
    compact card height from content rows; `placePop()` measures real space
    via `getBoundingClientRect()` + `window.innerHeight/Width` (fallback
    constants match this page at 1920x900: asm top ~96px, canvas ~74px below
    `.asm` top), flips below/above by real available space, and clamps both
    axes so the full card sits inside `[8, VH-8]` / `[8, VW-8]`. `fit()` no
    longer counter-scales the pop (it lives outside the scaled zoom).
2. **Wait at "Waiting for you"** — `demo-original.js` (`F` timeline + `L`
   component) auto-advances `ask→tool` after 3400 ms (`onApprove` is only a
   fast-forward, `onReject` restarts). Per the QA instruction the replica now
   intentionally deviates: `advance()` clears the timer and holds at `ask`
   until the user clicks Approve (resume) or Reject (`reset()`), so the buttons
   stay clickable as long as needed.
3. **"Recalling memory" truncation** — node width `150→172px` (`NW=172`,
   `GX=48` to keep `CW=864` inside the page), label `13→12.5px` with tighter
   tracking; `16 chars × ~6.8px ≈ 109px ≤ 133px` available, no ellipsis.
4. **Top-lane chips halved** — back-lane moved `16→26px`, grid top `PT=52→62`,
   track `padding-top:14px`, lane minimum `chipY-9=17px ≥ 8px`; track no longer
   `overflow-y:hidden`.
5. **Weak hover highlight** — lit chain now uses `var(--agent)` at `2.4px` with
   glow (`drop-shadow`), ringed nodes/chips; non-chain dims to
   `0.30` (edges/dots) / `0.45` (chips) / `0.55` (nodes) so the Planning chain
   is clearly distinguishable from merely-traversed edges.

## Timing re-extraction (QA claim 4)
Re-parsed `demo-original.js`: `F=[plan 2e3, mem 1600, plan 1400, tool 1600,
read 1600, plan 1400, delegate 2e3, read 1600, plan 1400, ask 3400, tool 1400,
tool 1600, read 1600, tests 1800, fix 1800, tests 1600, write 2200, done 3800]`,
`I={plan:6e3, mem:3e3, tool:12e3, read:7e3, ask:41e3, delegate:38e3,
tests:26e3, fix:9e3, write:12e3, done:0}`. Dwell sum = **33800 ms (33.8 s,
34.22 s with the 420 ms fade)** — identical to the replica's `TIMELINE`/`AVG`.
The "~2.5 min" QA reading is not supported by the source; REPORT's `~34 s`
stands. (Wall-clock per full loop is longer now only because the run pauses at
`ask` until the user acts — that is the requested behaviour, not a timing
regression.)

## Interactions verified (headless harness, not just syntax)
`verify.cjs` (**kept in this directory**, run `node verify.cjs`) stubs
`document/window(1920×900)/localStorage/timers`, loads the page script, and
drives its real timers: boot on `plan` with glow; `TIMELINE`/`AVG` deep-equal
the original `F`/`I`; totals 33800 ms; loop holds at `ask` (no pending timer),
Approve advances `ask→tool` (approved count 1×), Reject restarts to `plan`;
node width fits "Recalling memory"; top chips inside canvas + track padding;
lit chain uses agent colour/2.4px/glow with dimmed rest; edge-chip card
renders Taken/Share/details; 10 states, 16 edges. Round-2 card asserts:
pop is a direct child of `.asm` (no clip ancestor), desktop `.pop` has
`max-height:none; overflow:visible` with no `overflow-y:auto`, and for the
tallest content the modelled height matches an independent row audit while
`est ≤ available viewport space` and `scrollHeight (est) ≤ clientHeight
(avail)` — i.e. ALL rows (Time here / Entered / Leaves to / Approve-Reject)
visible with NO internal scroll — for `mem`, `ask`, plan (tallest), all 10
state + all 16 edge cards at 1920×900.
Result: **ALL PASS** (54 assertions). `node --check` on the extracted script:
clean.

## Token audit
All colours are CSS custom properties under `html[data-theme]`; no hard-coded
hex on elements. Light: surface `#ffffff`, page `#fafaf9`, ink `#171717`,
muted `#6e6862`, subtle `#f5f5f4`, border `#e7e5e4`, radii 16/10/6 px (pills 999),
status amber `#f59e0b`/`#fef3c7`/`#92400e`. Dark: surface `#1c1c1f`,
page `#101012`, ink `#ededed`, muted `#a1a1aa`, subtle `#26262a`,
border `#2e2e33`, amber `#fbbf24`/`#451a03`/`#fde68a`.

## Contrast results (WCAG, computed)
Light — ink 17.9, soft 11.1, muted 5.5 (surface) / 5.0 (subtle) / 4.9 (tag),
waiting 6.4, running 5.2, ok 5.3, failed 5.9. Dark — ink 14.5, soft 11.5,
muted 6.6 (surface) / 5.9 (box) / 5.5 (tag), waiting 12.0, running 7.7 / 6.9 (box),
ok 9.3, failed 8.5. All ≥ 4.5:1. (Light muted was raised `#78716c→#6e6862`
after the audit to clear the tag/subtle backgrounds.)

## What could not be verified / notes
- The original uses React + Popover API + WAAPI; this replica uses vanilla JS,
  an absolutely-positioned card, and CSS/SMIL-free beam paths — same look and
  behaviour, own code. One intentional deviation: the original auto-advances
  past `ask` after 3400 ms; the replica holds there until Approve/Reject per QA.
- Tool logos in the original are brand SVGs; here they are small circular icons
  with per-tool colours + initials (per v3: circular, not pills).
- Narrow screens (≤560px): the diagram scales to fit and the track scrolls
  horizontally; tall cards may scroll internally there (`max-height:300px` +
  `overflow-y:auto` narrow fallback) so every row and button stays reachable.
  On desktop there is no internal card scroll — the card is compact and
  viewport-clamped instead.

## How to test
Open `index.html` in a browser (double-click works, no server needed). Wait
~15 s to reach "Waiting for you" (the run holds there) — click the state to see
the full card (Time here / Entered / Leaves to + Approve/Reject), Approve to
resume, Reject to restart; click states and count chips, hover Planning to see
the strengthened chain, toggle the sun/moon button, and check both themes.
Run `node verify.cjs` for the 54-assertion headless check.
