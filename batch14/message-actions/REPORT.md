# Message Actions replica — targeted dark pager fix

## What was built
Single-file `index.html` replica of affectUI `message-actions` (quiet bar under AI messages: Copy, Regenerate + version pager `< 2/2 >`, Good/Bad feedback + reason chips + Send, Read-aloud). Auto-demo replays `copy → down → chip → send → regen → prev → next → reset` with the exact original timings and demo data. Light/dark via `data-theme` on `<html>` with `/*noflash*/` guard.

## Root cause (real-browser QA defect)
Symptom: in dark, auto-demo never painted `< 2/2 >` although DOM contained `Version 2 of 2`; light auto-demo painted (~10s); manual Regenerate click painted in both; light→dark toggle with pager visible made it vanish while DOM kept it.

Comparison:
- Click path: `Regenerate.click()` → `doRegenerate()` → after 1000ms `S.versions++` → `refreshVote() + refreshPanel() + refreshVersions()` → `versionsWrap.setAttribute('data-open','')` + `removeAttribute('inert')` + counts to `2/2` + `aria-label="Version 2 of 2"`. CSS `.ui-ma__versions[data-open]{1fr;opacity:1;visibility:visible}` paints it.
- Demo path in dark: `fireStep('regen')` → same `click()` → same `refreshVersions()`, so DOM correctly reached `2/2` + `data-open`, but there was no explicit `html[data-theme="dark"] .ui-ma__versions[data-open]` painted-state override. The hidden base `.ui-ma__versions{0fr;opacity:0;visibility:hidden}` was re-applied on theme evaluation, and the toggle handler set `data-theme` without re-asserting the pager, so a style recalc un-painted the pager in dark (auto-demo with no hover/focus never forced a repaint; manual click forced one via focus/active, which is why clicks worked in both themes).
- In short: DOM state was correct (`data-open` + `Version 2 of 2`), painted state was not guaranteed in dark.

## Fix (in-place, no rebuild)
- CSS: added explicit `html[data-theme="dark"] .ui-ma__versions[data-open]{grid-template-columns:1fr;opacity:1;visibility:visible}` right after the generic `[data-open]` rule, so dark paints identically to light and a toggle can never re-apply the hidden base when open.
- JS: `refreshVersions()` documented as the single theme-independent owner of pager painted state (both click and auto-demo regen end there; `setAnswer()`/`gotoVersion()` only change numerals, never visibility). Toggle handler now re-asserts `data-open` + removes `inert` when `S.versions>1`, preserving the current version across light↔dark without jumping to newest.
- No DOM rebuild, no `innerHTML`, same node objects throughout loop.

## Preserved
- `/*noflash*/` guard + `html{background}` + `meta color-scheme` untouched (first in `<head>`).
- In-place updates only; zero `innerHTML` writes after init (verified statically + stub counter).
- Demo data verbatim from `demo-original.js`: 3 VERSIONS strings, 4 REASONS, LOOP timings `[[700,copy],[1000,down],[700,chip],[900,send],[2600,regen],[2800,prev],[2000,next],[3000,reset]]`.

## How to test
- `node --check ./harness.js && node ./harness.js` (in this dir, no installs). Harness stubs DOM, runs `data-theme=dark` from start for auto-demo vs Regenerate-click equivalence, repeats for light, plus light→dark→light toggle preservation, full-loop identity, zero innerHTML.
- Extracted main JS: `node --check ./extracted-main.js` (extracted from `index.html`).
- Browser: open `index.html`, watch auto-demo paint `< 2/2 >` in light and dark (dark from start via toggle or `prefers-color-scheme`), click Regenerate manually in both, toggle light→dark with pager visible — it must stay painted.

## Verification
- `index.html` 32851 bytes (<200KB), `noflash` present, `innerHTML` count 0.
- Harness: light auto vs click identical VISIBLE (`data-open` present, no `inert`, `Version 2 of 2`); dark auto vs click identical VISIBLE; toggle preserves VISIBLE; node identity preserved; zero innerHTML — all PASS in this dir with node only.
- Checked light AND dark.
