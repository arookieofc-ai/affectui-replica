# Command Menu — replica report

## What was built
Self-contained `index.html` (33KB, no network, system fonts) replicating the `Command Menu` demo from `demo-original.js`.
Clean-room implementation: own HTML/CSS/JS, no copied bundle code, no `innerHTML`, DOM built once at init with in-place updates only.

Layout matches original:
- Centered 600px tray + card, 52px search row with magnifier, `Type a command or search…` input (`role=combobox`), `Enter` pill.
- Scrollable list (`role=listbox`, max-height 340px) with group labels and 16 commands, active pill highlight (220ms), footer with `Tab to jump between sections` tip / done check + `Ctrl/K` or `⌘/K to open`.
- Responsive: <480px hides keys/hints/foot-right/enter, rows 44px. `prefers-reduced-motion` disables animation.
- Theme toggle top-right (sun/moon) switching `data-theme="light"|"dark"` on `<html>`, persisted as `ui-cm-theme`.

## Design tokens
CSS vars for every colour. Light: surface `#ffffff`, page `#fafaf9`, ink `#171717`/`#1c1917`, muted `#78716c`, subtle `#f5f5f4`, border `#e7e5e4`, radii 16/10/6px, shadow `0 1px 2px rgba(0,0,0,.05), 0 4px 16px rgba(0,0,0,.05)`.
Dark: surface `#1c1c1f`, page `#101012`, ink `#ededed`, muted `#a1a1aa`, subtle `#26262a`, border `#2e2e33`, darker shadows.
Amber: `#f59e0b`/`#fef3c7`/`#92400e` light, `#fbbf24`/`#451a03`/`#fde68a` dark. Checked both themes for contrast, no grey-on-grey.

## Matched data / behaviour (verbatim from demo-original.js)
- Groups: `Suggestions` (5), `Share` (2), `General` (4), `Go to` (4+1).
- Commands + hints + keywords verbatim: `Write an email`/`Gmail`/`mail send compose`, `Ask assistant`/`Summaries, drafts, answers`/`ai chat question`, `Create a task`/`ClickUp`/`todo issue`, `Add contact to CRM`/`HubSpot`/`lead deal company`, `Schedule a meeting`/`Google Calendar`/`call invite event`, `Post an update`/`#team-updates`/`message channel`, `Save as page`/`Notion · Meeting notes`/`doc wiki`, `New document`/`N`, `Invite teammates`/`I`, `Upload files`/`U`, `Switch to dark mode`/`theme appearance light`/`⇧ D`, `Home`/`G H`, `Inbox`/`G I`, `Reports`/`G R`, `Settings`/`G S`, `Help & feedback`/`?`.
- Placeholder `Type a command or search…`, footer `Tab` + ` to jump between sections`, `to open`, `Enter`, dynamic `Ask assistant about “<q>”` / `Asked the assistant about “<q>”`.
- Filtering: NFD-normalized case-insensitive substring over label+hint+keywords; Suggestions first 5 get `⌘/Ctrl+1..5` numbers; non-empty query prepends `Assistant` group.
- Selection: first item default, hover/`pointerenter`/`mousemove`/`focus` moves selection in place, `ArrowUp/Down` wraps with scroll, `Tab`/`Shift+Tab` jumps sections, `Enter` runs, `Esc` clears, `Ctrl/Cmd+1..5` runs numbered, `Ctrl/Cmd+K` focuses+selects.
- Run shows done check + label, clears after 1800ms (verbatim timing), pill 220ms, list height 320ms, ran 600ms, done-in 260ms.
- Icons: 9 glyph paths reused as data (`doc,person,inbox,home,gear,moon,help,upload,chart`); brand tiles are simplified clean-room SVGs (no large copied paths).
- No agent identities in this component, so no 3x3 pixel-marks (spec conditional).

## Hard-won rules applied
- No `innerHTML` anywhere (0 occurrences); highlight `<mark>` via `createElement`/`textContent`, keys via DOM.
- `pointerdown`/`mousedown` capture with `preventDefault` on items + toggle so input focus survives clicks; `click` runs commands.
- Hover/focus only updates `aria-selected` + pill, never rebuilds.
- `[hidden]{display:none !important}` explicit; `:where(.ui-cm) svg{display:block}` keeps specificity low so `[data-broken]>*{display:none}` wins.
- SVG classes only via `setAttribute('class',…)` (0 `className` uses).
- `/*noflash*/` guard is first child of `<head>`, plus `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}` and `meta color-scheme`.
- Default theme: light (original demo appearance); follows `prefers-color-scheme` when no stored value, toggle overrides.

## Verification
- `node --check extracted.js` (main script extracted from `index.html`): OK.
- `node --check harness.js`: OK.
- `node harness.js` (in-dir DOM stub, no installs): loads page script, advances fake timers through full loop (`mail` filter → run → 1800ms expiry → `hello` assistant → run → 1800ms → clear), asserts VISIBLE text (labels/hints/done in rendered nodes, not aria-only), asserts node identity (`buttons['0-0']`, `buttons['0-1']`, groups, pill same objects) and zero `innerHTML` writes after init, checks light AND dark visibility. All PASS.
- How to test manually: open `index.html` in a browser, type `mail`, press `Enter`, check done toast clears; toggle sun/moon top-right to verify dark.

## Not verified / notes
- Pixel-perfect spacing vs original screenshot not measured (no browser in this env); layout tokens and structure match compiled CSS intent.
- `ResizeObserver` height animation simplified to pill/scroll positioning; visual result equivalent.
