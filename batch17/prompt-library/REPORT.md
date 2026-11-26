# Prompt Library — replica report

## What built
`index.html` (39,278 bytes, self-contained, no network, system fonts) replicating the
**Prompt Library** component: saved prompt templates with variables, assembling the
finished prompt below. Clean-room code from observed behaviour — no compiled source copied.
Class names (`ui-pli__*`) kept for behavioural parity; all CSS/JS written fresh.

Layout: tray + card (`220px | 1fr`, stacks under 540px container), left side
(`Prompts` title + total count, search, listbox with glide highlight), right panel
(title + category tag + `N of M filled` bars, body with inline token inputs, `Preview`
label + live preview region), footer (token caption, Copy, Use prompt), polite live region.

## Matched data / behaviour (verbatim from demo-original.js)
- Templates verbatim: `meeting`/`Summarize a meeting`/`Notes`,
  `release`/`Write release notes`/`Product`, `error`/`Explain an error`/`Debug`,
  `email`/`Draft a cold email`/`Sales`, with exact bodies and variable descriptions /
  defaults (`150 words`, `friendly`, `120 words`).
- Category tones by first-appearance order: Notes→blue, Product→violet,
  Debug→amber, Sales→green.
- Demo loop verbatim: start `meeting`, cycle `release → error → meeting`;
  select delay `t===0?700:900`; first-char delay `2500` (first var, first cycle) else `520`;
  subsequent `55+o*37%40`; typed values `Relay`, `2.4`, `existing customers`,
  `TypeScript`, `Cannot read properties of undefined`, `Next.js`,
  `the design team`, `the onboarding flow`; `3600ms` hold; stops on
  pointerenter / pointerdown-capture / keydown-capture / focus-capture.
- Interactions: search filter (`No templates match` / `No templates yet`), listbox
  ArrowUp/Down/Home/End, Escape clears, ArrowDown from search focuses list,
  Enter in token jumps to next empty or fires Use; token estimate `max(1,round(len/4))`
  animated 420ms easeOutQuart via rAF in place; flash `a/b` on edit; pulse `a/b`
  on newly-complete + `All variables filled`; Copy → `Copied to clipboard` /
  `Prompt copied`; Use (only when complete) → `Prompt sent` / `{title} used`;
  hint caption `{var} · {desc|filled|fill this in}`; `Fill N more to use` on Use hover.
- No agent identities in this component, so no pixel-marks (spec: only if present).

## Hard-won rules applied
- DOM built once at init; timers/rAF update only changed nodes in place
  (sizer/input value, preview fills, bars, caption, token count). Zero `innerHTML`
  writes anywhere (verified by grep + runtime counter).
- Hover/focus handlers call only `refreshCaption()` — never rebuild.
- Option has a `pointerdown` capture listener so real clicks survive; no dialogs/popovers.
- `[hidden]{display:none !important}` explicit; no broad `.ui-pli svg` rule
  (scoped to search/copy/use icons only) so hide rules can't be beaten.
- SVG built with `createElementNS` + `setAttribute` only; no `.className` assignment.
- `/*noflash*/` guard first in `<head>` + `html{background}` paint block +
  `<meta name="color-scheme">`; theme key `ui-pli-theme`; default `light`
  (the original demo's light appearance); visible sun/moon toggle top-right.

## How to test
Open `index.html` in a browser. Watch the auto-type demo (stops when you interact).
Try search, keyboard nav, editing tokens, Copy, Use (disabled until complete).
Toggle the sun/moon button for dark mode.

## Verification (node only, no browser)
- `node --check` on extracted component script: OK.
- In-dir stub harness `./harness.js` (fake DOM, virtual timers, `innerHTML` write
  counter): init OK; `Relay` visible after first typing burst; preview shows assembled
  prompt (`Relay` / `TypeScript` / `design team`); caption shows `~N tokens` state;
  all 4 option titles + `Prompts`/`Preview`/`Copy`/`Use prompt` visible (not aria-only);
  caption/list node identity preserved across full 3-template loop; zero `innerHTML`
  writes; dark tokens present; toggle switches light→dark→light.
- Result: `ALL CHECKS PASSED`. Light and dark both checked (static tokens + live toggle).
