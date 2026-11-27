# Model Menu — replica report

## What I built
Standalone `index.html` (17KB, inline CSS+JS, no external deps, system fonts only) replicating the affectUI **Model Menu** (`model-menu`):
public description — *model picker with provider marks and a pink band gliding to the selected model.*

- Card titled **Best models** with 7 verbatim demo rows: **DeepSeek, GPT, Claude Opus, Gemini, Mistral Large, Qwen, Llama** (last row dimmed, as in the demo chunk).
- Clean-room provider marks in brand hues (blue DeepSeek, currentColor GPT knot, terracotta Claude burst, conic-gradient Gemini sparkle, striped Mistral block, purple Qwen hex, blue Llama glyph) — original simple glyphs, no copied path data.
- Pink selection band (`--at` × 32px rows, 520ms `cubic-bezier(0.22,1,0.36,1)` glide) with check icon parked at the right, pink gradient + hairline borders, top/bottom fade masks on the 344px stage, 340px card.
- Behaviour matches demo props: `selected=1` (GPT), `hold=2200ms`, `walk=3` — auto-cycle walks DeepSeek → GPT → Claude Opus. Click a row (or ↑/↓ + Enter/Space on a focused row) to pin the band and pause; Play/Pause button resumes. `prefers-reduced-motion` disables autoplay.
- **In-place updates only:** DOM built once at init with `createElement`/`textContent`; ticks update only `--at`, `data-active`, and the status line's existing nodes. No `innerHTML` anywhere.

## What matches the original
Title, row order/names, 32px rows, 16px logos, 9px gap, last-row dim, band position/gradient/check, card padding `12px 0 64px`, radius 12px, layered shadow, mask fades, dark-theme card `#141414` + pink `rgba(244,114,182,…)` band.

## What I could not verify
Pixel-perfect comparison — no screenshots of the original were available in this directory, and per the workdir rule I read only `REPLICATE_SPEC.md` + `demo-original.js`. Logo glyphs are approximations (same hues/feel, not traced). The `Inter` font stack falls back to system sans (no webfont, per no-external-deps rule).

## How to test
1. `open ./index.html` in a browser (or serve this directory statically).
2. Watch the band glide across the first three models every 2.2s; click any row; keyboard: Tab to a row, ↑/↓, Enter.
3. Toggle sun/moon (top-right) for light/dark; reload to confirm the theme persists with no white flash.
4. Node-only verification (no browser): `node --check ./harness.js && node ./harness.js`.

## Verification (node only)
- `node --check ./harness.js` — passes.
- `node ./harness.js` (in-dir DOM stub) — **ALL CHECKS PASSED**: visible painted text for all 7 models + title + status; full-loop (3-tick) row/container node identity; zero `innerHTML` writes after init (and none in source); band `--at` tracks selection; light AND dark theme labels/tokens; noflash guard before CSS + `color-scheme` meta + dual first-paint backgrounds; all `:hover` inside `@media (hover: hover) and (pointer: fine)`; tap-highlight transparent; `tabular-nums`; theme persistence key `model-menu-theme`.
- Checked light AND dark mode token sets — no hard-coded ad-hoc colours; dark uses spec tokens (`#1c1c1f/#101012/#ededed`, adjusted amber untouched since component has no amber state).
