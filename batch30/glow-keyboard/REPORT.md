# Glow Keyboard — replica report

## What was built
- `index.html` (single self-contained file, ~38KB, inline CSS + JS, no external deps except system fonts).
- Clean-room reimplementation of the affectUI **glow-keyboard** illustration (slug `glow-keyboard`, Product scenes, Pro): self-typing AI chat input over a glass keyboard, key presses rippling a gradient floor.
- `verify-harness.js`: in-directory DOM-stub harness (node only, no browser).

## Behaviour replicated (from demo chunk, not copied)
- Demo data verbatim: prompts `Find a quiet hike near Zermatt` / `Plan a sunrise climb for Saturday` / `What should I pack for two days?`, placeholder `Ask AI anything...`, German key geometry (z/y swapped, `ß ´ ü + ö ä #`, `⌫ ⇥ ⇪ ⇧ ⌃ ⌥ ⌘ ← ↑ ↓ →`, TouchID + `fn`), 79 key nodes, floor gradient `#FF7700 → #FF0055 (0.302885) → #0073FF`, orb gradient `#FF7700 → #FF2A91`.
- Self-typing loop with the original's typo gag on the first prompt (types `w`, deletes it, continues), per-char delays (110–260 ms, 220–380 ms on space), 1600 ms pause, `Enter` submit that clears the input, 1100 ms pause, infinite loop over the 3 prompts.
- Key visuals: `data-down` press state, ripple ellipses on both floor SVGs (rise + fade over ~1360 ms, capped at 14), glow hit flash under the composer tinted by the 6 s swap phase, wave-animated floor paths on a ~30 fps throttle.
- Real input: physical keydown maps German codes to visual keys (Shift-aware, `Enter` submits), any trusted keystroke/focus stops autopilot; clicking the scene focuses the input; Replay and Submit buttons work; submitted prompts append to a visible log (max 4).
- Entry animation (`data-in` rise), `prefers-reduced-motion` disables animation loops, IntersectionObserver pauses offscreen.

## What matches the original
- Layout: floor layers, glass composer with orb + caret + pill input, ring highlight, glass board with absolutely positioned keys scaled by container-query unit.
- Colours/typography: system sans, token-driven light/dark, blurred glows, graphite-glass dark keys.
- States: typing / submitted / user-takeover messaging, loop + submit counters, key counts.

## What was not / could not be verified
- No pixel screenshot comparison (no browser allowed); geometry re-derived from the demo's coordinate numbers with original wave/blur code rewritten.
- `backdrop-filter` / `mix-blend-mode: plus-lighter` rendering not verifiable in the stub; approved by code inspection.
- v3 crew-specific rules (project/agent header, token bar, pixel-marks, tool icons) don't apply to this illustration; page uses an equivalent scene header + counts + static token-context bar instead.

## In-place updates (v4)
- DOM built once at boot (`buildKeys` + static shells). Ticks update only `value`, `textContent`, attributes (`data-down`, `d`, `cy`, `data-theme`), classes and styles on existing nodes. Transient ripple/hit nodes are single append/remove, never innerHTML. Script contains zero `innerHTML` uses.
- Harness asserts key/input/path object identity is unchanged across a full 3-prompt loop and `innerHTML` write count stays 0.

## v5 polish
- All `:hover` inside `@media (hover: hover) and (pointer: fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`; concentric board/key radii; shadows for elevation, borders only for structure; focus-visible outlines; no grey-on-grey text (checked in both themes).

## How to test
- Open `index.html` in a browser. Watch the autopilot type all 3 prompts. Type to take over, press `Enter` to submit. Toggle Dark/Light top-right; reload to confirm no white flash in dark.
- Node only: `node --check verify-harness.js && node verify-harness.js` (harness also extracts and runs the inline script; it asserts visible painted text, full-loop node identity, zero innerHTML writes, light + dark themes). Also: extract the last inline `<script>` to a temp in-dir file and `node --check` it.
- Last run: all 37 harness checks PASS, `RESULT PASS`.

## Themes
- Checked light AND dark manually via token review (surface/page/ink/muted/subtle/border + component tokens) and via harness `__gkSetTheme('dark'/'light')` round-trip.
