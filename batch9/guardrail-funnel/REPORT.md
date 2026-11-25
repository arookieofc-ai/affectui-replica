# guardrail-funnel — clean-room replica report

## What was built
`index.html` (54 KB, self-contained, no network, system fonts) replicating the
affectUI `guardrail-funnel` component: a funnel of requests passing through six
guardrail stages with pass/block counts, an SVG funnel visualization, and an
inspection panel showing exactly what each check caught.

Layout matches the original: header bar (title **Guardrails** + agent chip with
deterministic 3x3 pixel-mark for **Support agent** + green **Live** dot + `1h /
24h / 7d` segmented range control), six stage rows (icon, label, meta line,
pass count, % of all requests), a center funnel of tapered SVG bars with sheen
sweep, and a bottom panel (max 3 items) with masked-hit highlighting, rule +
age meta, brand-logo tiles for tool calls, and `Allow once` / `Override`
action buttons that resolve to `Allowed by you` / `Sent by you`.

## Visual-QA fixes (2026-11-25, worst-of-batch FAIL → fixed)
1. **Funnel rows overlapped** (Requests / Input check / PII redacted shared one
   row height). Root cause: `.ui-gdf__stages` had no explicit tracks, so the
   `subgrid` list/funnel collapsed. Fixed by mirroring the original's inline
   `gridTemplateRows: repeat(k.length, 40px)`: CSS default
   `grid-template-rows:repeat(6,40px)` **plus** JS
   `stagesBox.style.gridTemplateRows = "repeat(n, 40px)"` on every rebuild,
   and fixed row height `height:40px`. Each stage now owns one 40px track.
2. **Detail panel showed funnel bars through it.** Root cause: collapsed rows
   made the 240px SVG overflow into the panel, and the panel had no stacking.
   Fixed: `.ui-gdf__stages{z-index:1}`, `.ui-gdf__funnel{z-index:0;
   overflow:hidden}`, `.ui-gdf__svg{overflow:hidden}`,
   `.ui-gdf__panel{position:relative; z-index:2; isolation:isolate;
   background:var(--card)}` (opaque, above the funnel).
3. **Off-by-one numbers** (option `18,274` vs body `18,273`; `818` vs `817`).
   Root cause: live ticks animated the row count over 500ms while the
   `aria-label`, `%`, and delivered/request part values jumped instantly to the
   final value, so any mid-animation screenshot showed a 1–4 drift. Fixed by
   making live ticks **atomic + instant** (`tick()` → `tickUpdate(false)`:
   count, aria-label, pct, meta, parts, and bar widths all set from the same
   snapshot), and by keeping pct/aria in sync per-frame during range-switch
   count-up (`animateNum(..., onFrame)`). `setRange` now preserves the
   pre-switch displayed values so the 500ms ease runs old→new instead of
   jumping. Verified: label == body after ticks, `1h = 806`, `24h = 18,240`,
   `7d = 121,480`, delivered parts sum to the delivered total.
4. **Stage clicks lost to 1–2s live refresh.** Already hardened and kept:
   selection listens on **pointerdown + mousedown capture** (plus click for
   keyboard/focus), tick updates touch only text/width attributes and never
   rebuild row/panel nodes, so a press cannot be lost to a re-render.
5. **Light flow blue `#0284c7` (4.10:1) legibility.** Darkened to **`#0369a1`
   (5.93:1 on white)** for `--flow` and `--tone-blue`; dark theme keeps
   `#38bdf8` (7.94:1). Green `#16a34a` stays decorative-only (bars, dot,
   check icon — never body text).

## Original data used (from demo-original.js, rewritten code)
- Ranges and exact counts: `1h {806,71,128,39,22}`, `24h {18240,1604,2931,912,488}`,
  `7d {121480,10212,19804,6118,3301}` (requests, input, pii, tool, output).
- Stage labels/hints/verbs: Requests/By channel; Input check/Prompt injection,
  jailbreak; PII redacted/Cards, emails, phone numbers (`redacted`); Tool call
  allowed/Allowlist, limits, scopes (`denied`); Output check/Leaks, policy,
  links (`rejected`); Delivered/How it got through.
- All 12 examples verbatim (texts, match spans, mask replacements, rules,
  ages, code flags, actions): prompt-injection/Jailbreak/injected system tag;
  card/email/phone redactions; Stripe/SQL/Gmail tool calls; system-prompt leak,
  €1,240 promise, allowlist link.
- Behaviours/timings: 1400 ms live tick with binomial-distributed block growth;
  500 ms cubic ease-out count-up (range switches); default selection `tool`;
  funnel geometry (40 px rows, 16 px bars, squared-share widths, taper
  connectors); pixel delays `[0,120,240,120,240,360,240,360,480]`; keyboard
  (arrows/Home/End/Enter/Esc on stages, arrows on ranges); empty-state strings;
  resolved-count rule (`allowed = 14 + resolved`).
- Nothing invented: channel split (46 % Slack / 38 % web / rest API) and
  delivered split follow the original's formulas.
- Geometry source: original sets `gridTemplateRows: repeat(k.length, 40px)` on
  `.ui-gdf__stages` with `_/ROW_H=40`, `v/BAR_H=16`, `y=48`, `b/MAX=3`.

## Interactions
Range switching, click/keyboard stage selection, allow/override actions,
live ticking counts, theme toggle. Tick updates are **targeted and atomic**
(text/width attribute writes only — row and panel nodes are never rebuilt on
ticks), and selection/actions listen on **pointerdown + mousedown capture**,
so a real mouse press cannot be lost across a re-render (no dialog in this
component; the same guarantee covers row selection and action buttons).

## Verification
- `node --check` on the extracted page script: **SYNTAX_OK**.
- `node harness.js` (DOM-stub harness kept in this directory: loads the page's
  own script, advances live + rAF timers, dispatches pointer/mouse/keyboard
  events): **ALL CHECKS PASSED (53/53)** — 6 stages, 9-cell pixel-mark,
  original counts per range, default tool selection, pointerdown/click/
  mousedown selection, node stability across ticks, count-up animation
  settling, tick growth, `Allowed by you` resolution, delivered `15` count,
  range switching, keyboard nav, light→dark→light toggle (no double-toggle),
  funnel SVG bars, **plus 15 visual-QA regressions**: explicit 6×40px tracks
  (CSS + inline), fixed 40px rows, panel opaque + z-index above funnel, clipped
  SVG, 7d/1h exact counts with aria in sync, tick atomicity, delivered
  parts-sum, mousedown capture + survival across ticks, flow-blue ≥4.5:1.
- 3x3 pixel-mark markup contains exactly **9 `<i>` cells** (asserted).

## Token audit
All colours come from CSS custom properties (`:root` + `html[data-theme="dark"]`
overrides): `--surface/--page/--ink/--ink-2/--muted/--subtle/--border`,
`--radius-lg/--radius/--radius-sm`, `--shadow`, status (`--flow/--live/
--amber*/--fail/--focus`), per-tone `--tone-*` (gray/blue/pink/red/purple/
orange/amber/green/teal). No hard-coded hex in element styles; dark theme
re-maps the same tokens. Amber in dark uses `#fbbf24` on `#451a03`.

## Contrast results (computed luminance ratios)
- Light: ink/surface **17.93**, muted/surface **4.80**, amber-text/bg **6.37**,
  flow/surface **5.93** (`#0369a1`, was 4.10) — all pass AA for text.
- Dark: ink/surface **14.52**, muted/surface **6.63**, amber-text/bg **12.03**,
  flow/surface **7.94** — all pass.
- Green `#16a34a` on white is **3.30:1** — used only for the decorative
  13 px resolved check icon (aria-hidden), live dot, and bar fills, never for
  body text (passes non-text 3:1; adjacent text is muted at 4.80:1).

## How to test
Open `index.html` in a browser (toggle the Dark/Light button top-right to
check both themes), or run `node harness.js` in this directory.

## What could not be verified
Pixel-perfect match against the proprietary rendered screenshot (no screenshot
available in this environment); reduced-motion path and sub-420 px container
query behaviour were implemented from the original CSS but only code-reviewed,
not visually inspected.
