# Shimmer Loader — replica report

## What was built
ONE self-contained `index.html` (14KB, inline CSS+JS, system fonts, no network) replicating the
affectUI **Shimmer Loader** demo from the observed behaviour in `demo-original.js`.

- Skeleton blocks (`.ui-shm`) sharing **one fixed sweeping highlight** (`background-attachment: fixed`,
  `150vw` gradient, `100deg`, `2.2s linear infinite`, `-50vw → 100vw`).
- Shimmering Thinking text (`.ui-shm-text`, `300%` text-clipped band, `2s linear infinite`, `100% → 0%`).
- Demo loop card: `Generating summary…` + `Reload` button on top; skeleton view ↔ loaded view below.
- Clean-room code: own HTML/CSS/JS from observed behaviour; no compiled source copied.

## Matched data / behaviour (verbatim from demo-original.js)
- Label: `Generating summary…` · Button: `Reload`
- Skeleton geometry: circle `width 36`; meta `96×10 r5` + `64×8 r4`; lines `full×10 r5` + `72%×10 r5`; tiles `3× (h56 r10)`
- Loaded view: avatar `MC`, name `Maya Chen`, sub `Product design · 2h`,
  text `New onboarding flow is live – activation is up 18% in the first week.`
- Tiles: `linear-gradient(135deg, #ffd6a8, #ff9f6b)` / `(135deg, #c7d7ff, #8aa7ff)` / `(135deg, #cdeccf, #7fcf9a)`
- Timings/loop: `loading 2500ms → loaded 3200ms → loading…`; `Reload` forces `loading=true` and restarts the timer
- Shimmer tokens: light `base #ececec / glow rgba(255,255,255,0.9) / text #a3a3a3 / text-glow #ffffff`;
  dark `base #2f2f33 / glow rgba(255,255,255,0.08) / text #6e6e73 / text-glow #f5f5f5`; `prefers-reduced-motion` disables both animations
- `aria-busy` on the card, `aria-hidden` on skeleton spans

## Spec compliance
- Design tokens for every colour; light default (the original demo is light) + dark via `data-theme` on `<html>` with a visible sun/moon toggle (top-right, `aria-pressed`/`aria-label`); stored override key `affectui-shimmer-loader-theme`, else `prefers-color-scheme`
- `/*noflash*/` guard is the first thing in `<head>` (theme script + `html{background}` paint style + `meta color-scheme`); no white first frame in dark
- Header: title + what-it-is sub + `Loading/Ready` status pill + theme toggle (this component has **no agent identities**, so no pixel-marks by design)
- v5 polish: all `:hover` inside `@media (hover:hover) and (pointer:fine)`; `html{-webkit-tap-highlight-color:transparent}`;
  `body{font-variant-numeric:tabular-nums}`; concentric radii (outer `16` > inner `10` > `6`); 1px borders for structure + layered shadows for elevation; `focus-visible` outlines; `150–180ms` transitions; responsive single-column tiles under `480px`
- In-place updates only: static markup built once; timer/click/hover/focus never set `innerHTML`; `setLoading()` only flips `hidden`, `aria-busy`, `data-state`, `textContent`; `pointerdown`/`mousedown` capture listeners present so real clicks survive; no SVG (no `.className` hazard); `[hidden]{display:none!important}` present

## How to test
Open `index.html` in a browser: skeleton sweeps together for 2.5s → loaded Maya Chen card for 3.2s → loops; `Reload` restarts the sweep; toggle switches light/dark.

## Verification (node only, no browser)
- `node --check` on the extracted page script: **OK**
- In-dir stub harness `verify-harness.cjs` (loads the page script with a fake DOM + controllable timers): **ALL CHECKS PASSED**
  - asserts all verbatim visible strings, `aria-busy`, `hidden` swaps, `2500/3200ms` timings, full-loop restart, `Reload` restart
  - asserts VISIBLE text (Thinking label always; skeleton vs `Maya Chen…` per state — text in markup/aria alone is not counted)
  - asserts the 8 live nodes keep object identity across the full loop with **zero `innerHTML` writes** after init
  - asserts light default, dark tokens, guarded hover, tap-highlight, tabular-nums, no external assets, `<200KB`
  - exercises the theme toggle both ways (light AND dark checked)
