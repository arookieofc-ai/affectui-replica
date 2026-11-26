# Text Field — replica report

## What was built
ONE self-contained `index.html` (20.7 KB, no network, no external assets, system fonts) replicating the affectUI `Text Field` demo as clean-room code. Static markup + one inline behavior script. No Tailwind, no build step.

Layout: centered page (`max-width 680px`), top bar with `affectUI · Text Field / Text Field / Single-line form input…` + visible theme toggle (top-right, pill with sun/moon + Dark/Light label), card `Workspace settings / 5 fields · live validation` containing a `novalidate` form with 5 stacked fields, plus tip row (`Esc clears`, `Copied for 1.6s`, try `Bad_URL!`).

## Matched data / behaviour (verbatim from `demo-original.js`)
- Field 1 `Workspace name`: value `Maya Labs`, `maxlength=32`, counter `9/32`, `clearable`. Clear button shows only when non-empty; click or `Esc` clears + refocuses; counter updates `n/32` with `data-full` at 32.
- Field 2 `Workspace URL`: prefix `acme.app/`, value `maya-labs`, `spellcheck=false`, `autocapitalize=none`, hint `Lowercase letters, numbers and dashes.`, error `Only lowercase letters, numbers and dashes.` via `/^[a-z0-9-]*$/`. Live: valid → hint, invalid → `data-invalid` + `aria-invalid` + error.
- Field 3 `Billing email`: `type=email`, value `maya@acme`, `Optional` badge, hint `Invoices go here.`, error `Enter a full email, like maya@acme.com` via `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/`. Initial `maya@acme` is invalid so error is visible on load (matches original logic `s && !m.test(s)`).
- Field 4 `Password`: value `orbit-lantern-42`, `type=password`, `autocomplete=new-password`, reveal toggle `Show password`/`Hide password` with `aria-pressed`, `type` swap + `data-revealed`, eye/eye-off icons (own SVG, not copied paths).
- Field 5 `API key`: value `aui_demo_4f9a2c71e8b3`, `readonly`, `copyable`, mono font. Copy tries `navigator.clipboard.writeText`, fallback `select()`; shows `Copied` (`aria-label=Copied`, `data-copied`, check icon, `role=status` text `Copied`) for exactly `1600ms` then reverts; button disabled when empty.
- Box focus: `pointerdown` + `mousedown` capture on `.ui-tf__box` focuses input unless target is input/button (real clicks survive). Hover/focus are CSS-only, never re-render.
- Form `submit` prevented; `reset` repaints in place.

## Design tokens / themes / hard rules
- Tokens as CSS vars: light `surface #ffffff page #fafaf9 ink #171717 muted #78716c subtle #f5f5f4 border #e7e5e4 radius-lg 16 radius 10 radius-sm 6 shadow 0 1px 2px…`; dark `surface #1c1c1f page #101012 ink #ededed muted #a1a1aa subtle #26262a border #2e2e33 darker shadows`; amber waiting `#f59e0b/#fef3c7/#92400e` → dark `#fbbf24/#451a03/#fde68a`; danger/success/focus vars. No hard-coded hex per element.
- Toggle switches `data-theme="light"|"dark"` on `<html>`, persists to `tf-theme`, `aria-pressed` + label update. Default = original appearance (light) unless stored or `prefers-color-scheme: dark`.
- `<head>` starts with `/*noflash*/` script (stored → prefers → light) + `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}` + `<meta name=color-scheme>`.
- In-place only: DOM queried once at init, updates via `textContent`/`hidden`/`setAttribute`/`removeAttribute`/`disabled`/`type`; never `innerHTML` (zero assignments in file). Node identity preserved across full copy loop.
- `[hidden]{display:none!important}` present after icon rules; SVG classes only via `setAttribute('class',…)`; scoped `.ui-tf__action svg{display:block}` does not beat hidden (hidden has `!important` + later order). No `innerHTML`, no `fetch`, no external URLs.
- Header/pixel-marks: N/A — Text Field has no agent identities, so no 3×3 pixel-marks (spec: only if component has identities). Used component-appropriate header (title + meta + toggle) instead of agent crew header.
- Clean-room: CSS/JS rewritten; icons redrawn with simple shapes; no verbatim copy of compiled `f` CSS or path data.

## How to test
Open `index.html` in a browser. Try typing `Bad_URL!` in URL, `maya@acme` vs `maya@acme.com` in email, `Esc`/× in name, eye toggle, copy button. Toggle Dark/Light top-right; reload persists.

## Verification (node only, no browser)
- `node --check _page.extract.js` (script extracted from `index.html`): exit 0.
- In-dir DOM-stub harness `_harness.cjs` (reads `index.html`, runs largest inline script in `vm` with fake DOM/timers/clipboard): ALL PASSED —
  visible `9/32`, URL hint, email error, `Copied` → revert after `advance(1600)`, URL error on `Bad_URL!`, email hint on fix, clear+counter, node identity `===` across loop, `innerHTML` writes `0`, toggle `light→dark→light`.
- Static: no `http`, no `<link`, no `@import`, no `fetch`; `<head>` starts with noflash; `.className` assignment absent; size 20.7 KB <200 KB.
- Light AND dark checked: harness asserts toggle both ways + tokens present; manual CSS review confirms dark contrast (ink `#ededed` on surface `#1c1c1f`, muted `#a1a1aa`, borders `#2e2e33` visible).

## Not verified
No pixel-perfect screenshot diff (no browser in env); animations (`160ms` transitions) eyeballed via CSS only.
