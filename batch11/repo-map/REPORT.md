# Repo Map — replica report

## What was built
ONE self-contained `index.html` (37.5 KB, no network, no external assets, system fonts):
a codebase treemap ("acme/web", branch "feat/token-refresh") with three agents
hopping between files and coloring edited files, matching the original demo's
look, behaviour and loop. Clean-room implementation — own HTML/CSS/JS written
from the observed behaviour; no compiled source copied.

## Original data/behaviour matched (verbatim from `demo-original.js`)
- 23 files with exact paths + line counts (`src/app/layout.tsx` 140 …
  `README.md` 110), title `acme/web`, branch `feat/token-refresh`.
- 3 agents verbatim: `auth` Auth agent "Adding token refresh",
  `ui` UI agent "Session expiry in the UI", `tests` Test agent "Covering the
  refresh flow", with the exact 8-step per-agent walk (file/action/added/removed).
- Loop timing: 1500 ms per step, steps 1→7, 3600 ms hold on step 7, wrap via
  step 0 (reduced-motion renders step 7 once, no timer).
- Header pattern: folder icon + project name + branch pill + `N conflicts`
  badge + "**X** of 23 files changed" + agent buttons (pixel-mark, name, file
  count). Number format k/M identical (999500→M, 10000→Nk, 1000→N.Nk).
- Agent identity = deterministic 3×3 pixel-mark (hashed per agent id, ≥5 of
  exactly 9 cells on), working agents twinkle; palette of 6 rgba colours.
- Slice-and-dice treemap grouped by first 2 path segments; tiles show basename
  only when the tile fits (≥56px wide etc.), second line shows `Conflict` /
  `+add −del` / `N lines`; full label always in `title` + `aria-label`.
- Pins (24px circular badges) hop between files with 560 ms easing; dashed
  outline for read-only presence; conflict tiles blink amber + badge
  "Two agents are editing this file at once"; tooltip positioned above/below
  tile; `aria-live="polite"` announcements ("X is editing file Y"); arrow-key
  navigation, Home/End, Escape; click agent button filters/dims others.
- Hard-won rules: re-render only on state change (step/select/resize — never on
  hover/focus; hover only touches the tooltip node); tooltip pinned on
  pointerdown/mousedown capture; `[hidden]{display:none}` rule present;
  SVG classes set via `setAttribute`; dimmed nodes stay legible (opacity 0.75,
  the original's 0.35–0.45 was raised per spec); narrow screens fall back to a
  stacked list.

## Verification (in-dir DOM-stub harness + `node --check`)
- `node --check` on the extracted inline script: passed.
- `verify-harness.js` (temporary, in this dir, removed after the run) stubbed
  the DOM + fake timers, advanced through the full loop and asserted VISIBLE
  text/state (hidden = `[hidden]`/`display:none`/`visibility:hidden`/
  `color:transparent`/`font-size:0` on self or ancestors; label text without
  `data-show` counts as hidden). ALL 41 CHECKS PASSED, including:
  - header (`acme/web`, `feat/token-refresh`, "of 23 files changed"), agents,
    23 tiles, every pixel-mark has exactly 9 cells, tile names never truncated,
    full label in tooltip/aria.
  - loop visits steps 0–7 and wraps; conflict reached at step 3
    (`src/lib/session.ts`, all three agents editing) with header badge +
    tooltip warning; pins hop between steps 1→4; tooltip hides without re-render.
  - theme toggle switches light→dark→light with content visible in both.
- Checked in both themes: light default (original demo appearance) and dark via
  the sun/moon toggle (amber-on-brown `#fbbf24`/`#451a03`, surface `#1c1c1f`,
  page `#101012`).

## How to test
Open `index.html` in a browser. Watch agents hop every 1.5 s; hover a tile for
the detail popover; click an agent chip to focus/dim; use the top-right
sun/moon button to switch themes; shrink below 560 px for the stacked list.
