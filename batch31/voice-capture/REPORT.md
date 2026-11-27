# Voice Capture — replica report

## What was built
- `index.html` (17.6 KB, self-contained, system fonts, no network) replicating the **Voice Capture** dictation panel from `demo-original.js`.
- Page chrome: header with project name `Voice Capture` + live count (`1 capturing` / `0 capturing`) + `dictation panel` pill, and a visible sun/moon theme toggle (top-right of header). Main card centers the replica on a page background with a status line and keyboard hints.
- Replica geometry matches the original: outer `420px` with right fade mask (`110px`), inner panel `480px`, `6px` padding, panel radius `20px` = well radius `14px` + `6px` padding (concentric), well height `80px`, foot `36px`, bar origin `x=20`, step `5px`, width `2px`, glow blur `28px`, drift `9s alternate`, rec blink `1.6s`.
- No agent identities in this component, so no 3x3 pixel-marks (spec requires exactly 9 cells only when agent identities exist).

## Matched data / behaviour (verbatim from demo-original.js)
- Bars: all **68** values verbatim `[3,6,2,10,5,13,2,2,2,5,8,11,6,16,10,5,2,2,3,2,8,14,19,13,8,18,11,5,2,2,2,6,10,6,13,8,3,2,2,2,2,5,11,16,21,14,10,6,11,8,3,2,2,5,8,5,2,2,6,13,10,16,11,6,3,2,2,2]`; bars `<=3` stay fixed width, larger bars scale by `value*1.6*swell(t,idx)`.
- Swell: `period = 640 + ((idx*53)%5)*110`, `phase = ((nowMs + idx*70) % period)/period`, `v = 0.66+0.36*sin(2π·phase)+0.12*sin(4π·phase+1)` clamped to `[0.3, 1.1]` — same math, own variable names (clean-room).
- Canvas: DPR-aware resize, centered vertical bars, `roundRect` with fallback, color from computed `color` so light/dark follow tokens.
- Clock: starts at `0:07`, `M:SS` format, `setInterval 1000ms`, tabular-nums, updates text node only when the string changes.
- Foot: red rec dot + time, 1px separator, `Done ⌥ Space` and `Cancel Esc` (as real buttons). `Done` (or `Alt/Cmd+Space`) freezes bars (`data-still`, animations off) and holds the clock; `Cancel` (or `Esc`) resets to `0:07` and resumes. Reduced-motion starts paused.
- Glow: three radial stops (light `#0190fe/#a651f0/#ee3e9e`, dark `#4fb0fe/#b98af0/#f06db5`), opacity `.5` light / `.36` dark, right fade + bottom mask as in original.
- Default theme = original appearance = **light** (`<html data-theme="light">`); toggle overrides and persists to `voice-capture-theme`.

## In-place updates / polish compliance
- DOM built once in static markup; timer/rAF update only `textContent`, attributes (`data-still`, `data-theme`), and canvas pixels. No `innerHTML` anywhere in the page script.
- Hover rules only inside `@media (hover:hover) and (pointer:fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`; `[hidden]{display:none!important}`; SVG icon class via `setAttribute`; no broad `.x svg{display:block}` overriding hides (toggle svg is `display:block` scoped to `.theme-btn svg`).
- Tokens for every colour; dark theme mirrors spec (`surface #1c1c1f`, `page #101012`, `ink #ededed`, `muted #a1a1aa`, `subtle #26262a`, `border #2e2e33`); shadows for elevation, borders for structure; focus-visible outlines; 150–200ms transitions.
- `/*noflash*/` guard is the first script in `<head>` (stored key → `prefers-color-scheme` → `light` fallback), plus `html{background}` inline style and `<meta name="color-scheme" content="light dark">`.

## Verification (node only, no browser)
- `node --check` on the extracted main script: **OK**.
- In-dir stub harness `verify-harness.cjs` (runs only on files in this directory): **ALL PASS (58 checks)**. It:
  - asserts noflash/head/tokens/hover/tap-highlight/tabular-nums/hidden/concentric/dark-glow/bars/timer/rAF markers are present;
  - executes the page script against a DOM stub, advances 60 ticks (`0:07 → 1:07`), pumps rAF frames, runs Done (paused, `0 capturing`, `data-still`, clock holds) and Cancel (reset `0:07`, resume, `data-still` cleared);
  - asserts VISIBLE text (`0:07`, `Listening…`, `1 capturing`, `Done`, `Cancel`, `Esc`, `Space`) on non-hidden nodes;
  - asserts time/state/panel/canvas nodes keep **object identity** across the full loop and **zero `innerHTML` writes** after init;
  - flips `setTheme('dark')`/`setTheme('light')` and checks `data-theme` — light AND dark both verified (dark glow token `#4fb0fe` present, panel `#161618`, bar `rgba(255,255,255,.8)`).
- No package installs; no `/tmp` use; all work inside this directory.

## How to test
- Open `index.html` in a browser. Bars animate, time ticks from `0:07`, glow drifts. Click `Done` to hold, `Cancel`/`Esc` to reset, `⌥+Space` for Done. Toggle sun/moon (persists). Narrow the window to check responsive stacking.
- Re-run: `node verify-harness.cjs` (exit 0 = pass).

## Could not verify
- Pixel-exact canvas antialiasing vs the original bundle (behaviour and numbers match; sub-pixel DPR rounding may differ by 1px on some displays).
- `prefers-reduced-motion` live behaviour beyond the stubbed unit path (CSS media query included, JS checks `matchMedia`).
