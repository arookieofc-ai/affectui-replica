# Prompt Library — targeted fix report

## What was fixed (targeted, no rebuild)
`index.html` only — 2 CSS lines added, everything else identical.

### 1) Catastrophic layout collapse (~20px centred strip) — ROOT CAUSE + FIX
**Symptom (real-browser QA):** except header + theme toggle, all body content
squeezed into a ~20px vertical strip in the centre, text one char per line,
in light AND dark. Ctrl+0 / wait / refresh did not help. Clicking
“Summarize a meeting” changed DOM selection but nothing usable painted.

**Root cause — exact rule interaction:**
- `.stage{display:flex;justify-content:center}` creates a flex row.
- Intermediate `#app` had **no CSS at all** — default flex item
  `flex:0 1 auto; min-width:auto`, shrink-wrapped to content.
- Child `.ui-pli{width:100%;max-width:640px;min-width:0;container-type:inline-size}`:
  `container-type:inline-size` applies inline-size containment, so its
  intrinsic max/min-content contribution to the outer flex sizing is ~0.
- Result: `#app` shrink-wraps to padding (4px each side) + ~0 intrinsic
  → ~8–20px wide, centred by `justify-content:center`.
  `.ui-pli{width:100%}` then = 100% of collapsed `#app`.
  Container query `@container (max-width:540px)` then sees 20px < 540px,
  forcing single-column card — still 20px, one char per line with
  `overflow-wrap:anywhere`.

This is the known family: a flex wrapper rule silently beating the
component width rule, collapsing the grid/flex column. The beating rule is
`.stage{display:flex…}` + bare `#app`; the beaten rule is
`.ui-pli{width:100%;max-width:640px}`.

**Fix (in `index.html`, after `.stage`):**
```css
#app{width:100%;max-width:640px;min-width:0;display:flex;justify-content:center}
.ui-pli{flex:1;min-width:0}
```
- Gives `#app` a real width (fills `.stage`/`.page` up to 640px, shrinks on narrow),
  `display:flex` so child fills instead of shrink-wrapping.
- `flex:1;min-width:0` on `.ui-pli` makes it fill `#app` despite containment.
- Container is now ~640px → `@container` keeps
  `.ui-pli__card{grid-template-columns:220px minmax(0,1fr)}` 2-col layout.
- No other CSS touched; `container-type`, card grid, `[hidden]`,
  `/*noflash*/`, dark tokens unchanged.

### 2) Preview “forRelay2.4…” concatenation — CHECKED, NO DATA CHANGE
Checked `./demo-original.js`:
- Original bodies contain spaces: e.g.
  `Write release notes for {product} {version} for {audience}. Keep the tone {tone} …`
- Original interpolation `c=(e,t)=>e.replace(a,(e,n)=>t[n]?.trim()?t[n]:e)`
  preserves surrounding spaces.
- Replica `parseBody`/`assemble` already preserve those text nodes
  (`" "`, `" for "`, `" Keep the tone "`, …) and `prev` keeps them as
  separate text nodes. `assemble` output for
  Relay/2.4/existing customers/friendly is byte-identical with spaces.
- Demo data left verbatim; no trim/strip introduced.
- QA snippet was the visual fallout of the 20px collapse (wrapping +
  unreadable), not a data bug in this file. Harness asserts exact
  `Write release notes for Relay 2.4 for existing customers. Keep the tone friendly …`.

## Preserved invariants
- `/*noflash*/` guard + `html{background:#fafaf9}` /
  `html[data-theme="dark"]{background:#101012}` + `color-scheme` kept at head top.
- In-place updates only: `buildPanel` once, `syncPanelValues` updates
  text/attrs/styles; timer/hover/focus never call full `innerHTML` render.
- Zero `innerHTML` writes after init (grep + runtime counter = 0).
- Demo `TEMPLATES`/`DEMO` verbatim from prompt; tone map, timings unchanged.
- All `:hover` already inside `@media (hover:hover) and (pointer:fine)`.

## Verification (node only, in-dir, no installs)
- `node --check ./demo-original.js` → OK
- `node --check ./harness-fix.cjs` → OK
- `node ./harness-fix.cjs` → PASS:
  - CSS fix present, no bare `svg{…}`, card grid intact, dark rules present.
  - VISIBLE state (no `display:none`/`visibility:hidden`/`opacity:0`,
    correct `role`/`aria-selected`/classes) in **light AND dark**
    (themeBtn click toggles `data-theme`, `localStorage`).
  - Release preview `textContent ===` expected with spaces; no `forRelay`/`tonefriendly`.
  - Full-loop `meeting→release→error→email→meeting` keeps
    `root/card/side/main/list/foot` object identity.
  - `innerHTMLWrites === 0`.

## How to test in browser
Open `./index.html` in a browser:
1. Light loads with no white flash guard; toggle moon/sun → dark, no grey-on-grey.
2. Full-width card (~640px) centred, 220px list + preview side-by-side; narrow <540px stacks.
3. Search filters; arrows/Home/End + Enter/Space select; inputs fill, bars/count update, preview updates with spaces, Copy/Use work.
4. Demo auto-types Relay/2.4… then TypeScript… then design team… loops; hover/type stops demo.

## What could not be verified here
Real-browser pixel layout (only DOM-stub + CSS-rule assertions in node);
screen-reader / reduced-motion / coarse-pointer behaviour beyond code inspection.
