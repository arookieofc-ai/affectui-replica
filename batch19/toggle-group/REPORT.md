# Toggle Group — replica report

## What was built
`index.html` (22 KB, self-contained, no network, system fonts only) replicates the
affectUI **Toggle Group** demo as observed in `demo-original.js`: a row of toggle
buttons supporting multiple or single selection with full keyboard navigation.

Layout: top bar (brand + group/option counts + sun/moon theme toggle), one card with
three demo rows, keyboard hint, and a live status bar (`aria-live="polite"`).

## Matched data / behaviour (verbatim from demo-original.js)
- Row 1 — label `Show runs`, variant `buttons`, multi-select, items
  `Running` / `Needs you` / `Done` / `Failed` (values `running`, `needs-you`,
  `done`, `failed`), initial `["running","needs-you"]`.
- Row 2 — label `Prompt formatting`, variant `tray` (default), size `sm`,
  multi-select icon-only items with aria-labels `Bold` / `Italic` / `Code` / `List`
  (values `bold`, `italic`, `code`, `list`), initial `["bold"]`.
- Row 3 — label `Group by · press again for none`, type `single`, size `sm`,
  items `Agent` / `Model` / `Day`, initial `agent`; pressing the selected item
  again clears to none.
- Auto demo: status group steps
  `[running,needs-you,failed]` → `[needs-you,failed]` → `[needs-you]` →
  `[running,needs-you]` at delays `1000, 2300, 3600, 4900` ms
  (`1000 + n*1300`), then the cycle repeats every `7400` ms (loop extension of the
  original one-shot schedule so the demo stays alive; same data/timings).
- Any `pointerdown` / `keydown` on the demo card (capture phase) cancels the auto
  timers and flips the status bar to "paused — you have control", matching the
  original `onPointerDownCapture` / `onKeyDownCapture` cancel.
- Keyboard: arrows move focus (RTL-aware Left/Right swap), Up/Down, Home/End,
  wraparound; ignores Alt/Ctrl/Meta; skips disabled items; Space/Enter activates
  natively. Disabled group dims via `data-disabled`.
- Tray vs buttons styling, sizes sm/md/lg, pressed-fill scale-from-middle
  (`::before` layer), 36px touch targets on coarse pointers,
  `prefers-reduced-motion` disables animation.

## Spec compliance notes
- Design tokens via CSS custom properties; light default (original demo
  appearance) + dark theme; visible toggle switches `data-theme` on `<html>` and
  persists to `affectui-toggle-group-theme` (falls back to `prefers-color-scheme`).
- `/*noflash*/` guard first in `<head>` + `meta color-scheme` + inline
  `html{background…}` paint rule.
- v5 polish: all `:hover` inside `@media (hover:hover) and (pointer:fine)`;
  `html{-webkit-tap-highlight-color:transparent}`;
  `body{font-variant-numeric:tabular-nums}`; concentric radii
  (card 16 → row 12 → group 11/9 → item minus padding); real borders for
  structure, shadows for elevation; focus-visible outlines; optical
  icon-only padding nudge; `[hidden]{display:none !important}`; SVG visibility via
  `setAttribute('hidden')` only (never `.className` on SVG); no broad
  `svg{display:block}` reset.
- Header adapted: primitive has no project/agents, so the bar shows the component
  name plus live group/option counts with tabular numerals. No 3×3 pixel-marks:
  the component has no agent identities (rule is conditional).
- Clean-room code: own markup/CSS/JS written from observed behaviour; no compiled
  source copied. DOM built once; timers update only `aria-pressed`/`textContent`
  on existing nodes — never `innerHTML` after init; hover/focus never re-render.

## Verification (node only, no browser)
- `node --check` on the extracted inline script: **OK**.
- In-dir harness `verify-harness.js` (DOM stub + fake timers, files inside this
  directory only): **ALL CHECKS PASSED (light AND dark)** — advances timers
  through the full loop, asserts visible live-line text at each step
  (e.g. "Showing: Running, Needs you, Failed"), asserts button/live-line/span
  node identity across a full loop + restart, asserts zero `innerHTML` writes,
  asserts theme toggle flips both ways, and re-runs the pass in dark mode.
- Checked contrast manually in both themes (ink/muted on surface, amber
  adjusted for dark). Open `index.html` in a browser to test: click toggles,
  arrow keys move, interaction pauses the auto demo, toggle switches theme.
