# Inspect Agent Card — replica report

## What was built
- `index.html` (20.4KB, self-contained, no network, system fonts only).
- Tilted design-tool selection: `perspective(1100px) rotateX(30deg) rotateY(-14deg) rotateZ(7deg)`, 320px main card + faded above-card, blue selection frame with hatch + dashed inner, tag, 4 handles, blue `10` / `10` badges, red dashed guide + `0` edge badge, hand cursor, `W Fill NNNpx` size label.
- Clean-room code: all HTML/CSS/JS rewritten from observed behaviour. No copied bundle paths, no `react-*` imports, SVG icons redrawn (star, hex, tool glyphs, spinner, check, hand).

## Matched data / behaviour (verbatim from `demo-original.js`)
- Agents: `Coder` / `GPT-6 Sol` / `Build the page and wire up checkout` / `running` / `$0.42` / `48s`; `Researcher` / `Sonnet 5.5` / `Compare the pricing of five competitors` / `done` / `$0.18` / `55s`.
- Rows cycled: `Header` (order 0) → `Task` (order 1) → `Meta` (order 2), only on main card.
- Timings: `delay 600`, `hold 1600`, `m 180`, `h 120`, show at `+30ms`, hide at `590+hold (2190ms)`, next at `590+hold+m+h (2490ms)`; full 3-row loop 7470ms. `prefers-reduced-motion` shows first row statically.
- Geometry: frame = row expanded by 10px (`top-10`, `height+20`), vars `--x/--y/--w/--h/--cx/--cy/--cw/--ch/--ft/--fh/--rx/--rw`; size label `Math.round(width)px`; red edge hidden on last row (`data-last`); staggered `--d` delays (box 90, handle 160, tag 200, badge 250, size 300, guide 280, cursor 0).
- Statuses: `Running` blue spinner (900ms spin) / `Done` green check; tools as 16px overlapping icons (max 3).

## Design tokens / themes / v5 polish
- Tokens via custom props: light `surface #ffffff, page #fafaf9, ink #171717, muted #78716c, subtle #f5f5f4, border #e7e5e4`; dark `surface #1c1c1f, page #101012, ink #ededed, muted #a1a1aa, subtle #26262a, border #2e2e33`; blue `#4f8ff7→#3b82f6`, red `#ff3b30`; radii 16/10/6, pills 999px, shadow elevation.
- Default = original appearance (light white card). Toggle (top-right, sun/moon, `aria-pressed`) switches `html[data-theme]` and persists to `iac-theme`; `/*noflash*/` guard in `<head>` sets theme from storage or `prefers-color-scheme` before paint + `html{background}` + `color-scheme` meta. No white flash in dark.
- v5: all `:hover` inside `@media (hover:hover) and (pointer:fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`; concentric radii (card 8, avatar 6, tool 4); shadows for elevation, borders only for divider/toggle; status pill optical alignment (`padding:0 6px 0 4px`); `[hidden]{display:none!important}`; SVG classes via `setAttribute` only (no `.className` on SVG); no broad `svg{display:block}` overriding hides.
- Header / pixel-marks note: original has no project header and uses SVG avatars, not 3×3 pixel-marks. Adding a fake project count or pixel-marks would invent data, so kept faithful avatars. Page has demo chrome (title + toggle) only.

## In-place updates
- DOM built once (static markup + one overlay skeleton). Timer loop only sets `style.setProperty`, `textContent` (tag/size), `setAttribute/removeAttribute` (`data-shown`, `data-last`). No `innerHTML` after init; hover/focus never re-renders; dialogs use click (no popover here).

## How to test
- Open `index.html` in a browser. Watch selection cycle Header→Task→Meta. Toggle theme top-right. Resize <640px → tilt flattens. `prefers-reduced-motion` → static.
- `node harness.cjs` (in-dir stub, no packages): checks strings, timings, `node --check` on extracted script, advances fake timers through full loop, asserts visible text (`Coder`, tasks, costs, `W Fill`, `10`/`0`, `Done`/`Running`), node identity preserved, zero `innerHTML` writes after init, theme toggle preserves identity.

## Verification results
- `node --check verify-extracted.js`: passed.
- `node harness.cjs`: ALL PASSED (light tokens `#ffffff/#fafaf9`, dark `#1c1c1f/#101012` present; loop wraps Header→Task→Meta→Header; `innerHTMLWritesAfterInit=0`; toggle light→dark→light keeps object identity).
- Checked light AND dark: dark uses adjusted blue/run/ok tokens, borders visible, no grey-on-grey (manual token review + harness token asserts).
