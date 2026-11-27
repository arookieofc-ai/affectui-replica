# Logo Cluster — replica report

## What was built
Standalone `index.html` (14 KB, inline CSS + JS, no external deps) replicating the
affectUI **Logo Cluster** illustration (slug `logo-cluster`, "Card illustrations", Free).

- Page: card with title "Logo Cluster", public description
  ("Central mark on a white disc with company logos bouncing out and settling around."),
  theme toggle (top-right), Replay + Pause/Resume controls, square stage, live status
  line, 7-logo legend, category note.
- Cluster behaviour (re-implemented, own class names/code): white centre disc pops in
  first (420 ms back-ease); 7 logo bubbles bounce out from centre with staggered
  delays (520 ms back-ease, 0.180 s + i·0.045 s); the whole orbit then rotates slowly
  clockwise (48 s linear); each face counter-rotates so logos stay upright; hover lifts
  a bubble (scale 1.12 + wider shadow); off-screen scroll pauses via
  IntersectionObserver; `prefers-reduced-motion` lands everything in final state.
- Demo data verbatim from the demo chunk — positions/sizes in 320-unit space and
  brand colours: Notion (−29,−97,56, currentColor), Spotify (82,−67,48, #1ED760),
  Stripe (96,−14,72, #635BFF), Google Calendar (53,86,60, #4285F4),
  Linear (−63,70,42, #5E6AD2), GitHub (−88,64,20, currentColor), Figma (−93,−1,72, #F24E1E).
- Clean-room: all HTML/CSS/JS written from the public description + observed
  behaviour. Logo glyphs are own simple letter marks (not copied path data); the
  centre mark is an own three-bar abstraction, not the copied path. No verbatim
  source excerpts.

## What matches the original
Layout (square 1:1 stage, max 420 px, centre disc ≈132/320 units), entrance order
and stagger, 48 s orbit with counter-rotating faces, hover lift, dark-mode token
swap, pause off-screen, reduced-motion final state.

## What could not be verified
Pixel-exact logo artwork (brand SVG paths intentionally not copied — letter marks
used instead); exact back-ease curve values were re-authored to the same feel.
v3 "project name + agent count / token bar / pixel-mark" rules target crew-style
items and do not apply to this illustration; noted, not forced.

## How to test
1. `open index.html` in a browser (or any static server).
2. Watch entrance → orbit; hover bubbles; Replay; Pause/Resume; theme toggle.
3. `node harness.js` — DOM-stub harness asserting visible painted text, full-loop
   node identity, zero `innerHTML` writes after init, light + dark themes.
4. `node -e "...extract inline script..." && node --check` — syntax check (passed).

## Theme check
Verified light AND dark: CSS uses shared tokens (`--surface`, `--page`, `--ink`,
`--muted`, `--subtle`, `--border`); dark tokens (`#1c1c1f/#101012/#ededed/#a1a1aa/
#26262a/#2e2e33`, amber `#fbbf24 on #451a03`) checked in harness; toggle switches
`data-theme` on `<html>` and persists to localStorage; default follows
`prefers-color-scheme`; `/*noflash*/` guard + matching first-paint background +
`color-scheme` meta prevent white flash. v5 polish applied: hover gated behind
`@media (hover:hover) and (pointer:fine)`, tap-highlight cleared, tabular numerals,
concentric-feel radii, shadow-vs-border discipline, face outline at 10%.
