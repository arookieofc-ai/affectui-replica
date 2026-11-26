# REPORT — Number Input

## What built
ONE self-contained `index.html` (23.8 KB, no network, system fonts) replicating the
`Number Input` demo as clean-room code. No compiled source copied; styles and JS
rewritten from observed behaviour.

Layout: page header + card with 4 number fields in the exact demo structure:
- `Max tokens per run` — unit `tokens`, value `32000`, min `1000`, max `200000`,
  step `1000`, locale `en-US`, hint `The answer stops here – Page Up adds 10,000.`
- `Budget per run` — prefix `$`, value `25`, min `0`, max `100`, step `5`,
  locale `en-US`, format `{minimumFractionDigits:2, maximumFractionDigits:2}`,
  dynamic hint `No limit – runs until done.` when null else
  `Your plan allows up to $100.`
- Row: `Parallel agents` — defaultValue `3`, min `1`, max `8`, hint `Up to 8`
- Row: `Temperature` — defaultValue `0.7`, min `0`, max `2`, step `0.1`,
  locale `en-US`, format `{minimumFractionDigits:1, maximumFractionDigits:1}`,
  hint `0 to 2`

Behaviour matched: en-US grouping (`32,000`, `25.00`, `0.7`), auto-width input so
unit follows value, prefix/affix quiet text, −/+ steppers with limit disabling
(`aria-disabled`), hold-to-repeat (400 ms then 120 ms decaying to 40 ms, stops at
limits), `ArrowUp/Down` step, `PageUp/PageDown` large step (`step*10`, so 10,000 /
50), `Home/End` min/max, `Enter` commit, `Esc` revert draft, blur commit with
clamp + float tidy, `$,()`/negative parsing, box click focuses input, reduced-motion
respected, `role="spinbutton"` + `aria-valuenow/min/max/text/describedby`.

Chrome: header `Run configuration / Number Input · 4 fields · 2 controlled ·
steppers live` with `en-US · min/max · keyboard` pill (no agent identities in this
component, so no 3×3 pixel-marks — correctly omitted per spec conditional).
Design tokens via CSS vars for every colour; light default matches original demo
(white surface, `#fafaf9` page); dark via same tokens. Visible sun/moon toggle
top-right switching `data-theme` on `<html>` + `localStorage("affectui-theme")`.

Hard-won rules: DOM built once (static markup); timers/handlers only update
changed nodes (`value`, `style.width`, `aria-*`, `textContent`); zero `innerHTML`
in page script; hover/focus are CSS-only (`:hover`, `:has(:focus)`); explicit
`[hidden]{display:none!important}`; SVG classes only in markup / `setAttribute`;
no broad `svg{display:block}` hiding bug (step icons scoped, hidden rule wins).

`/*noflash*/` guard is first in `<head>`: reads stored theme else
`prefers-color-scheme` before paint + `html{background}` inline + 
`<meta name="color-scheme" content="light dark">`.

## Verification
- `node --check` on both inline scripts: PASS.
- In-dir harness `verify-harness.js` (stub DOM, no installs): loads page script,
  advances manual timers through full loop, asserts VISIBLE `textContent`/`value`
  (not aria-only), state, limits, dynamic hint, repeat, revert, node identity
  (`===` across loop), zero `innerHTML` writes after init, theme toggle
  light→dark→light in place. ALL PASSED — light AND dark exercised.
- Open `index.html` in a browser to test manually; responsive row stacks <560 px.
