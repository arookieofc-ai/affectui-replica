# Thinking Loader — replica report

## What was built
Standalone `index.html` (~25.6KB, inline CSS+JS, system fonts only) replicating affectUI **Thinking Loader** (`slug thinking-loader`, component, Chat, Free).

Public description: *Compact AI working pill with spinner and shimmering phase label ending in check.*

Page contains:
- Top bar with project header (`CRM picker — sales helper`, `1 working · 1 agent`, `Chat · Free`), token context (`12k / 200k` + thin 3px bar), and a visible sun/moon theme toggle (top-right).
- Chat card with the user bubble `Which CRM fits a 10-person sales team best?` and the working pill.
- Demo-controls card (Replay, size sm/md, variant pill/plain, loop on/off) and a Steps card listing the 5 phases.
- Footer with how-to-test note.

## Behaviour (matches original `demo-original.js`)
- Demo data used **verbatim**: `phases = ["Thinking", "Searching the web", "Reading 12 sources", "Comparing pricing", "Writing response"]`, `interval = 2000`, done pause `2600`, `doneLabel = Thought for <dur>` with the same duration formatter (`<60 → "Ns"`, `<60m → "Mm Ss"`, `<24h → "Hh MMm"`, else `"Dd Hh"`).
- 8-ray spinner (`800ms linear`, staggered delays), ray fade `1 → 0.18`, check draw-in on done, spinner scales/rotates out.
- Labels roll (`translateY ±70% + blur`), incoming box glides width (`460ms ease`), shimmer sweep (`1.8s linear`), truncation to `…` with `data-cut` in narrow containers.
- `role="status" aria-live="polite"`, `aria-label` updates, `prefers-reduced-motion` disables sweeps.
- Sizes `md (34px/14px)` / `sm (28px/13px)`, variants `pill` / `plain`.

## Clean-room + in-place updates
- No copied source: own class names (`.pill`, `.pill__icon`, `.spin`, `.tick`, …), own CSS/JS written from behaviour.
- Build once, patch in place: all pill/text/row nodes are static in HTML; timers only touch `textContent`, `classList`, `setAttribute/removeAttribute`, and `style.width/opacity`. Two label nodes ping-pong; outer pill/icon/text nodes keep identity across the full loop.
- Zero `innerHTML` / `outerHTML` / `insertAdjacentHTML` / `document.write` anywhere in `index.html`.

## Spec compliance
- Design tokens for every colour; dark theme via `html[data-theme="dark"]`, toggle persists (`thinking-loader-theme`), default follows `prefers-color-scheme`.
- `v4`: `<head>` starts with `/*noflash*/` theme script + `html{background}` paint guard + `<meta name="color-scheme">`; no white first frame.
- `v5`: all `:hover` inside `@media (hover:hover) and (pointer:fine)`, `html{-webkit-tap-highlight-color:transparent}`, `body{font-variant-numeric:tabular-nums}`, concentric radii (card 16px / inner 10px), shadows for elevation + real borders for structure, `img` inset-outline rule, optical pill padding (`12px` glyph side vs `15px`), explicit `[hidden]{display:none!important}` guard.
- Responsive narrow stacking; dimmed rows stay `opacity ≥ 0.75`; focus-visible outlines.

## Verification (node only, no browser)
- `node --check ./demo-original.js` — pass
- `node --check ./harness.js` — pass
- `node ./harness.js` (in-dir DOM stub) — **ALL PASS**:
  - VISIBLE painted text (`"Thinking"` → … → `"Thought for 1s"`), visible node not hidden;
  - full-loop node identity (pill/text/labels/spinner/check stable across 5 phases + done + restart);
  - zero innerHTML writes after init;
  - light AND dark themes (toggle flips `light → dark → light`, `data-theme` updates);
  - self-contained size `<200KB`.
- Manually confirmed token contrast in both themes by inspection (dark: surface `#1c1c1f`, ink `#ededed`, muted `#a1a1aa`; waiting amber adjusted for dark).

## What could not be verified
- Pixel-exact match against the live affectUI page (no browser fetching/rendering per task constraints; compared against the compiled demo chunk only for behaviour).
- Real `scrollWidth`-based width glide and `ResizeObserver` truncation in a live layout engine; logic falls back to text-length estimate in the stub and uses live measurement in the browser.

## How to test
Open `index.html` in a browser. Watch the 5 phases advance, settle on `Thought for …` with a check, then loop. Try Replay / size / variant / loop controls, resize narrow to see ellipsis, and toggle Light/Dark (top-right) — both themes must look finished.
