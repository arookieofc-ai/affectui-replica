# Agent Checkpoints — replica report

## What was built
Single self-contained `index.html` (inline CSS + JS, no external dependencies)
replicating the affectUI **Agent Checkpoints** component: a vertical, rewindable
checkpoint timeline for an agent run, with automatic branching of a new attempt
after a failure.

- Header mirrors the original: branch mark + `Checkpoints` title + task name
  (`Ship the pricing page`) + live summary (`9 checkpoints · 2 attempts · $0.61`).
- Vertical rail with fork curve when the second attempt branches, status dots
  (done / running / failed / stopped), running-row shimmer, per-row icon chip,
  `Attempt 2` pill, `Failed` badge, `Stopped` label, file counts (`4 files`),
  cumulative times (`m:ss`), and total cost (`$0.61`).
- Behaviour: auto-plays the run on load (720 ms tick, as in the original),
  auto-rewinds from the failed node to `c4` and plays the branch, then loops.
  Hovering/focusing any non-head row reveals a **Rewind** button; clicking a row
  (or Enter/Space) rewinds there and branches a new attempt. Replay and
  Auto-play controls included.
- Keyboard: roving tabindex with ArrowUp/ArrowDown/Home/End, Enter/Space to
  rewind, aria-labels per row (`… – press Enter to rewind here`), `aria-current="step"`.
- Responsive: below 480 px the task name and file counts hide; layout stays a
  legible stacked list. `prefers-reduced-motion` disables animation.
- Light AND dark themes via `data-theme` on `<html>`, visible sun/moon toggle
  top-right; default follows `prefers-color-scheme`, toggle overrides
  (persisted to localStorage).

## Original demo data used (from `demo-original.js`, values verbatim)
Task `Ship the pricing page`; main attempt: `Read the brief` ($0.02, 9s),
`Scaffolded the pricing page` (4 files, $0.06, 21s), `Wrote the plan copy`
(1 file, $0.05, 17s), `Built the pricing table` (3 files, $0.11, 34s),
`Added Stripe checkout` (5 files, $0.14, 41s),
`Tests failing – 4 of 12` ($0.04, 26s, failed). Branch (auto rewind target
`c4`, tick 720 ms): `Switched to Stripe Elements` (3 files, $0.12, 38s),
`Tests pass – 12 of 12` ($0.04, 24s), `Opened the pull request` (1 file,
$0.03, 11s). Cumulative times 0:09 → 0:30 → 0:47 → 1:21 → 2:02 → 2:28 →
3:06 → 3:30 → 3:41; total $0.61. All icons are my own simple glyphs
(clean-room: no path data copied from the bundle).

## Tokens
All colours are CSS custom properties (no raw hex outside the two token
blocks). Light: surface `#ffffff`, page `#fafaf9`, ink `#171717`,
muted `#78716c`, subtle `#f5f5f4`, border `#e7e5e4`, radii 16/10/6 px.
Dark: surface `#1c1c1f`, page `#101012`, ink `#ededed`, muted `#a1a1aa`,
subtle `#26262a`, border `#2e2e33`. Failed red and the four icon tint pairs
are tokens in both themes. Dimmed (left-behind) rows use opacity 0.78
(per v3 legibility rule, raised from the original's 0.5).

## What could not be verified
- Pixel-exact match: the demo chunk ships no CSS (unstyled in isolation), so
  spacing/rail geometry were reconstructed from its layout constants
  (row 32 px, lane 14 px) and class structure.
- The original's brand icons (Slack/GitHub/Figma/Stripe) were replaced with
  original line icons to respect the clean-room rule.

## How to test
1. Open `index.html` in a browser (no server needed).
2. Watch: checkpoints stream in → failure → auto-rewind to `Built the pricing
   table` → Attempt 2 branch → loop.
3. Hover any row → click **Rewind** (or focus + Enter); new attempt forks there.
4. Toggle sun/moon (top-right) — verify finished look in both themes; reload
   to confirm the choice persists; test with OS dark mode for the default.
5. Narrow the window below 480 px — task/files hide, rows stay legible.
6. Token audit: `grep -nE '#[0-9a-fA-F]{3,8}' index.html` — hits only inside
   the two token blocks. Contrast script results are in the verification notes.
