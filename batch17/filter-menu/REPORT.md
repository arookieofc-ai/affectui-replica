# Filter Menu — targeted checkbox paint fix

## Defect (real-browser QA)
- Light: UNCHECKED boxes (New lead, Proposal sent, Negotiation) painted a grey checkmark inside, looking checked; only Qualified distinguished by black fill.
- Dark: inverted — CHECKED Qualified painted as empty white box with no check; unchecked painted dark with a check.
- After clicking New lead (DOM checked, chip appears, 2 filters), its box in dark still painted as empty white box.

## Root cause
Compared ./index.html against ./demo-original.js original CSS.

Original (demo-original.js) checkbox semantics:
- `.ui-fm__box svg { stroke: var(--ui-fm-check); stroke-dasharray: 20; stroke-dashoffset: 20; }`
- `.ui-fm__option[aria-checked="true"] .ui-fm__box svg { stroke-dashoffset: 0; }`
- `.ui-fm__option[aria-checked="true"] .ui-fm__box { background: var(--aui-primary, var(--ui-fm-ink)); }`
- Unchecked = subtle box fill + check hidden via dashoffset (no check drawn). Checked = accent/ink fill + dashoffset 0 (visible check).
- Light: check `#ffffff` on accent `#171717`; Dark: check `#121213` on accent `#ededed`.

Replica bug in ./index.html (before fix):
1. `.fm-check{width:14px;height:14px;display:block}` — no stroke color, no dash hiding. JS sets `stroke="currentColor"` on the svg, so check inherited `.fm-option` text color (`--ink-soft`: `#404040` light / `#c4c4c4` dark) and was ALWAYS rendered.
   - Light: unchecked grey box + grey check visible (looks checked); checked black box + grey check (only fill distinguishes).
   - Dark: unchecked dark box + light-grey check visible; checked light box (`#ededed`) + light-grey check invisible (empty white box). Matches QA exactly.
2. Missing checked reveal rule: only `.fm-option[aria-checked="true"] .fm-box{background:var(--accent)}` existed; no `.fm-check{stroke-dashoffset:0}` counterpart.
3. No theme-dependent fill inversion — tokens `--box`/`--accent`/`--check-ink` were correct; the inversion symptom came from (1)+(2), not a dark CSS override.

Not a behavior difference in demo-original.js — original hides unchecked checks by design. Fix aligns replica to original; no REPORT note of intentional divergence needed.

## Fix (targeted, ./index.html only, CSS)
- `.fm-check{...;fill:none;stroke:var(--check-ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:20;stroke-dashoffset:20;transition:stroke-dashoffset 260ms cubic-bezier(.22,1,.36,1)}`
- Added: `.fm-option[aria-checked="true"] .fm-check{stroke-dashoffset:0}`
- Added `.fm-check` to `@media (prefers-reduced-motion:reduce){...transition:none}` to match original.
- CSS `stroke:var(--check-ink)` overrides the JS `stroke="currentColor"` presentation attribute (CSS wins), so no JS change needed; kept everything else identical.
- Result: checked = filled/accent box (`--accent`) with visible check (`--check-ink`); unchecked = empty box (`--box`) with NO checkmark drawn (dashoffset 20). Light: black fill + white check. Dark: light fill `#ededed` + dark check `#121213`.

Kept identical: /*noflash*/ guard + inline bg + meta color-scheme, in-place updates only (refreshChips/refreshGroups mutate existing nodes), zero innerHTML writes after init (source count 0, runtime stub count 0), demo data verbatim (Stage/Deal size/Region, New lead/Qualified/...), all other CSS/JS.

## Verification (node only, in-dir)
- `node --check ./harness-checkbox-fix.cjs` → OK
- Extracted main FM script to `./_fm-extract.js` → `node --check` OK (then removed via node unlink, no /tmp use).
- `node ./harness-checkbox-fix.cjs` → ALL CHECKS PASSED:
  - noflash present, 0 innerHTML in source, demo strings verbatim
  - unchecked hidden (dashoffset 20, stroke check-ink), checked visible (dashoffset 0), box accent fill
  - no display:none/visibility:hidden/opacity:0 on checkbox visuals
  - light tokens box #f0f0f0/accent #171717/check #ffffff; dark box #2a2a2d/accent #ededed/check #121213
  - original demo-original.js dash semantics confirmed
  - light + dark runtime: initial Qualified true/others false; after toggle New lead → aria-checked true, chip New lead, 2 stage filters, paints filled+visible
  - full-loop toggle sequence restores Qualified-only and preserves node identity (option buttons, groups, chips, card same objects)
  - zero innerHTML writes after init (stub counter).

## How to test
- Open ./index.html in a browser, toggle theme (top-right Light/Dark). Stage group: Qualified checked initially.
- Light: Qualified = black box + white check; others = light-grey empty boxes, no check.
- Dark: Qualified = light box + dark check; others = dark empty boxes, no check.
- Click New lead → becomes checked with chip + '2 filters', paints filled + visible check in both themes.
- Or run: `node --check ./harness-checkbox-fix.cjs && node ./harness-checkbox-fix.cjs` in this directory.

## Not verified in real browser
- Real-browser pixel paint (could not screenshot here); relied on CSS rule + DOM-stub derivation + token contrast. Recommend 30s visual pass in Chrome light/dark per QA steps.

Light AND dark: checked above (tokens + stub runtime both themes).
