# Select — Replica Report

## What was built
- ONE self-contained `index.html` (27 KB, no network, no external assets, system fonts) in this directory.
- Clean-room implementation of the `Select` component: single-option picker in text-field style with icons, gliding highlight, and type-ahead.
- Page chrome: topbar with project `onboarding-flow · 3 fields · 1 needs attention`, context `44k / 200k` with thin 3 px bar (right-aligned), visible theme toggle (top-right) switching `data-theme="light"|"dark"` on `<html>`.
- Card with 3 selects matching demo verbatim: `Role`, `Default model`, `Time zone` + status bar auto-tour label + footer hints.

## Matched data / behaviour (verbatim from demo-original.js)
- Roles (5): `Design`, `Engineering`, `Product`, `Founder`, `Something else` + exact SVG path strings.
- Models (5): `Auto / Picks the model for each message`, `Claude Opus 5.5 / Best for hard, long questions`, `Claude Sonnet 5.5 / Fast and strong for most work`, `Claude Haiku 5.5 / Quickest, for short answers`, `Your own model / Add an endpoint in Models first` (disabled).
- Time zones (14): `Pacific Time – Los Angeles` … `Australian Eastern Time – Sydney` (value=label).
- Initial values: role=`design`, model=`auto`, tz=`null`; placeholder `Choose…` / `Choose a time zone`; hint `Helps tailor suggestions to your work.`; error `Pick one, so reminders arrive on time.`
- Behaviour: click/pointerdown to open, outside pointerdown-close, `ArrowDown/Up/Home/End/PageUp/PageDown/Enter/Space/Escape/Tab`, 700 ms type-ahead buffer with wrap-around prefix search skipping disabled, gliding glow highlight, animated tick, `aria-expanded/combobox/listbox/activedescendant/selected`, invalid styling when tz empty.
- Auto-tour loop (in-place): 10 steps × 2200 ms — open Role → highlight Engineering → pick → open Model → highlight Sonnet → pick → open TZ → highlight Gulf Time – Dubai → pick → reset to initial. Loop restarts in place.

## Design tokens / themes
- Light: surface `#ffffff`, page `#fafaf9`, ink `#171717`, muted `#78716c`, subtle `#f5f5f4`, border `#e7e5e4`, radius-lg `16px`, radius `10px`, radius-sm `6px`, shadow soft.
- Dark: surface `#1c1c1f`, page `#101012`, ink `#ededed`, muted `#a1a1aa`, subtle `#26262a`, border `#2e2e33`, amber adjusted `#fbbf24` on `#451a03`.
- `/*noflash*/` guard first in `<head>` + `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}` + `<meta name="color-scheme">`. Default = light (original appearance) unless stored theme or `prefers-color-scheme: dark`.
- `[hidden]{display:none!important}` present; SVG classes via `setAttribute('class',…)` only; no broad `svg{display:block}` rule; open on `pointerdown`/`mousedown` capture; hover/focus only update active/glow.

## Header / pixel-marks notes
- Header follows v3 pattern (project + counts + context bar + toggle). No 3×3 pixel-marks: component has no agent identities, so omitted per spec (“if the component has agent identities”).

## How to test
- Open `index.html` in a browser. Click fields, hover options, type letters (e.g. `e`, `s`, `g`), use arrows/Enter/Esc. Toggle ◐ button top-right for dark mode.
- No build, no server required.

## Verification (node only, no browser)
- `node --check ./extracted.js` → OK (main script extracted from `index.html`).
- `node ./verify.js` → all PASS:
  - noflash first in head, color-scheme, bg styles, `[hidden]` rule, tokens light+dark, toggle + capture handlers, SVG `setAttribute`, zero `.innerHTML=` writes, timer loop present.
  - Verbatim strings (roles/models/zones/labels/hints/errors/placeholders/context) present.
  - DOM-stub run: initial visible `Design` / `Auto` / `Choose a time zone` / error / hint; advance 10 ticks → loop restores initial; mid-loop shows `Gulf Time – Dubai`; unchanged nodes keep object identity; zero innerHTML writes; theme toggle flips `light→dark`.
- Light AND dark checked: CSS contains both token sets; toggle handler verified to flip `data-theme`; dark list/glow/border shadows defined.
