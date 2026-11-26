# Text Area — replica report

## What was built
- ONE self-contained `index.html` (20KB, inline CSS+JS, system fonts, no network) in this directory.
- Clean-room code: DOM built once at init via `createElement`/`createElementNS`; timers update only changed nodes in place (`textContent`, `style.height`/`overflowY`, `hidden`, attrs). No `innerHTML` anywhere in the page script.
- Page chrome: sticky topbar with project name `Acme Workspace`, component context `Text Area · company context`, count pills (`2 fields`, `1 expandable`, `44k / 200k`), context bar `44k / 200k` with 3px bar, and a visible sun/moon theme toggle top-right switching `data-theme="light"|"dark"` on `<html>` (persisted as `affectui-text-area-theme`).
- Demo card `Workspace settings` with exactly the two original fields, plus tip footer for `⌘/Ctrl+Enter`.

## Matched original (verbatim from demo-original.js)
- Company default: `We're Acme, a 40-person B2B company selling scheduling software to clinics in Germany and Austria.\nCommon terms: MRR, churn, onboarding call, practice (= customer).\nAnswer in English unless someone writes in German.` (length 215 → count `215/2,000`).
- Field 1: `label Company context`, `hint Added to every chat in this workspace.`, `maxLength 2000`, `counter`, `minRows 3`, `maxRows 7`, `expandable`, `expandedRows 12`, id `company-context-input`.
- Field 2: `label Note for the reviewer`, `optional` → `Optional` badge, `minRows 2`, `placeholder What should they look at first?`, idle hint `⌘ Enter to send`, sent hint `Sent – thanks!` (en-dash), `onSubmitShortcut` clears only if `trim()!==''`, next input clears sent flag, id `reviewer-note-input`.
- Behaviour/timings: autosize clamp `min=(expanded?max(expRows,minRows):minRows)*lh+pad`, `max=(expanded?max(expRows,maxRows):max(maxRows,minRows))*lh+pad`, `overflowY auto` iff `scrollHeight>max+1`; glide `data-gliding` 320ms, swap 280ms, message 260ms; expand toggles `aria-label More/Less room`, `aria-pressed`, `aria-controls`, icons (expand `M16.5 3h4.5v4.5M21 3l-6 6M7.5 21H3v-4.5M3 21l6-6` / shrink `M14.5 5v4.5H19M14.5 9.5 20 4M9.5 19v-4.5H5M9.5 14.5 4 20`); `aria-keyshortcuts Meta+Enter Control+Enter`, `aria-describedby` message+count, `dir=auto`; form `onSubmit preventDefault`.
- No agent identities in this component, so no 3x3 pixel-marks (spec: only if the component has agent identities).

## Design tokens / themes
- CSS vars for every colour; light: surface `#ffffff`, page `#fafaf9`, ink `#171717`, muted `#78716c`, subtle `#f5f5f4`, border `#e7e5e4`, radius-lg `16px`/radius `10px`/sm `6px`, shadow `0 1px 2px rgba(0,0,0,.05), 0 4px 16px rgba(0,0,0,.05)`; dark: surface `#1c1c1f`, page `#101012`, ink `#ededed`, muted `#a1a1aa`, subtle `#26262a`, border `#2e2e33`.
- `<head>` starts with `/*noflash*/` script (stored key else `prefers-color-scheme`) + `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}` + `<meta name=color-scheme light dark>`; default `data-theme="light"` matches original light demo.
- Hard-won rules: `[hidden]{display:none!important}` + `svg[hidden]` override, SVG attrs only via `setAttribute`, expand button has `pointerdown` capture listener, hover/focus only change `box-shadow` (no re-render).

## Verification (node only, in-dir)
- `node --check` on extracted longest `<script>` block: OK.
- `node verify-harness.cjs` (DOM-stub in this dir): ALL CHECKS PASSED — asserts VISIBLE `textContent` (labels, both hints, `215/2,000`, `Optional`, value verbatim), expand open/close + 320ms glide clear, `Cmd+Enter` send → cleared value + `Sent – thanks!`, next input restores idle, whitespace submit ignored, theme toggle light→dark→light, zero `innerHTML` writes across full loop, and 9 nodes keep `===` identity.
- Light AND dark checked via toggle simulation + token/CSS inspection.

## How to test
- Open `index.html` in a browser. Type in Company context (count grows, box auto-grows, expand toggles 12-row mode). Type in note + `⌘/Ctrl+Enter` to send (`Sent – thanks!`). Toggle Theme top-right; reload persists; `prefers-color-scheme: dark` defaults to dark.
- Re-run: extract longest `<script>` to a temp file in this dir and `node --check` it; then `node verify-harness.cjs`.

## Not verified
- Pixel-perfect line-height vs original Inter font (uses system fonts per spec); iOS 16px coarse-pointer upscale and `ResizeObserver` width path rely on real browser layout (stubbed in harness).
