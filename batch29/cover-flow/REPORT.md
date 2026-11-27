# Cover Flow — replica report

## What was built
`index.html` (27 KB, well under the 200 KB limit) is a single self-contained page
replicating affectUI "Cover Flow" (slug `cover-flow`): a 3D cover browser with a
gradient collection. Inline CSS + JS, no external dependencies, system fonts only.
Clean-room implementation: all markup, styles and physics were written from the
public behaviour description, not copied from the compiled demo bundle.

## Matches the original
- **Demo data verbatim**: all 10 pairs from `./demo-original.js`
  (Stone/Mint/Sky/Sage/Blush/Sand/Lilac/Ice/Peach/Mist with exact hex pairs),
  `defaultIndex 4` (Blush), `itemWidth 240`, `itemHeight 320`, aria-label
  "Gradient collection".
- **3D layout math**: per-cover `translate3d(x, 0, z) rotateY() scale()` with the
  same constants — spread `W*0.78*scale`, tail `W*0.27*scale`, depth `W*0.7*scale`,
  `angle 50°`, scale `1 − t*0.08 − min(max(|off|−1,0),4)*0.015`,
  `zIndex 1000 − round(|off|*10)`, far covers (`|off| > 8`) hidden.
- **Spring snapping**: stiffness 190, damping `2*sqrt(190)*0.92`, 32 ms dt clamp,
  settle epsilon `6e-4 / 0.002`.
- **Drag / flick / scrub**: pointer drag with 6 px dead-zone + pointer capture,
  rubber-band `*0.3` past the ends, release velocity `−dx/dt / (110*scale)`,
  flick projection `round(pos + v*0.18)` with `|v| > 0.8` nudge; wheel scrub with
  `110*scale*1.4` divisor, `±0.35` overshoot and 110 ms settle snap.
- **Drifting images**: media strip is `−8%` wider than the card and parallaxes by
  `translateX(var(--d) * −5%)`, `--d` clamped to `±1.5`.
- **Reflections**: flipped copy, 32% height, mask fade (`--reflect 0.22 / 0.3`),
  plus floor shadow, edge hairline, dim and directional sheen driven by `--t`.
- **Chrome**: prev/next buttons (disabled at ends), direction-aware caption
  rise-in (`next`/`prev` + blur), dot ticks (elongated current) for ≤15 items,
  `N / M` counter, keyboard (arrows/Home/End/Enter/Space), click-to-centre and
  click-centred-cover for a details popover, optional WebAudio tick blip
  (default off), responsive scale `clamp(clientWidth/(W*3.2), 0.5, 1)`,
  `perspective 1000*scale`, reduced-motion jump-to-target.
- **Spec tokens/headers**: CSS custom properties for every colour, 1 px border +
  soft shadow cards, 150–200 ms transitions, focus-visible rings, fully rounded
  pills, tabular numerals, gated `:hover`, tap-highlight removal, inset content
  outlines, reduced-motion support.

## Could not verify
- Pixel-exact visual match (no browser or screenshots in this environment).
- Real pointer/wheel frame timing and spring feel — constants match, but feel was
  only validated logically via the stub (synchronous reduced-motion path).
- The optional tick sound waveform (WebAudio unavailable in node stub).

## How to test
Open `index.html` in a browser. Drag/flick the covers, scroll sideways over them,
use ←/→ keys, click dots and nav arrows, toggle Reflections/Caption/Ticks/Sound,
click the centred cover for details, and flip the sun/moon theme button.

## Verification (node only, in-dir)
- `node --check` on both extracted inline scripts: **pass**.
- `./harness.cjs` (in-dir DOM stub, `node ./harness.cjs`): **ALL CHECKS PASSED** —
  - VISIBLE painted text: caption `Blush`, subtitle `#FDF2F8 → #F5B5D6`,
    counter `5 / 10`, header `10 covers`, 10/10 slide aria-labels, active node
    not `hidden`.
  - Full-loop node identity: `goTo(0..9)` + back, all 10 item + 10 tick nodes
    identical references, caption/counter restored.
  - Zero `innerHTML` writes during init and after the full loop (prototype
    setter counter; page builds via `createElement`/`textContent` only).
  - Light AND dark: toggle flips `data-theme` light→dark→light, persists the
    stored key, caption/active node stay painted and visible in both.
