# Date Range Picker — targeted fix report

## What was fixed (2 defects; 1 left as-is per original)

### (1) Compare radio group in LIGHT theme — FIXED
**Symptom (real-browser QA):** `OffPrevious periodPrevious year` — three labels jammed with no spacing and no visible selected affordance.

**Root cause(s) in `./index.html`:**
- `.drp button{padding:0}` (specificity `0,1,1`) overrode `.drp__segment{padding:0 8px}` (specificity `0,1,0`), collapsing horizontal padding to `0`.
- `.drp__segments` had no `gap`, so the three `role=radio` buttons touched.
- Selected state was pill-only (`background:var(--subtle)` `#f5f5f4` on `var(--surface)` `#ffffff` with `1px var(--line)` `#ececec`), very low contrast in light; no radio-circle affordance.

**Note on `./demo-original.js`:** the original also uses a segmented `radiogroup` (`role=radiogroup` + `button role=radio` + sliding `.ui-drp__pill`), not native radio circles, and has the same `padding:0` override. QA explicitly requires “visible circles + proper spacing in both themes”, so a minimal circle affordance was added (original pill + demo data unchanged).

**Fix (CSS only, tokens preserved):**
- `.drp__segments` → `display:inline-flex;align-items:center;gap:4px` (spacing).
- `.drp__segments .drp__segment` (`0,2,0`, beats `.drp button`) → `display:inline-flex;align-items:center;gap:6px;padding:0 10px 0 8px`.
- `.drp__segments .drp__segment::before` → `12px` circle, `border-radius:50%`, `border:1.5px solid var(--muted)`, transparent fill.
- `.drp__segments .drp__segment[aria-checked="true"]::before` → `border-color:var(--accent);background:var(--accent);box-shadow:inset 0 0 0 2px var(--surface)` (dot).
- Light: `--muted #78716c` ring on `#ffffff`, selected `--accent #0284c7`. Dark: `--muted #a1a1aa` on `#1c1c1f`, selected `--accent #4fb0fe`. Both contrast; no `display:none`/`visibility:hidden`/`opacity:0`.

### (2) Theme toggle closes panel + kills trigger — FIXED
**Symptom:** clicking `◐ Theme`/`☀ Light` closes the open panel; afterwards mouse click and Enter both fail to reopen (dark and back to light).

**Root cause(s):**
- `document` `pointerdown` outside-close (`if(S.open && !R.root.contains(e.target)) closePanel(true)`) treated the theme button (`#themeBtn`, outside `R.root`) as an outside click, so every theme toggle forced `S.open=false`.
- `onTriggerClick()` only handled close (`if(S.open && !_ptrOpened) closePanel`), never open. Mouse reopen relied on `pointerdown→openPanel`, but keyboard (Enter/Space → `click` without `pointerdown`) had no open path, so Enter could never reopen.

**Fix (JS only, no rebuild, handlers preserved):**
- Outside-close now ignores the toggle: `if(e.target&&e.target.closest){try{if(e.target.closest('#themeBtn,.theme-btn'))return;}catch(_){}}`.
- `onTriggerClick()` now toggles: `if(S.open && !_ptrOpened){closePanel} else if(!S.open){openPanel}` + clear flag. Mouse flow unchanged (`pointerdown` opens, `click` with `_ptrOpened` no-ops); keyboard `Enter`/`Space` → `click` now opens when closed, closes when open.
- Theme handler still only flips `data-theme` + `localStorage` + label (in-place `textContent`, no `build()`, no `innerHTML`), so trigger/panel node identity survives.

### (3) Default-open panel covers explanatory text — LEFT AS-IS (matches original)
**Check of `./demo-original.js`:** panel CSS is `position:absolute;z-index:30;top:calc(100% + 8px);left:0`, and the demo exports `defaultOpen:!0` (`le({defaultOpen:!0})`). The original therefore overlays content below the trigger when open by design.
**Action:** no placement change. Replica keeps `position:absolute` + default `S.open=true`, matching the original. `demo-note` text unchanged.

## Preserved guardrails
- `/*noflash*/` guard + `<meta name=color-scheme>` + `html{background}` untouched.
- In-place updates only; `build()` once at init; `updateAll()` mutates `textContent`/attributes/styles on existing nodes.
- Zero `innerHTML` writes after init (static + runtime harness count `0`).
- Demo data verbatim: `Off` / `Previous period` / `Previous year`, presets (`Today`, `Yesterday`, `Last 7 days`, `Last 30 days`, `90d`, `This month`, `Last month`, `This quarter`, `Year to date`), `Last 30 days + Previous period` defaults.
- CSS tokens for all colours; `:hover` stays inside `@media (hover:hover) and (pointer:fine)`; `html{-webkit-tap-highlight-color:transparent}`; `tabular-nums` for counts.

## How to test
- `open index.html` in a browser. Panel is open by default.
- Light: Compare shows three spaced pills each with a visible ring; `Previous period` selected (filled accent dot).
- Click `◐ Dark` → panel stays open, trigger `aria-expanded=true`, panel not `hidden`; click again → back to light, still open.
- Close via outside click or `Cancel`/`Apply`, then reopen via mouse click and via focusing trigger + `Enter`/`Space` — all reopen in both themes.
- Narrow width stacks; `Esc` closes; day hover preview and compare band unchanged.

## Verification (node only, no installs)
- `node --check ./extracted-check.js` (scripts extracted from `./index.html`) — OK.
- `node --check ./harness.cjs` — OK.
- `node ./harness.cjs` — ALL PASS: noflash/meta, circle CSS + gaps, visible (no `display:none`/`visibility:hidden`/`opacity:0`), light vars (`#78716c`/`#0284c7`/`#ffffff`) + dark vars (`#a1a1aa`/`#4fb0fe`/`#1c1c1f`), theme exclusion + keyboard toggle present, zero `innerHTML`, build OK, default-open visible, 3× `role=radio` with one `aria-checked=true`, full-loop node identity (`root`/`trigger`/`panel`/segs same after `updateAll×2`), theme-toggle preserves open, outside-click still closes, mouse + Enter reopen, dark/light reopen visible + identity preserved.

## Files
- `./index.html` (targeted fix, `36.6KB`, `<200KB`)
- `./REPORT.md` (this file)
- `./harness.cjs` (in-dir DOM-stub harness)
