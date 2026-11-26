# Date Picker — Replica Report

## What was built
- ONE self-contained `index.html` (30.9KB, no network, no external assets, system fonts) in this directory.
- Clean-room implementation of the `ui-dpk` single-day picker in text-field style: label + trigger button (calendar icon, formatted value, chevron) + fixed-position dialog panel with month nav, 6×7 day grid, weekday headers, hint line.
- Page chrome: `Research Agent` header with `1 working · 2 dates · Date Picker` meta + visible sun/moon theme toggle (top-right) switching `data-theme="light"|"dark"` on `<html>`, persisted to `dpk-theme`.
- Design tokens as CSS custom properties for light (`--surface #ffffff`, `--page #fafaf9`, `--ink #171717`, `--muted #78716c`, `--subtle #f5f5f4`, `--border #e7e5e4`, radii 16/10/6, soft shadow) and dark (`#1c1c1f / #101012 / #ededed / #a1a1aa / #26262a / #2e2e33`). Accent blue chip `#4fb0fe`, focus ring, danger red.
- `/*noflash*/` guard is the first script in `<head>`: reads stored theme or `prefers-color-scheme` before paint, plus inline `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}` and `<meta name="color-scheme" content="light dark">`.
- Hard-won rules: DOM built once at init (42 day buttons reused); all updates in place via `textContent`/`setAttribute`; zero `innerHTML`/`outerHTML` in page script; dialogs open/close on `pointerdown` capture + click; hover/focus only update `tabindex`/classes; explicit `[hidden]{display:none!important}`; SVGs via `createElementNS` + `setAttribute` (never `.className`); narrow `svg{display:block}` selectors so hide rules win.

## Matched data / behaviour (verbatim from demo-original.js)
- Demo form with two pickers: `First run` (value = next weekday after tomorrow, `min=today`, `isDateDisabled=weekend Sat/Sun`, `hint="Research Agent only runs on weekdays."`) and `Stop after` (`optional`, `value=null`, `min=first-run||today`, `placeholder="Keeps running"` vs default `"Pick a date"`).
- Date helpers: start-of-day, addDays, start-of-month, days-in-month, clamped addMonths, sameDay/sameMonth, clamp, `Intl.getCanonicalLocales`, `Intl.Locale` weekInfo with Sunday-region set (`US,CA,MX,BR,JP,KR,TW,HK,IL,PH,IN,ZA,SA,PE,CO,VE,GT,PR`) else Monday.
- Formatting: value `EEE, MMM d, yyyy`, title `MMMM yyyy`, long `EEEE, MMMM d, yyyy`, day number via `formatToParts`.
- Grid: 6 weeks from locale week start, outside days muted but selectable, `min`/`max`/`isDateDisabled` → `aria-disabled`, today → `aria-current="date"` + dot, chosen → `data-chosen` blue chip, roving `tabindex`, `aria-label` long date, nav arrows `Previous month`/`Next month` disabled at `min`/`max` month, `aria-live="polite"` title.
- Keyboard: `ArrowLeft/Right` (RTL-aware) ±1, `ArrowUp/Down` ±7, `PageUp/Down` ±1mo (`Shift` ±12mo), `Home/End` to week edge, `Enter/Space` select+close, `Escape` close, `ArrowDown/Up` on trigger opens. Outside `pointerdown` (capture) closes. Panel flips up via `data-up` when space is tight.
- Icons: calendar, chevron (`M18 9C…`), arrows (`M15 6C…`, `M9 6C…`) drawn with matching paths but own code.

## What could not be verified
- Pixel-perfect visual diff vs original screenshots (no browser in this environment). Verified structure, tokens, and interaction via stub instead.
- Real popover layering / `showPopover` path (guarded; falls back to fixed positioning). No timers/animations asserted beyond CSS presence.

## How to test
- Open `index.html` in a browser. Click either field to open, arrow keys move highlight, `Enter` picks, `Esc` closes, month arrows navigate, theme button toggles light/dark.
- `First run` blocks weekends and past days; picking a new first date raises `Stop after`'s `min`; footer live line updates (`Fri, Nov 27, 2026 · Keeps running` initially, date-dependent).

## Verification results
- `node --check` on extracted page script: pass.
- In-dir stub harness `harness.cjs` (`node harness.cjs`): **62 passed, 0 failed**.
  - Checks `/*noflash*/` order, `[hidden]` rule, tokens, toggle, no external assets, verbatim strings, script parses, both pickers init, VISIBLE trigger/label/hint/placeholder text (not aria-only), weekend + locale-week (`en-US=0`, `de-DE=1`), open → 42 buttons → 1 chosen → disabled present → month step → choose updates visible text → close, second picker loop, node identity for trigger/value/title/day buttons across full loop, zero `innerHTML` writes after init, keyboard cases present, light AND dark theme apply.
