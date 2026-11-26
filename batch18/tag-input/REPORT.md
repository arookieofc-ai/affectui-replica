# REPORT — Tag Input replica

## What was built
- `index.html` (21.5 KB, self-contained, system fonts only, no network) replicates the affectUI `Tag Input` chip field demo as observed in `demo-original.js`.
- Clean-room code: own HTML/CSS/JS, same look/behaviour. No verbatim copy of the compiled source; no `innerHTML` anywhere in the page.
- Page chrome: sticky top bar with `Acme · Tag Input` + live `N tags · 2 fields` count (project-name + counts pattern) and a visible sun/moon theme toggle (top-right).
- Demo card with the exact two fields from the original:
  1. `Invite people` — `["maya@acme.com","jonas@acme.com"]`, placeholder `name@company.com`, avatar on, `splitOnSpace`, `max=10`, normalize `trim().toLowerCase()`, email validate, hint `Paste a whole list – commas, spaces or new lines.`
  2. `Labels` — `["Onboarding","Q4 launch"]`, placeholder `Add a label`, `Optional`, hint `Press Enter or a comma after each one.`
- All verbatim strings kept: `Optional`, `Add…` / `Add more…`, `Up to 10 at a time.`, `“x” doesn't look like an email address.`, `Remove <tag>`, `<tag> added` / `<tag> removed`, `2/10` counts.

## Matched behaviour
- Splitters: `/[\s,;]+/` when `splitOnSpace`, else `/[,;\n]+/`; paste with delimiter commits; typing delimiter commits head and keeps tail.
- Validation / dedupe / max: invalid → error message + input keeps remainder; duplicate → flash (`data-flash`) no add; max → `Up to 10 at a time.` + input disabled + empty placeholder + `data-full` count.
- Keyboard: `Enter/Tab/,/;/space` commit, bare delimiter `preventDefault`, `Backspace` empty arms (`data-armed`) then deletes, `ArrowLeft` at pos 0 focuses last chip, `Escape` clears, chip `ArrowLeft/Right` nav, `Backspace/Delete` on chip deletes with `setTimeout` focus to next/input.
- Box `pointerdown` on empty area focuses input; remove `pointerdown preventDefault` (capture) so click survives; form `submit preventDefault`.
- Avatar = first char upper; `title`, `aria-label`, `aria-describedby`, `role=status` live region; invalid `data-invalid` + danger wash; foot hint/error + count.

## Design tokens / themes
- CSS custom props for every colour; light: page `#fafaf9` surface `#ffffff` ink `#171717` muted `#78716c` border `#e7e5e4`; dark: page `#101012` surface `#1c1c1f` ink `#ededed` muted `#a1a1aa` border `#2e2e33`; amber adjusted for dark. Radius `16/10/6`, pills `999px`, shadow, 14px system font, 150–200ms transitions, focus-visible outline, responsive stack.
- Default theme = original appearance (light, `data-theme="light"` in markup).
- `/*noflash*/` guard first in `<head>`: reads `tag-input-theme` else `prefers-color-scheme`, sets `data-theme` before paint; inline `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}` + `meta color-scheme`.
- `[hidden]{display:none!important}` so `hidden` sun/moon icons always win over `.chip-x svg{display:block}`; SVG classes only via `setAttribute`.

## In-place updates
- DOM built once at init (`TagField.build`); timers/handlers only mutate changed nodes (`textContent`, attrs, single chip insert/remove). No `setInterval` loop; only `setTimeout` for post-delete focus. No `innerHTML`/`insertAdjacentHTML`. Hover/focus are CSS-only.

## Verification (node only, no browser)
- `node --check` on extracted guard + main scripts: both OK.
- In-dir harness `harness-stub.cjs`: stubs minimal DOM, loads page script via `vm`, asserts visible text (excludes `.sr`/aria-only), advances pending timers through full add/invalid/duplicate/max/remove loop, asserts unchanged nodes keep identity and zero `innerHTML` writes after init. All checks passed, light AND dark (`data-theme` switch retains visible `maya@acme.com` / `Onboarding`).
- Open `index.html` in a browser to test manually; toggle theme and try paste/validation/keyboard.
