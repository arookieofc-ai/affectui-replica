# REPORT — Agent Team (slug: agent-team)

## What was built
Single self-contained `index.html` (~19KB, inline CSS + JS, no external deps) replicating the
affectUI "Agent Team" item: a self-typing prompt pill ("Build a team to work my inbound pipeline")
that sends (blue arrow button press), reveals three dashed branch lines top-to-bottom, and pops in
three agents with roles and overlapping circular tool logos. The loop then holds, fades, and restarts.
Page wrapper: project header ("Inbound Pipeline — Agent Team"), live status pill
(Typing → Prompt sent → Team of 3 working → Resetting), loop counter, theme toggle, replay button,
`R` keyboard shortcut.

## Demo data (verbatim from demo-original.js)
- Prompt: `Build a team to work my inbound pipeline`
- Timings: type 22ms/char, start 500ms, sent pause 420ms, line reveal 700ms (team at +385ms = 700×0.55), hold 2600ms, gap 600ms, reset at sent+700+480+500
- Lines (600×400 grid): `M300 110C300 162 102 152 102 196`, `M300 110V196`, `M300 110C300 162 498 152 498 196`; agents at x = 102 / 300 / 498
- Members: Lead Researcher (linkedin, hubspot) · Inbound Qualifier (hubspot, slack) · Outbound SDR (gmail, salesforce); max 2 tools each, second circle overlaps the first
- Reduced-motion: shows full prompt + team immediately

## What matches the original
Layout (3:2 stage, prompt pill top-center, halo pink→violet, dashed connectors, 84u avatar nodes +
online dot + role pills), transition curves/delays (pop 160ms stagger, dot +360ms), accent `#2f6bff`,
online green, dash gray, halo colors, dark-mode surface/ring/shadow adjustments, aria-label with
prompt + role list.

## Deliberate clean-room deviations
- Avatars: gradient initial discs (L/T/N) instead of `/avatars/*.jpg` photos (no image assets in scope).
- Tool glyphs: simplified clean-room badges (brand-color circles + white letter: `in/H/#/M/S`)
  instead of tracing the original vendors' SVG path data.
- Status pill / header / replay button are page chrome around the replica, not part of the demo chunk.

## Spec compliance
- v4: `<head>` starts with the `/*noflash*/` theme guard + `html{background…}` paint guard +
  `color-scheme` meta; DOM built once at init, timers only mutate `textContent`/attributes/styles in
  place; harness asserts node identity across a full loop and zero `innerHTML` writes after init
  (page script contains no `innerHTML` at all).
- v5: all `:hover` inside `@media (hover: hover) and (pointer: fine)`, tap-highlight transparent,
  `tabular-nums` on body, pill radii concentric, shadows for elevation / borders for structure,
  inset outline on avatar discs, send arrow optically nudged (left padding 2px).
- Tokens used for every color; radius 16/10/6, pills 999px, base 14px system stack.

## Verification (node only, no browser)
- `node --check harness.js` — passes
- `node harness.js` — ALL CHECKS PASSED: noflash/meta/tokens, verbatim prompt + roles + tools +
  timing constants, inline-script syntax via `vm.Script`, 3 agent nodes, VISIBLE painted typed text
  (40 chars exact) + all roles + 2 tools/agent, team phase + pill text, loop restart (Loop 2),
  node identity across full loop, zero post-init `innerHTML`, light tokens + dark tokens, theme
  toggle light→dark→light via stub.
- Light AND dark mode: checked — token sets asserted in CSS and toggle behavior asserted in stub;
  page visually structured to be finished in both (dark uses #101012/#1c1c1f/#ededed, amber pill
  adjusted to dark).

## How to test
Open `index.html` in a browser. Watch: typing → send press → lines draw → 3 agents pop with dots →
hold → fade → loop. Click sun/moon toggle for dark mode; press `R` or Replay to restart.
