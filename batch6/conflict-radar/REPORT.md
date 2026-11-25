# conflict-radar — clean-room replica report

## What was built
`index.html` (32,958 bytes, single file, no network, system fonts) — a
standalone replica of the affectUI Pro **conflict-radar** component:
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
  the real page script through t = 0/8/13/17/20/27/44 s — **ALL CHECKS PASSED**
  (37 checks: layout, pixel-mark cell counts, timings, clicks, toggle,
  contrast, tokens). Pixel-marks: 6 in header (visible + KPI per agent), each
  **exactly 9 cells**, distinct hues per agent id, twinkle while working.
- Could not verify: pixel-perfect match to the Pro .tsx (not available);
  only the public compiled demo + spec were used.

## How to test
Open `index.html` in a browser (no server needed). Toggle ◐ top-right for
dark mode. Watch one 26 s cycle, click a conflict row, pick a way.
