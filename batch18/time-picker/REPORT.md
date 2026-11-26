# Time Picker — replica report

## What was built
Single self-contained `index.html` (no network, system fonts) replicating the
affectUI `Time Picker` demo: type or pick time from an interval list, with
locale formats, min/max limits and flexible parsing.

Page: `Scheduler` header + `Run schedule` card with two pickers, theme toggle
(sun/moon, top-right) switching `data-theme="light"|"dark"` on `<html>`.
Default theme is light (the original demo appearance: white surface, `#fafaf9`
page). Dark theme uses the required tokens.

## Matched data / behaviour (verbatim from `demo-original.js`)
- Field 1: `label "Run at"`, `value "09:30"`, `hint "Every weekday, in your time zone (Europe/Vienna)."`
- Field 2: `label "Don't start after"`, `optional`, `value null`, `step 30`,
  `min = first value`, `placeholder "Any time"`,
  `hint "A run that would start later waits for the next day."`
- Strict `HH:MM` (`09:30`, `09:30:00`), `toText` zero-padded.
- Flexible parse: `9:30`, `930`, `9.30pm` → 21:30, `21:30`, `9:30am`,
  `12am→0`, `12pm→720`, unicode digits, `24:00→0`, prefix/suffix am/pm via
  `Intl.DateTimeFormat` dayPeriod + `a/am/p/pm`, minute ≤59, hour checks,
  `H/h/.` separators, 3–4 digit compact form.
- Locale formatting via `Intl.DateTimeFormat` (`numeric/2-digit`, `h12/h23`
  auto from locale unless `hourCycle` forces it); default placeholder is
  formatted `540` (09:00).
- Interval list `min..max step k` (`step 15` default, `30` for field 2,
  `96` quarter-hour rows full day); `firstAtOrAfter(now)` initial active,
  glide highlight, selected check, `ArrowUp/Down`, `PageUp/Down` (±60/step),
  `Alt+Down` opens, `Enter` picks navigated row else commits draft,
  `Esc` closes/cancels, `Tab` closes, `blur` commits, outside `pointerdown`
  (capture) commits+closes, toggle `pointerdown/mousedown preventDefault`
  so real clicks survive, `click` on box focuses input.
- Clock / chevron (rotates 180° open) / check icons as inline SVG
  (`setAttribute` for classes only).

No agent identities in this component, so no 3×3 pixel-marks (correctly
omitted — spec requires them only *if* the component has agent identities).

## Hard-won rules applied
- DOM built once at init (`createElement`/`createElementNS` only, zero
  `innerHTML`); timers/handlers update nodes in place
  (`textContent/value/attributes/style/scrollTop`); list rows diffed only
  when bounds change.
- Popovers open on `pointerdown`/`mousedown` capture; hover/focus never
  re-render.
- `[hidden]{display:none!important}` present; no broad `svg{display:block}`
  override; SVG classes via `setAttribute`.
- `/*noflash*/` guard first in `<head>` + `html{background}` +
  `<meta name="color-scheme" content="light dark">`.
- Design tokens as CSS custom properties for every colour; both themes
  checked for contrast (no grey-on-grey, borders visible).

## Verification (node only, no browser)
- `node --check` on extracted page script: OK.
- In-dir DOM-stub harness (temporary file inside this dir, removed after
  run) that loads the page script with a stub `document/window`:
  asserts visible strings (`Run at`, `Don't start after`, both hints,
  `Any time`), strict/flex/steps numbers, two pickers with `570`/`null`,
  commit `600`, min-linkage steps start at `600`, open→navigate→commit→close
  full loop keeps `root/input/list` object identity, `innerHTML` writes `0`,
  light→dark→light switch with dark vars present. Result:
  `ALL_HARNESS_CHECKS_PASSED` (light AND dark checked).
- Open `index.html` in a browser to test manually.
