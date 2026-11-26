# Separator — replica report

## What was built
ONE self-contained `index.html` (~14.5KB, no network, system fonts) replicating the
`Separator` primitive demo as a classic **Run history** card.

- `Separator` factory mirrors the observed behaviour exactly: `orientation`
  `horizontal | vertical`, `decorative` flag, optional `label`; labelled only when
  horizontal with a non-empty label; decorative+labelled renders no role,
  decorative+plain renders `role="none"`, semantic renders `role="separator"` with
  `aria-orientation="vertical"` (vertical only) and `aria-label` (string/number labels).
- Structure matches `demo-original.js`: card `aria-label="Run history"`, head with
  `Run history` + stats (`12 runs` | `1 failed` | `41 min` joined by two vertical
  separators), one plain horizontal separator, then two groups (`Today`, `Earlier`)
  each with a semantic labelled separator and a run list.
- Clean-room CSS written from observed behaviour (1px `border-top` horizontal line,
  18px `border-inline-start` vertical line, labelled `flex` row with `gap: 12px`,
  12.5px/18px label, `forced-colors: CanvasText` fallback, dark override via
  `[data-theme="dark"]` ancestor). No verbatim copy of the compiled source.

## Matched data / behaviour
All demo strings used verbatim, never invented:
- `Run history`, `12 runs`, `1 failed`, `41 min`
- `Today`: `Sync invoices to billing-api` / `14:02 · 3m 12s`,
  `Draft replies for 14 tickets` / `11:40 · 58s`
- `Earlier`: `Weekly usage report` / `Mon · 4m 05s`,
  `Migrate webhooks to v2` / `Sun · failed`
- No timers/loop exist in the original (static demo); the replica is likewise
  static apart from the theme toggle and a Variants `decorative` toggle that flips
  the two labelled dividers between `role="separator"` and no-role **in place**.
- Dialog/popover rule: n/a (no dialogs); the Variants toggle uses capture-phase
  `pointerdown` so it survives focus/hover handlers. Hover/focus never re-render.
- `[hidden]{display:none}` rule included. No SVG used, so no SVG-class issue.

## Spec compliance
- Design tokens as CSS custom properties; light tokens
  (`#ffffff/#fafaf9/#171717/#78716c/#f5f5f4/#e7e5e4`) and dark tokens
  (`#1c1c1f/#101012/#ededed/#a1a1aa/#26262a/#2e2e33`), amber adjusted for dark.
- Visible sun/moon toggle switching `data-theme` on `<html>` + persistence
  (`separator-theme`); default is the original demo appearance (**light**), system
  `prefers-color-scheme` respected when no stored choice.
- `/*noflash*/` guard first in `<head>` + `html{background}` inline style +
  `<meta name="color-scheme" content="light dark">`.
- IN-PLACE ONLY: DOM built once at init via `createElement`/`appendChild`;
  theme/decorative updates mutate attributes/text of existing nodes; **zero**
  `innerHTML` uses in the page script.
- Agent-specific patterns (3×3 pixel-marks, token-count bar, tool icons) correctly
  omitted: this component has no agent identities (harness asserts zero pixel-marks).

## Verification (node only, no browser)
- `node --check` on both extracted inline scripts (guard + main): pass.
- In-dir stub harness `verify-harness.js` (no deps, `/tmp` untouched): **73 passed, 0 failed**.
  It runs the page script in a stub DOM, advances all timers through a full loop,
  asserts every verbatim string is VISIBLE (stub `textContent`, not markup grep),
  checks labelled separators are `role=separator` and verticals are `role=none`,
  flips light→dark→light asserting visible text persists in both themes, and asserts
  card/row/separator nodes keep object identity with zero new nodes and
  zero `innerHTML` writes after init.
- Checked light AND dark: `data-theme` light and dark both render all 14 verbatim
  strings; contrast uses the spec token pairs in each theme.

## How to test
Open `index.html` in a browser. Toggle the moon/sun button top-right for dark/light.
In Variants, press `Decorative` to flip divider semantics in place. Narrow the window
below ~520px to see the stacked responsive layout. Run `node verify-harness.js` here
to re-run the checks.
