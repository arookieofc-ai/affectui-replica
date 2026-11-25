# guardrail-funnel — clean-room replica report

## What was built
`index.html` (52 KB, self-contained, no network, system fonts) replicating the
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
  500 ms cubic ease-out count-up; default selection `tool`; funnel geometry
  (40 px rows, 16 px bars, squared-share widths, taper connectors); pixel delays
  `[0,120,240,120,240,360,240,360,480]`; keyboard (arrows/Home/End/Enter/Esc on
  stages, arrows on ranges); empty-state strings; resolved-count rule
  (`allowed = 14 + resolved`).
- Nothing invented: channel split (46 % Slack / 38 % web / rest API) and
  delivered split follow the original's formulas.

## Interactions
Range switching, click/keyboard stage selection, allow/override actions,
live ticking counts, theme toggle. Tick updates are **targeted** (text/width
attribute writes only — row and panel nodes are never rebuilt on ticks), and
selection/actions listen on **pointerdown + mousedown capture**, so a real
mouse click cannot be lost across a re-render (no dialog in this component;
the same guarantee covers row selection and action buttons).

## Verification
- `node --check` on the extracted page script: **SYNTAX_OK**.
- `node harness.js` (DOM-stub harness kept in this directory: loads the page's
  own script, advances live + rAF timers, dispatches pointer/mouse/keyboard
  events): **ALL CHECKS PASSED (38/38)** — 6 stages, 9-cell pixel-mark,
  original counts per range, default tool selection, pointerdown/click
  selection, node stability across ticks, count-up animation settling, tick
  growth, `Allowed by you` resolution, delivered `15` count, keyboard nav,
  light→dark→light toggle (no double-toggle), funnel SVG bars.
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
  flow/surface **4.10** — all pass AA for text.
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
