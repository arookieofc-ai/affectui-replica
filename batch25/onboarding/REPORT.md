# Onboarding — Replica Report

Public description: First-run AI workspace setup: workspace, tools, invites, first agent, checklist.

## What was built
Standalone `index.html` (37.8KB, inline CSS+JS, system fonts only) replicating the affectUI `Onboarding` screen (`slug: onboarding`, App screens, Pro):
- Sticky top bar: `Home / Getting started` + sun/moon theme toggle (top-right).
- Two-column layout: left aside (`Welcome to Acme, Alex`, `Getting started`, `A few quick steps – about two minutes.`, setup checklist with 3px progress bar + `N of 4 done`, `Need a hand? Book a free 15-minute setup call`) and main card with 4-step form + success screen.
- Step 1 Workspace: name input (`Acme`), URL prefix `app.workspace.ai/` with live slug preview (`app.workspace.ai/acme`), team-size select (`Just me`, `2–10`, `11–50`, `51–200`, `200+`), required-name validation.
- Step 2 Tools: 6 rows with verbatim names/descriptions (Slack, Notion, Google Drive, HubSpot, Linear, Google Calendar), letter-mark logos, switch toggles, 800ms spinner → `Connected` pill (Slack pre-connected).
- Step 3 Team: email chip input prefilled `jamie@acme.com`, comma/space split, lowercase normalize, invalid-email error (`“x” doesn't look like an email address.`), role select (Member/Admin/Viewer), invite link `app.workspace.ai/acme/join` + `Copy link` → toast `Invite link copied`.
- Step 4 Agent: 3 radio templates (Weekly report / Every Monday, Lead research / On new leads, Support triage / On new tickets) with arrow-key roving focus, `Create agent` → 1100ms `Creating agent` loading → success.
- Footer: `Skip for now` (marks skipped), `Back`, dynamic primary (`Continue` / `Send invites` / `Create agent` / `Open chat`); checklist items clickable, show `In progress` / time / done summary / `Skipped – pick it up anytime`; success screen (`Acme is ready`, `Your Weekly report agent is set up…`, 3 next steps, `Start over`).
- Toasts for copy/help/next-step actions.

## Matches original
- All demo data verbatim from `demo-original.js`: step headings/texts/times, tool names/descriptions, size/role options, template names/texts/metas, default workspace `Acme`, user `Alex Morgan`, default invite `jamie@acme.com`, link shape, button labels.
- Layout/behaviour parity: header path, grid `248px + 600px`, card/checklist/help stacking, single-line ellipsis rows, slide-in step animation with back direction, 620ms progress transition, focus to title on step change.

## Clean-room notes
- Wrote own HTML/CSS/JS; did not copy compiled source. Brand logos re-drawn as colored letter-marks (S/N/G/H/L/31) instead of pasting the original SVG path data; icons are generic geometric glyphs.
- Pro `.tsx` not fetched or reproduced.

## What could not be verified
- Pixel-exact comparison to the original rendered App screen (no screenshots in workdir); spacing/colors matched from the compiled CSS text in `demo-original.js`.
- Real clipboard write in headless `node` (guarded try/catch; toast still fires).

## How to test
- Open `index.html` in a browser (no server needed). Walk 1→4, toggle tools, add invites, switch templates, Skip/Back, Create agent, Start over.
- Node only (per constraints, no browser install): `python3 -c` extract last inline `<script>` → `node --check`, then `node ./verify-harness.cjs`.

## Verification (node only)
- `node --check` on extracted inline JS: pass.
- `node ./verify-harness.cjs`: ALL CHECKS PASSED — asserts noflash guard + color-scheme meta, design tokens, v5 (`hover` media, tap-highlight, tabular-nums), zero `innerHTML`/`insertAdjacentHTML`/`document.write` statically and zero `innerHTML` writes at runtime, all VISIBLE demo strings painted, full-loop (0→1→2→3→0→…→4→0) node identity for title/bar/count/step-box, runtime step titles visible, light (`--page #fafaf9`) AND dark (`#101012`/`#1c1c1f`) themes with toggle switching `data-theme`.
- Checked light AND dark mode: tokens defined for both, badge/check contrast adjusted, no grey-on-grey.
