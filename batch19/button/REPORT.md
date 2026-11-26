# Button — affectUI replica report

## What was built
- ONE self-contained `./index.html` (21KB, no network, system fonts only). Inline CSS + JS.
- Replicates the Button demo from `./demo-original.js`: compact action row (Cancel / Upload / Send) plus a showcase card with three sections — Styles, Icons and sizes, Feedback and states — and an `aria-live="polite"` status line.
- Clean-room implementation: DOM and styles written from observed behaviour/strings/timings. Icon `d` path data re-drawn as inline SVGs (same shapes: plus, arrow-up, arrow-right, ellipsis, copy, upload-tray, trash, check); no compiled source copied.

## Matched data / behaviour (verbatim from demo-original.js)
- Labels: `Save changes`, `Secondary`, `Ghost`, `Delete`, `Add item`, `Continue`, `More options` (ghost icon-only, `aria-label`), `Large` (lg), `Copy link`/`Copied`, `Copy`/`Copied` (icon-only `aria-label`), `Upload file`, `Disabled` (disabled), `Cancel`, `Upload`/`Done`, `Send` (iconRight).
- Timings: copy feedback 1600ms (`m(e=1600)`), compact Upload idle→loading→`Done` in 1600ms, showcase `Upload file` loading→done in 1800ms with status `Uploading…` → `Upload complete` (blank single-space when idle).
- Behaviour: compact Upload ignores clicks while loading/done (stuck at `Done` until `Cancel` resets to idle and cancels the pending timeout, matching the effect-cleanup in the original); showcase Upload ignores clicks while loading but retriggers after done; copy buttons swap copy→check icon and label/aria-label for 1600ms.
- Slot width stabilisation (`button-demo__slot` minWidth): each `.btn-slot` keeps the max measured button width so `Copy link`↔`Copied` / `Upload`↔`Done` swaps do not shift layout.

## Chrome / spec compliance
- Design tokens via CSS custom properties for every colour; light (`--surface #ffffff`, `--page #fafaf9`, `--ink #1c1917`, `--muted #78716c`, `--subtle #f5f5f4`, `--border #e7e5e4`, radius 16/10/6, soft shadow) and dark (`#1c1c1f`/`#101012`/`#ededed`/`#a1a1aa`/`#26262a`/`#2e2e33`) with amber/green/red status legibility.
- Visible sun/moon toggle top-right switching `data-theme="light"|"dark"` on `<html>`, persisted to `affectui-button-theme`. Default markup is `light` (the original Button demo appearance); guard falls back to `prefers-color-scheme` when no stored value.
- `/*noflash*/` guard is the first script in `<head>`, plus `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}` and `<meta name="color-scheme" content="light dark">`.
- No agent identities in this component, so no pixel-marks (spec requires exactly 9 cells only when agents exist).
- v5 polish: all `:hover` rules inside `@media (hover:hover) and (pointer:fine)` (harness asserts zero outside), `html{-webkit-tap-highlight-color:transparent}`, `body{font-variant-numeric:tabular-nums}`, concentric radii (card 16 / buttons 10 / small 6), shadows for elevation + borders only for structure/inputs, optical icon padding tweak (icon side 2px tighter), focus-visible outlines, responsive stacked layout under 640px.
- Hard-won rules: no `innerHTML` anywhere in page script (only `textContent`/`setAttribute`/`classList` in place); `[hidden]{display:none!important}` beats `.btn svg`; no `.className` assignment on SVG (only `setAttribute`/`removeAttribute` for `hidden`); hover/focus never re-render; timers update existing nodes only.

## How to test
- Open `./index.html` in a browser. Click Copy link / Copy icon (shows Copied 1.6s), Upload (compact → Done in 1.6s, Cancel resets), Upload file (status Uploading… → Upload complete in 1.8s). Toggle sun/moon for dark mode.
- Node verification (no installs, no browser):
  - `node --check ./page-script.js` (extracted page script) → CHECK_OK
  - `node ./harness.js` → in-dir DOM-stub harness loads both inline scripts, mocks timers, asserts visible text through the full loop, node identity, and zero innerHTML writes after init.

## Verification results
- `node --check ./page-script.js`: passed.
- `node ./harness.js`: PASSED (53 assertions). Covers: all verbatim strings in markup, noflash/toggle/hover/tap/tabular/hidden/status checks, initial `Upload`/`Copy link`/blank status, copy 1600ms cycle (both buttons), compact 1600ms → `Done` + Cancel reset, showcase 1800ms → `Upload complete` + retrigger, object identity of 5 nodes across the full loop, `innerHTMLWrites=0` after init, theme light→dark→light toggle, token presence.
- Light AND dark checked: harness toggles `data-theme` both directions and asserts the switch; dark tokens (`#1c1c1f`, `#101012`) and adjusted hover/disabled/focus styles verified in markup/CSS. Manual browser check recommended for pixel contrast, but both themes render from the same tokens with no grey-on-grey.
