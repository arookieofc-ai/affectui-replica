# Agent Fleet — replica report (v2)

## What was built
Standalone `index.html` (~28KB, inline CSS/JS, system fonts, no external deps) — improved in place from v1, same layout/interactions kept: 3 fleet cards side by side, click a card opens its sub-agent tree in the panel on the right, opening another folds the previous back (single-open). Clicking the open card folds it back.

## v2 fixes applied
1. **Design tokens, no ad-hoc hex** — all colour lives in `:root` / `[data-theme="dark"]` custom properties (`--surface #ffffff`, `--page #fafaf9`, `--ink #1c1917`, `--muted #78716c`, `--subtle #f5f5f4`, `--border #e7e5e4`, radii 16/10/6, soft shadow `0 1px 2px rgba(0,0,0,.05), 0 4px 16px rgba(0,0,0,.05)`; status tokens incl. waiting `#f59e0b / #fef3c7 / #92400e`). Verified: zero hex colour literals outside the token blocks (only false positive is the text string "refund #4821"). Bar/legend dots, pills, progress, focus rings, code chips all reference `var(--…)`. Avatar/progress gradients use token stops (`--av1a…`, `--prog-a/b`).
2. **Dark mode** — visible sun/moon toggle (`☾/☀`, top-right in header, 36px 999px button with hover/focus). Switches `data-theme="light"|"dark"` on `<html>`. Default follows `prefers-color-scheme` (early `<head>` script avoids flash); toggle overrides and persists to `localStorage`; listens for OS changes when no override is stored. Dark tokens per spec: surface `#1c1c1f`, page `#101012`, ink `#ededed`, muted `#a1a1aa`, subtle `#26262a`, border `#2e2e33`, darker shadow; amber waiting adjusted (`#fbbf24` dot on `#451a03` bg, `#fde68a` text).
3. **Original demo data** — replaced invented Support/Sales/Ops fleets with the brief's fleets:
   - **Launch Lead** (sonnet · crew-4): Researcher (working), Writer (working), Coder (waiting — review), Tester (idle — suite passed)
   - **Support Lead** (sonnet · crew-4): Triage (working), Billing (waiting — refund #4821), Bug reports (working), Escalation (idle — on-call)
   - **Release Manager** (haiku · crew-1): Changelog (working — v2.4 notes from 18 commits)
   Cards show status pill, sub-agent/open/working counts, working/waiting/idle bar + legend, cost row, View/Fold toggle. Tree panel: fleet root → nodes with status dot, model chip, task, tool chips, cost, progress; node click expands step list; hover/focus highlights root→node chain.
4. **Polish** — card radius 16px (`--radius-lg`), inner controls 10px (`--radius`), pills 999px; 1px border + soft shadow on cards/panel/stats; hover lifts (`translateY(-2px/-1px)`) + accent border; `focus-visible` 2px outline on cards, buttons, nodes; 150–200ms ease transitions; consistent 8–12px gaps, 12–16px card padding; system-ui 14px base, 15px semibold titles, 12–13px muted meta.

Kept from v1: live badge + 2.6s tick simulation (progress, working⇄waiting flips, cost creep, cards/tree/totals sync), search + status filter, keyboard (`←/→` cards, `Enter/Space` toggle, `Esc` close), pause/resume, responsive (≤1020px panel stacks, ≤700px single column), `prefers-reduced-motion` kill.

## Contrast check (both themes, WCAG AA ≥4.5:1)
- Light ink/surface 17.49:1 · muted/surface 4.80:1 · waiting 6.37:1 · working 4.57:1 · idle 6.99:1 · accent/surface 5.17:1
- Dark ink/surface 14.52:1 · muted/surface 6.63:1 · waiting 12.03:1 · working 8.55:1 · idle 10.08:1 · accent/surface 6.69:1
Checked via luminance calc; no grey-on-grey, borders visible in dark (`#2e2e33` on `#1c1c1f` + shadow). Page renders finished in dark, not just inverted text.

## What could not be verified
- No access to real affectUI Pro source or exact pixels — colours/spacing/icons are spec-token approximations.
- Exact original costs/tasks are plausible in-shape demo values for the named agents.

## How to test
1. Open `index.html` in a browser (no server needed).
2. Click Launch Lead → tree opens right; click Support Lead → Launch folds, Support opens; click again → folds.
3. Click a node (e.g. Coder) → steps expand; hover → root highlights.
4. Toggle ☾/☀ top-right → dark/light; reload with OS dark mode → defaults dark.
5. Try search ("refund"), filter Waiting, `←/→` + `Enter` + `Esc`, Pause ticks; resize ≤700px → stacked.

Clean-room: edited from v1 in place; no fetched bundle code copied.
