# Checkbox — replica report

## What was built
- `index.html` (15.4 KB, self-contained, no network, system fonts only).
- Clean-room vanilla HTML/CSS/JS replicating the `demo-original.js` Checkbox demo: label + description, indeterminate parent, error row, and card variant.
- DOM is built once at init via `createElement` / `createElementNS`; all later state changes update existing nodes in place (`checked`, `indeterminate`, `data-checked`, `data-ind`, `data-invalid`, `textContent`, `hidden`). No `innerHTML` anywhere in the page script.
- SVG tick/dash use `setAttribute("class", …)` only, never `.className` on SVG.
- `[hidden]{display:none!important}` rule included. No dialogs, so no pointerdown-capture dialog logic beyond a harmless capture no-op on rows; hover/focus are CSS-only and never re-render.
- Design tokens as CSS custom properties for every colour; light defaults match the original (`--surface #ffffff`, `--page #fafaf9`, ink/muted/subtle/border, radii 16/10/6, soft shadow). Dark theme via `html[data-theme="dark"]` (`#1c1c1f / #101012 / #ededed / #a1a1aa / #26262a / #2e2e33`).
- `/*noflash*/` guard is the first script in `<head>`, reading `localStorage("chk-theme")` else `prefers-color-scheme`, setting `data-theme` before paint, plus inline `html{background…}` and `<meta name="color-scheme" content="light dark">`. Default (no stored pref, light media) is light, matching the original demo appearance. Visible sun/moon toggle top-right switches `data-theme` and persists.

## Matched data / behaviour (verbatim from demo-original.js)
- Group legend `Email me about`; parent `Everything` with `checked=all && indeterminate=some`.
- Children verbatim: `Mentions` / `Someone mentions you in a chat or a file`; `Approvals` / `An agent waits for your OK before it acts`; `Weekly summary` (no description).
- Initial `selected=["mentions"]`, `keepCopy=true`, `agreed=false`.
- Parent click toggles all/none; child toggles add/remove; card `Keep a copy of every run` / `Inputs and outputs stay for 30 days, so you can replay a run.`; terms `I agree to the terms of service` with error `Agree to the terms to continue.` shown when unchecked (`aria-live="polite"`, `aria-invalid`), hidden when checked.
- Check draw/dash animations, card hover/checked wash, focus-visible outline, touch-size media query, reduced-motion handling.

## Not applicable / not verified in browser
- v3 agent-chrome (project + working/agent counts, token bar `44k / 200k`, 3×3 pixel-marks, tool icons, sub-agent cards) does not exist in the Checkbox original, so no pixel-marks were added (requirement is conditional on agent identities).
- No timers/loop in the original; “full loop” was verified as a full interaction loop (select-all → clear → child toggle → agree/unagree → card toggle → theme toggle).
- No real browser available per instructions; verified with node only. Open `index.html` in a browser and click through the checkboxes + theme toggle to confirm visually.

## How to test
- Open `index.html` in a browser (double-click). Toggle `Everything`, each child, the card row, and the terms box; confirm indeterminate and error behaviour. Use the top-right pill to switch light/dark.
- Re-run headless checks: `node ./harness-check.js` and `node --check ./.page-script.check.js` (harness rewrites the extracted script).

## Verification results
- `node --check` on extracted page script: OK.
- `node ./harness-check.js`: 70 passed, 0 failed. Covers: noflash/meta/tokens, all 11 verbatim strings present, zero `innerHTML`, SVG `setAttribute`, script executes, initial state (`['mentions']`, indeterminate, card on, terms error visible), VISIBLE `textContent` (not aria-only) for all strings, full interaction loop, theme light→dark→light with label update, zero `innerHTML` writes after init, node identity (`===`) preserved across the loop.
- Light AND dark checked: static token checks for both palettes plus live toggle to dark (label flips to “Light”) and back to light in the stub.
