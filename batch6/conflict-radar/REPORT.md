# conflict-radar — clean-room replica report

## What was built
`index.html` (~35 KB, single file, no network, system fonts) — a
standalone replica of the affectUI Pro `conflict-radar` component:
per-file, per-agent view of branch conflicts with resolution choices and merge.

- Header bar: radar icon + title `Parallel work` + merge button whose label
  animates through `Waiting for N agents` → `N conflicts to settle` →
  `Merge N branches` (ready state, dark chip) → `Nothing to merge`.
- Grid card: header row (file column + legend + one agent column each with a
  deterministic **3x3 pixel-mark**, name, and hover KPI card showing
  files/conflicts/kept counts + model), one row per file with status dot,
  split dir/name path, per-agent bars (`Changed` blue / `Conflict` amber /
  `Kept` green / `Left out` grey, pulsing sheen while the edit is active),
  hover tooltips (`Writing…`, line spans, overlap lists), and an animated
  conflict link line between overlapping agents. Legend head + foot (foot only
  on narrow screens).
- Pick card: `Pick a way` / `Settled` panel with per-agent radio ways (pixel-
  mark, name, `Kept` badge, summary), calm states (`Watching N agents for
  overlaps`, `No overlaps – the branches merge cleanly`, `No changes yet`).
- Behaviours: 200 ms tick, 26 s looping demo; agents flip Working→Done at
  their done-times; two resolutions auto-apply at 16.5 s / 19.5 s; clicking a
  conflict row focuses it; picking a way marks Kept/Left-out; merge enables
  only when zero open conflicts, zero working agents, ≥1 active branch.
  Keyboard: Tab + Enter/Space, arrow keys inside the radiogroup,
  focus-visible outlines. Narrow container stacks (pixel-marks/names collapse,
  legend moves to foot, ways become rows). `prefers-reduced-motion` disables
  animation.

## Original data used (extracted from demo-original.js, not copied)
- Agents: `fix` Checkout (`Opus 5.5 · fix/flaky-checkout`), `stripe` Stripe v2
  (`GPT-5 · chore/stripe-v2`), `retry` Retries (`Grok 4 · feat/payment-retry`).
- 10 edits with exact `from`/`to` timings over the 26 s loop, 6 files in order
  (`src/checkout/payment.ts`, `src/checkout/receipt.tsx`,
  `tests/checkout.spec.ts`, `src/lib/stripe.ts`, `src/lib/retry.ts`,
  `package.json`), done-times `{fix:10.5, stripe:11.5, retry:14}`, auto-
  resolves `[16.5 payment→stripe]`, `[19.5 checkout.spec→retry]`, and the three
  verbatim summaries (idempotency-key, receipt-waits, backoff-wraps).
- Note: `receipt.tsx` edits (`[12,30]` vs `[90,104]`) never overlap, so at most
  **2** simultaneous conflicts (payment.ts, checkout.spec.ts) — verified in run.
- Conflict rule (same as original): different agents, both spans present,
  spans intersect. All markup/CSS/JS written from scratch.

## Interactions (all working, headless-verified)
Theme toggle · row focus · way pick → Kept · merge ready/click · 26 s wrap ·
auto presets (cycle 2 proves payment→stripe with no clicks) · hover KPI/tips
(CSS) · keyboard radios.

## Token audit
All colours are CSS custom properties (no ad-hoc hex): `--surface --page
--ink --muted --subtle --border --radius-lg --radius --shadow`, status
`--waiting* --ok* --edit-* --hit* --chip*`, on `html[data-theme]`. Verified
present by harness. Two tokens darkened vs the compiled demo so badges pass
AA: light `--edit-ink #0190fe→#0170c0`, `--ok-tag #1e8a4f→#166534`.

## Contrast results (harness-computed, WCAG ratios)
Light: ink/surface 17.93 · muted 4.80 · waiting 6.37 · ok-tag 6.37 ·
edit-ink 4.54 · hit 3.92 (large/bold-adjacent, ≥3) · chip 17.93.
Dark: ink 14.52 · muted 6.63 · waiting 12.03 · ok-tag 7.17 · edit-ink 7.16 ·
hit 7.30 · chip 16.44. **All pass** (text ≥ 4.5, hit accent ≥ 3.0).
Checked in both themes via toggle (default follows `prefers-color-scheme`).

## Verification
- `node --check` on the extracted page script: **OK**.
- `node harness.cjs` (in this directory): minimal DOM stub + fake clock drives
  the real page script through t = 0/8/13/17/20/21/25/27/44 s — **ALL CHECKS PASSED**
  (119 checks: layout, pixel-mark cell counts, timings, clicks, toggle,
  contrast, tokens, plus the grid probes and round-3 nesting asserts). Pixel-marks: 6 in
  header (visible + KPI per agent), each **exactly 9 cells**, distinct hues per
  agent id, twinkle while working. Merged banner + `Merged ✓` persist at
  t = 21/25 s and the loop still wraps cleanly at 26 s.
- Could not verify: pixel-perfect match to the Pro .tsx (not available);
  only the public compiled demo + spec were used.

## Round-3 fix (REAL root cause — round-2 diagnosis was wrong)

Browser re-QA failed the round-2 build in both themes while the 120/120
stub harness passed. Round 2 blamed an unclosed `<b>` + `display:contents`;
both were wrong/incomplete: the `<b>` tags were already closed (`</b>` was
present) and no `display:contents` remained. The real defects were
**span-nesting hierarchy bugs** the string-matching harness could not see:

1. **Header:** the template closed the top row immediately after the name —
   `"...<b>"+name+"</b></span>"+'<span class="cr-kpistate">'...` — evicting
   the state badge AND leaving `.cr-kpimodel` (full `Opus 5.5 · …` model) and
   `.cr-kpis` (`3 Files 0 Conflicts…`) as **always-visible flex children of
   `.cr-head`** instead of children of the hidden `.cr-kpi`
   (`position:absolute; visibility:hidden`). The hide selector therefore
   never applied to them (selector/class mismatch: it hid the wrapper, but
   the markup didn't nest the details inside it). The visible counts
   squeezed `.cr-hname` to a truncated stub, avatars sat on count text, and
   because `.cr-head{overflow:visible}` the overflowing counts spilled over
   neighbouring tracks — the exact 'squeezed into one row, cut off at the
   container edge' render. It also left one stray `</span>` per header,
   confirmed by `html.parser` reporting `unmatched </span>`.
2. **Legend:** no legend bug of its own — the 'Kept covered' render was the
   header overflow from (1) painting over the file column (legend itself
   clips with `overflow:hidden`, so Kept showed only `ept`/`Ke` at the edge).
   Removing the overflow source restores the full legend; legend markup/CSS
   unchanged.
3. **payment.ts `Lines 52–80` in the File column:** same bug class in the
   cell tooltip — `"...<b>"+name+"</b></span>"+state+"</span></span>"+meta+
   "</span>"` closed `.cr-tip` early, leaving `.cr-tipmeta` (the line-range)
   as a **visible static sibling** of the hidden `.cr-tip`, plus one stray
   `</span>` per filled cell. Browsers re-parented the strays, closing
   `.cr-cells` early and dumping the orphan line-range into the file column
   (worst on payment.ts: 3 filled cells = 3 strays). Other rows had fewer
   filled cells so they happened to land correctly.
4. **Fix (2 lines):** delete the `</span>` right after `</b>` in both
   templates so the state badge nests *inside* `.cr-kpitop`/`.cr-tiptop`
   and the outer popup stays open to contain model/counts/meta:
   `"</b>"+'<span class="cr-kpistate">'`, `"</b>"+'<span class="cr-tipstate">'`.
   Verified with a REAL parser (`html.parser` over the actual `t=13 s`
   generated output, not string search): zero parse errors / unclosed tags,
   `cr-kpimodel`/`cr-kpis` chain `cr-head > cr-kpi > …`, every `cr-tipmeta`
   chains `cr-cell > cr-tip > cr-tipmeta`, all 10 line-ranges sit in their
   own agent's column via tree walk, no `Lines`/`Line` text in any
   `.cr-file`, legend reads `Changed Conflict Kept`. `node --check` OK,
   stub harness updated (its old `<b>` check encoded the buggy pattern as
   'good' — now asserts the fixed nesting + absence of `</b></span>`) and
   passes 119/119. Merge flow untouched: green banner + `Merged ✓` persist
   until the 26 s loop reset.

## Round-2 fix (header/table overlap — merge part untouched, still passing)
Browser re-QA failed the header/table layout in both themes while the merge
flow passed. Root causes found in `index.html`:

1. **Malformed markup the stub could not see.** The KPI header
   (`cr-kpitop`) and cell tooltip (`cr-tiptop`) opened `<b>` for the agent
   name but closed it with `</span>` (`"<b>"+name+'</span>'`). The harness
   matches strings so it passed, but a real HTML parser re-parents the
   unclosed `<b>`, breaking the KPI/tooltip layout — model text (`Opus 5.5 ·
   fix/flaky-checkout`, …) and the `Files`/`Kept` badges spilled over
   neighbouring columns. Both are now properly closed
   (`<b>name</b></span>`).
2. **Fragile `display:contents` flattening.** Header row, data rows and the
   `#fileRows`/`#agentHeads`/`.cr-cells` wrappers relied on
   `display:contents` (4-column flat grid incl. `display:grid` on `<button>`
   rows). This never took effect reliably in the browser, so agent columns
   overlapped and tooltips (whose containing block vanished with the
   wrapper's box) landed under the File column / in a single band. It also
   made the conflict-link math relative to the whole row instead of the
   cells area.
3. **Fix — nested grid exactly like the original:** each `.cr-row` (header
   AND every data row, same rule, same widths) is now
   `grid-template-columns: minmax(var(--filew),1fr) minmax(0,calc(3*var(--col)))`;
   `.cr-cells` is a real box in column 2 with
   `grid-template-columns: repeat(3,minmax(0,1fr))`. No `display:contents`
   anywhere, no `repeat(var(--n,3))` / `calc(var(--n,3)…)` patterns (verified
   absent; link uses `left: calc((var(--a)+0.5)*100%/3)` inside the cells
   area). Header names truncate with ellipsis inside their own
   `min-width:0` cell (model/`Files`/`Kept` live only in the hidden hover
   KPI: `position:absolute; visibility:hidden` until hover); tooltips are
   likewise absolutely positioned + hidden until hover; the legend clips
   (`max-width:100%; overflow:hidden`) inside the file column.
- Harness additions (kept in this directory): static CSS asserts (no
  `display:contents`, no invalid `repeat`/`calc` with `var(--n,3)`, shared
  row template, nested 3-col cells, ellipsis + hidden-popup rules,
  closed `<b>` tags) plus runtime probes at t = 13 s — 3 header cells show
  names only with model/counts in the KPI, legend `Kept` complete, and all
  10 line-ranges sit in their own agent's column (`Lines 12–30` fix vs
  `Lines 90–104` retry, `Lines 40–68`/`52–80`/`44–58` split across the three
  payment.ts cells, etc.), no `Line(s)` text in any File cell, plus alien-
  column negatives. 26 s loop, conflict formation and the `Pick a way`
  panel are unchanged.

## How to test
Open `index.html` in a browser (no server needed). Toggle ◐ top-right for
dark mode. Watch one 26 s cycle, click a conflict row, pick a way.

## Flicker fix (2026-11-25 — 200ms timer rebuilt DOM via innerHTML)
Defect: the demo timer called a full `render()` that rebuilt the component
via `innerHTML` (heads/rows/pick panels). Every tick destroyed and recreated
nodes, so CSS animations restarted and the eye saw a full flash/reload.
Fix, data/timings/choreography untouched:
- DOM is built ONCE at init with `createElement`/`createElementNS`/
  `createTextNode` + `setAttribute` only — zero `.innerHTML =` and zero
  `.className =` anywhere in the page script (statically asserted).
- Each 200 ms tick updates ONLY what changed, in place: `textContent`
  (guarded by `setText` diff), attributes (`setAttr`/`toggleAttr` diffs),
  `hidden`/`disabled` properties, and `style.setProperty` for the
  link `--a`/`--b` and context bar width. Unchanged nodes are never touched,
  so animations/sheen do not restart.
- Row tags are stable (`<button class="cr-row">` for all 6 files, clean rows
  get `cursor:default` + no-hover so they look like the old `<div>` rows) —
  loop restarts update in place instead of wiping `#fileRows`.
- Pick panel is a stable skeleton (phead + 3 reusable way buttons + calm);
  ways update `data-p`/`data-a`/`aria-checked`/`data-lost`, pixel-marks
  repaint via `paintPixelMark` (same 9 `<i>` nodes, class toggled), Kept
  badge toggles `hidden`. Heads keep stable nodes; counts/singulars/status
  update as text.
- Compliance: added `[hidden]{display:none!important}` (author
  `.cr-merged{display:flex}` etc. would otherwise override `hidden`);
  popovers/rows/ways open on `pointerdown` capture (`addEventListener(
  "pointerdown",…,true)` alongside click); SVG check icons use
  `createElementNS` + `setAttribute` only. Early-theme `/*noflash*/` guard
  in `<head>` untouched. All data, timings, loop choreography, interactions
  and both themes unchanged.
Verification (`node harness.cjs`, node only, files in this directory):
- Mini-DOM stub preserves element identity and serialises `innerHTML` from
  the live tree; an `innerHTML` setter spy counts assignments.
- Captured 6 row + 3 head + bar/link nodes after init, drove ticks through
  a full 26 s loop + wrap + cycle-2: (a) same objects still in the tree
  (`parent`/`children` identity, 6/6 rows match), (b) `innerHTMLWrites === 0`
  after init through all light AND dark ticks, (c) merge text advances
  `Waiting for 3 agents` → `1 conflict` → `2 conflicts` → `1 conflict` →
  `Merge 3 branches` → `Merged ✓` → wrap, in light and (el=13/20) in dark.
- Full suite: 136 checks pass, `node --check` on the page script OK.
