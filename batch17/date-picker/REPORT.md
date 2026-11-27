# Date Picker — targeted fix report

Targeted fix of the existing `./index.html` (no rebuild). Checked `./demo-original.js` first; kept `/*noflash*/` guard, in-place updates only, zero `innerHTML` writes after init, demo data verbatim.

## Defects and root causes

### (1) Mouse click on “First run” did not open the calendar (both themes); keyboard did
- **Original (`demo-original.js`):** trigger opens only via `onClick: () => V ? Z() : X()`. No `pointerdown` opener. Mouse click works in the original.
- **Replica regression:** `index.html` added a capture-phase `pointerdown` opener (`if (!open) doOpen()`) to satisfy the house rule, but kept the old toggle `click` handler (`if (open) doClose() else doOpen()`). A real mouse click fires `pointerdown` (opens) then `click` (sees `open === true`, closes). Net effect: appears to never open. Keyboard `Enter`/`ArrowDown` has no preceding `pointerdown`, so it opened normally.
- **Fix (JS only, per picker instance):** added `suppressClick` flag. `pointerdown`/`mousedown` capture set it and open; `click` consumes the flag once (`if (suppressClick) { suppressClick = false; return; }`) instead of toggling. Second click (no preceding open) still closes. Focus behaviour unchanged (open still moves focus to the day, matching the original `J.current = true` path).

### (2) Calendar grid collapsed to a single column (both themes)
- **Original:** panel JSX is a child of the `.ui-dpk` div, so `var(--cell)` / `var(--ui-dpk-*)` inherit. Grid rule: `.ui-dpk__weekdays, .ui-dpk__week { display: grid; grid-template-columns: repeat(7, minmax(0, var(--cell))); }`.
- **Replica regression:** `document.body.appendChild(panel)` portalled the panel outside `.ui-dpk`. `--cell` (defined only on `.ui-dpk`) became unresolved inside the panel, so `grid-template-columns: repeat(7, minmax(0, var(--cell)))` and `width: calc(var(--cell) * 7 + 20px)` were invalid. With no valid track list, the 7 weekday headers and 42 days auto-place one per row — the reported single-column stack, viewport overflow, unreachable Dec 1. Investigated the suspected “broad rule beats grid rule” hypothesis: no rule in `index.html` overrides `display: grid` on those classes; the computed failure is custom-property scope, not specificity.
- **Fix (one line):** `root.appendChild(panel)` instead of `document.body.appendChild(panel)`. `position: fixed` keeps viewport positioning; all `--cell`/`--d-*` vars (including `html[data-theme="dark"] .ui-dpk` overrides) now inherit. No CSS specificity change needed.

### (3) Summary line wrapped mid-phrase (“Keeps running” split)
- **Original:** `demo-original.js` demo (`dpk-demo`) has no summary/foot line — two pickers in a tray only. The `.foot` live line is a replica addition, so single-line treatment does not diverge from the original.
- **Fix (CSS only):** `.foot { …; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }` and `.foot code { …; white-space: nowrap; }`. Text and demo data unchanged.

## What was NOT changed
- `/*noflash*/` guard + `html{background…}` + `color-scheme` meta untouched and still first in `<head>`.
- DOM built once at init; timers/steps call in-place `paintAll`/`paintFocus` (text/attributes only). No new `innerHTML` writes (static grep: none; stub counter after full loop: 0).
- Demo data verbatim: labels `First run` / `Stop after`, hint `Research Agent only runs on weekdays.`, placeholder `Keeps running`, `min = today`, weekend-disabled, `min` chaining.

## Verification (node only, no installs)
- `node --check harness.cjs` — passes.
- `node harness.cjs` (in-dir DOM stub) — all pass:
  - static: noflash order, zero `innerHTML`, 7-col rule, foot nowrap, `root.appendChild(panel)`, pointer/mousedown capture.
  - light AND dark: real-click sequence (`pointerdown` + `mousedown` + `click`) opens to VISIBLE state (no `hidden` attr, `data-open` set, `aria-expanded="true"`, `style.display !== none`, no `visibility:hidden`/`opacity:0`); second click closes; keyboard `ArrowDown` opens.
  - grid: 42 day buttons with `data-day` + `aria-label`; panel parent is root.
  - summary: `liveB === "Keeps running"`, foot nowrap.
  - full loop (12× next + 12× prev + setValue + open/close + paint): root/trigger/panel/value/title + all 42 buttons + cell wrappers keep object identity; `innerHTML` writes after init = 0.
- Real-browser check still recommended: open `index.html`, click `First run` in light and dark, confirm 7-column calendar and one-line summary.

## Files
- `index.html` — three targeted fixes above.
- `harness.cjs` — stub harness described above.
- `REPORT.md` — this file.
