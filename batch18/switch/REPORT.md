# Switch — replica report

## What was built
ONE self-contained `./index.html` (13.1 KB, inline CSS+JS, system fonts, no network) replicating the `Switch` demo from `./demo-original.js` as clean-room code (own class names `sw-*`, own CSS, same behaviour/values).

Layout: centered page (`max-width 600px`), top bar with eyebrow `affectUI · Switch`, title `Switch`, subtitle `Instant on/off toggle with label, optional description, stretchy thumb interaction.`, count pills (`2 on`, `5 settings · 1 disabled`), visible sun/moon theme toggle top-right; card with 4 `placement=end` rows + divider + 1 `size=sm` row + footer (`State persists for this demo session only.` + `N of 4 enabled on` live count).

## Matched data / behaviour (verbatim from demo-original.js)
- `Daily digest` / `Approvals waiting, runs that finished or failed` — `checked=true`, `placement=end`
- `Weekly usage report` / `Credits spent and the busiest agents, every Monday` — `checked=false`, `placement=end`
- `Hold pushes at night` / `Mobile pushes wait until morning` — `checked=true`, `placement=end`
- `Sound on new messages` / `Needs the desktop app` — `disabled`, unchecked, `placement=end`
- `Compact rows` — `size=sm`, unchecked, default `placement=start`
- `role="switch"`, `type="checkbox"`, `aria-describedby` per row, `for`/`id` label association, native keyboard support.
- Track/thumb geometry: md `32×20`, sm `26×16`, thumb `h-4px`, `translateX(w-h)`, pressed stretch `width h+1px` with `translateX(w-h-5px)` when checked, `200ms` track / `260ms + 160ms` thumb with `--ease cubic-bezier(0.22,1,0.36,1)`, hover `off #e2e2e2→#d4d4d8` / `on #171717→#2e2e2e`, `focus-visible` outline, `pointer:coarse` larger (`40×24` / `34×20`, `15px` text), `prefers-reduced-motion` collapse.
- No timers/loop in original — replica has no timers; state changes only via native `change` events updating counts in place (`textContent` only). No `innerHTML` anywhere in main script.

## Design tokens / themes
CSS vars for every colour. Light: `page #fafaf9`, `surface #ffffff`, `ink #171717`, `muted #78716c`, `subtle #f5f5f4`, `border #e7e5e4`, `radius-lg 16px/radius 10px/radius-sm 6px`, `shadow 0 1px 2px rgba(0,0,0,.05), 0 4px 16px rgba(0,0,0,.05)`. Dark (`html[data-theme="dark"]`): `page #101012`, `surface #1c1c1f`, `ink #ededed`, `muted #a1a1aa`, `subtle #26262a`, `border #2e2e33`, darker shadows; switch dark `off #3a3a3f/off-hover #46464c/on #ededed/on-hover #d4d4d8`, checked thumb `#161618`.
Default theme = light (original demo appearance); guard falls back to `prefers-color-scheme`, toggle overrides + persists under `affectui-switch-theme`.
Checked light AND dark: static token presence + stub toggle dark→light, icon/label swap in place, contrast legible, no grey-on-grey.

Spec items N/A for this component: 3×3 pixel-marks (no agent identities in Switch — omitted deliberately), project/working/agent header + token-count bar (agent-crew pattern — adapted to `2 on` / `5 settings` pills), amber waiting status (included as tokens only).

## Hard-won rules
- DOM built once (static markup); JS only attaches listeners + in-place `textContent`/`hidden`/`data-theme` updates; zero `innerHTML` writes.
- No dialogs/popovers in this component (no pointerdown special-case needed).
- Hover/focus are CSS-only, never re-render.
- `[hidden]{display:none !important}` present; no broad `svg{display:block}` rule (icons use `.theme-icon{display:inline-flex}`, hide wins).
- SVG classes never assigned via JS (`hidden` property + `setAttribute` for `aria-label`/`data-theme` only).
- No browser launched; verification via `node` only.

## How to test
Open `./index.html` in a browser. Toggle switches (disabled row stays put), press `Tab`+`Space` for keyboard, resize narrow, click `Dark`/`Light` top-right, reload to confirm theme persists.

## Verification (in-dir, node only)
- `node --check ./__extracted.js` (extracted main script from `index.html`): OK.
- `node ./verify.cjs` (in-dir DOM-stub): ALL PASS — 9/9 visible strings, initial checked/disabled/sm/placement state, `role=switch`, noflash/meta/bg/toggle/tokens/`[hidden]`/no-network/system-font checks, simulated full loop (`Weekly on→3 on`, `Daily off→2 on`, restore→`2 on`), `onCount`/`footCount`/inputs keep object identity, `0 innerHTML writes after init`, theme toggle to dark + back, dark overrides present. Light AND dark checked.
