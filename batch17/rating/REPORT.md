# Rating — replica report

## What was built
- `index.html` (self-contained, ~19KB, no network, system fonts) replicating the affectUI `Rating` demo as a standalone page.
- Page: sticky topbar (`Rating` + `Research agent · 2,184 runs rated` + sun/moon toggle top-right), one demo card `Answer from Research agent` with:
  1. Answer block: 3×3 pixel-mark for `research`, `Research agent`, `2m`, verbatim answer text, ask row with live hint + thumbs (`sm`).
  2. `Rate this run` row: interactive stars (default `md`, value `4` → `Great`) + word label.
  3. Foot: read-only stars `4.5` (`sm`, halves) + `4.5 · 2,184 runs rated`.
- Clean-room code: own SVG star/thumb paths, own CSS (same class names `ui-rtg*` for parity), own JS. No verbatim copy of compiled source.

## Matched data / behaviour (verbatim from demo-original.js)
- Strings: `Research agent`, `2m`, `Three of the five competitors raised prices this quarter, by 8 to 15%. Linear and Height moved seats to annual billing only; the others kept monthly plans.`, `Was this helpful?` ↔ `Thanks – this helps the agent learn` (aria-live polite), `Rate this answer`, `Rate this run`, `Poor/Fair/Good/Great/Excellent`, `4.5`, `· 2,184 runs rated`, labels `Good response`/`Bad response`, `X out of 5`.
- Stars: max 5, `allowClear`, hover preview (mouse only, scale 1.12), click toggles same→null, Delete/Backspace clears, Home/End/Arrows with roving tabindex + focus move, pop stagger `(i-1)*40ms`, `aria-checked`/`radiogroup`.
- Thumbs: toggle same→null, Delete/Backspace/Arrows/Home/End, `data-on` + wash, pop rotate, hint swaps in place.
- Read-only: `round(v*2)/2`, fill `min(1,max(0,rounded-(i-1)))` → `1,1,1,1,0.5`, `role=img` `4.5 out of 5`.
- Pixel-mark: deterministic 3×3, EXACTLY 9 `<i>` cells, pattern `[1,1,1,0,1,0,1,0,1]` for `research` (computed from original hash).
- Design tokens: light `surface #ffffff/page #fafaf9/ink #171717/muted #78716c/subtle #f5f5f4/border #e7e5e4`, dark `surface #1c1c1f/page #101012/ink #ededed/muted #a1a1aa/subtle #26262a/border #2e2e33`, radii 16/10/6, shadow, amber preserved. Default theme = light (original demo appearance).
- Hard rules: `/*noflash*/` guard first in `<head>` + `html{background…}` + `meta color-scheme`; DOM built once at init, all ticks/clicks/hover update nodes in place, zero `innerHTML` (verified); `[hidden]{display:none!important}`; SVG classes only via `setAttribute`; no broad `svg{display:block}` override.

## What could not be verified
- Pixel-perfect screenshot vs original (no browser in this env); checked tokens/spacing/contrast manually in CSS.
- Real `prefers-color-scheme` media + touch `pointer:coarse` (stubbed as light/fine in harness); CSS includes both branches.

## How to test
- Open `index.html` in a browser. Click/hover stars, click thumbs, use keyboard (Arrows/Home/End/Delete), toggle ☾/◐ top-right, resize narrow, check dark mode.
- Node only (no browser/installs): `node ./verify.cjs` — extracts script, runs `node --check`, loads script in DOM stub, simulates full loop, asserts visible text + node identity + zero `innerHTML` writes, checks light AND dark.

## Verification results
- `node --check` on extracted script: PASS.
- `node ./verify.cjs`: ALL CHECKS PASSED (51 asserts) — size, no-network, noflash order, color-scheme, first-paint bg, toggle, `[hidden]`, light+dark tokens, 9-cell pixel-mark, 8 verbatim strings, no `innerHTML`, `setAttribute` classes, 5 stars / 2 thumbs / 5 readonly, halves, hover, toggle, keyboard, full-loop restore, zero `innerHTML` writes, theme light→dark→light with persistence. Light AND dark checked.
