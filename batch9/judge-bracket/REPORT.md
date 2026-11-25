# Judge Bracket — replica report

## What was built
`index.html` (~30KB, self-contained, no network, system fonts) replicates the
affectUI `judge-bracket` demo: a tournament view of judge comparisons between
agent outputs for the task **"Fix: customers charged twice when a payment is retried"**,
judged by **Claude Opus**. Clean-room implementation — own HTML/CSS/JS written
from observed behaviour; no code copied from `demo-original.js`.

Layout/behaviour matches the original:
- Header: `Judge` title + task text + `Judging` pill (visible only while a live
  matchup exists) + right-aligned summary (`Quarterfinal · 2/7` → … → `Idempotency key wins`).
- 3 rounds (Quarterfinal / Semifinal / Final), 7 matchups, connector elbows with
  won (solid) / lost (dashed) / open states, animated champion path draw.
- Live matchup names shimmer; decided scores shown one-decimal; ✓ on winners,
  🏆 cup on the champion; detail panel with both answers (icon, name, Winner
  badge, score, model meta, pre-line output), judge reason, and a `Use X ↺`
  button on the final that restarts the demo.
- Auto-play loop with the original timings (900ms tick, 2-tick lead-in,
  2 ticks per verdict, 14-tick tail = 30-tick cycle, then loops).
- Narrow mode (< ~640px content width): stacked round lists instead of columns.
- Keyboard: ArrowUp/Down/Left/Right move between matchups, Esc clears selection.

## Original data used (verbatim values from demo-original.js)
8 contenders: c1 Idempotency key (Sonnet · +18 −4 · 3 files · 42/42),
o1 Retry guard (GPT-5 · +9 −1 · 41/42), g1 Row lock (Gemini · +31 −6 · 42/42),
x1 No retries (Grok · +2 −14 · 39/42), c2 Webhook dedupe (Sonnet · +24 −3 · 42/42),
o2 State machine (GPT-5 · +112 −40 · 42/42), g2 Button debounce (Gemini · +6 −0 · 40/42),
x2 Refund later (Grok · +38 −0 · 42/42), incl. full output snippets.
7 verdicts with exact winners/scores/reasons, e.g. QF `0:0 → c1 [9.1, 6.2]`,
final `2:0 → c1 [9.4, 8.6]` ("…Ship the key – and keep the dedupe as a follow-up.").
Timings: k=900ms, A=2, j=2, M=30. Nothing invented.

Deliberate deviations (per worker spec): tile icons replaced by deterministic
3×3 pixel-marks per agent id (hash → hue + 9-bit pattern, centre cell always on;
live agents twinkle); Replay/Pause controls and theme toggle added as page chrome.

## Interactions
Open `index.html` in a browser (or `python3 -m http.server`). Auto-plays the
tournament; click any matchup (selection fires on `pointerdown` capture so it
can't be lost across a re-render) to pin its verdict; Replay restarts; Pause
freezes; ◐ toggles light/dark; resize below ~640px for list mode.

## Token audit
All colours go through CSS custom properties (`--page/surface/ink/muted/
subtle/tray/border/…`, status: wait amber, ok green, brand blue, fail red).
No ad-hoc hex per element. Radius 16/10/6px, pills 999px, base 14px system
sans, card 1px border + soft shadow, hover lift, focus-visible outline,
150–200ms transitions. Dimmed cards use opacity 0.78 (≥ 0.75).

## Contrast results (computed luminance ratios)
Light: ink/surface 17.9, muted/surface 4.8, wait 6.4, brand 6.7, ok 5.8,
answer-meta 4.8 — all ≥ 4.5. Dark: ink 14.5, muted 6.6, wait 12.0, brand 6.7,
ok 6.8 — all ≥ 4.5. `--faint` (~2.5–2.9) is used only for inactive round
eyebrow labels (redundant with the panel heading + aria labels, turn muted when
active). Checked in both themes.

## Verification
- `node --check` on the extracted inline script: passes.
- `node verify.js` (DOM-stub harness kept in this directory): 37/37 pass —
  boots without throwing, 900ms interval registered, all 7 verdicts reveal over
  the cycle, champion = c1, judging pointer advances, re-render only on state
  change (`lastSnap` guard), and every rendered pixel-mark contains exactly 9 cells.
- Could not verify: pixel-perfect match to the Pro render (no screenshot
  tooling here); icon artwork is intentionally original (pixel-marks, not glyphs).
