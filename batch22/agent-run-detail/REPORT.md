# Report — fix-agent-run-detail (timeline filter fix)

## What was done
Targeted fix of existing `index.html` only. No rebuild, no data changes.

## Root cause
`applyFilter(f)` in `index.html` only toggled `aria-pressed` and added/removed the `.dim` class (opacity 0.78). It never hid rows and never updated `#colTimeline`. Result: clicking `Failures`/`Tools` changed pressed state but timeline still showed all 8 steps and header stayed `Timeline · 8 steps`.

## Original check (`demo-original.js`)
Checked `demo-original.js` before changing. The supplied original bundle has no interactive filter buttons — the `Thinking / Tool call / Sub-agent / Failed` block is a `ui-ard-legend` with `aria-hidden="true"` (non-interactive), plus time-based step slicing (`steps.filter(e=>e.start<=A)`). So the dead-button behaviour is replica-specific, not verbatim original behaviour. Per QA expectation (Failures = only failed steps, Tools = only tool steps, header count = filtered count), fixed the replica's added `All / Thinking / Tools / Failures` buttons to actually filter.

## Fix
In `index.html`, `applyFilter` now, in place:
- sets `style.display='none'` + `hidden` for non-matching rows, `style.display=''` + `removeAttribute('hidden')` for matching rows (no re-render, listeners preserved);
- match logic unchanged: `thinking→kind==='thinking'` (3), `tools→kind==='tool'` (4), `fail→state==='failed'` (1), `all→8`;
- updates `colTimeline.textContent` to `Timeline · N step(s)` with correct count;
- `advance()` and restart handler re-call `applyFilter(state.filter)` so `fail` (state-dependent) stays correct across ticks/restarts and count stays in sync;
- expand via `select(idx,true)` untouched — detail toggle works under an active filter.

Kept: `/*noflash*/` guard, CSS tokens, demo `STEPS`/`SUBS` verbatim, zero `innerHTML` (only `textContent`/`classList`/`style`/`hidden` updates).

## How to test
Open `index.html` in a browser:
1. Click `Failures` → 1 row visible, header `Timeline · 1 step`.
2. Click `Tools` → 4 tool rows visible, header `Timeline · 4 steps` (Thinking rows Plan/Identify/Summarize hidden).
3. Click a visible row → detail expands/collapses under filter.
4. Toggle theme (sun/moon) → same filtering in light and dark.

Node-only verification (no installs):
- `node --check` on extracted `<script>` blocks — passes.
- `node verify-filter.js` — DOM-stub harness asserts visible state (display/hidden) for All/Thinking/Tools/Failures in light AND dark, expand-under-filter, full-loop (8× `advance`) node identity (`===`), and zero `innerHTML` writes after init. All pass.

## Verification
- Light + dark checked (harness toggles `setTheme('dark'/'light')` and re-asserts counts).
- Full-loop node identity preserved.
- Zero `innerHTML` writes after init.
- `index.html` ~25KB, `<200KB`, self-contained.
