# REPORT — Onboarding / Brand (slug onboarding-brand)

## What was built
Standalone interactive `index.html` (20.6KB, inline CSS+JS, system fonts only) replicating the affectUI **Onboarding / Brand** step (screen, App screens, Pro).

Public description: *Assistant setup step for company name and customer short forms, live card preview.*

Layout:
- Top bar: `Lumen` product mark + `alex@northwind.com` + theme toggle (top-right) + log-out.
- Left card: step indicator `Step 2 of 4 — Brand`, `What's your company called?`, sub `Your assistant introduces itself with it. Add short forms, too.`, `Company names` chips field, input + Add (+) + Continue (→) icon buttons, hint `The first name is the one your assistant uses` (nbsp when ≤1), Back link.
- Right card: `Live preview` agent card with brand, `Lumen assistant · northwind.com`, `northwind.com` pill, bubble `Hi, I'm Lumen for <brand>`, `Also answers to` aliases, `Focused on agent replies`.

## Demo data used verbatim (from ./demo-original.js)
- `domain=northwind.com`, `email=alex@northwind.com`, `product=Lumen`, `autoType=Northwind Co.`
- `step=2`, `steps=4`, titles/sub/hint/placeholders/labels as in source (`What's your company called?`, `Your assistant introduces itself with it. Add short forms, too.`, `Company names`, `Add a short form`, `Company name`, `The first name is the one your assistant uses`)
- Default chip derived as `Northwind` from `northwind.com` (source helper `o(e)`); auto-type commits `Northwind Co.` if absent (case-insensitive `localeCompare sensitivity:accent`).
- Interactions verbatim: normalize `trim/replace(/\s+/g,' ').slice(0,60)`, Enter/`,` to add, Backspace-empty removes last, remove restores focus, submit commits pending draft then `onContinue → Onboarding: Tone`, Back → `Onboarding: Website`.

Clean-room: wrote own HTML/CSS/JS from behaviour; no copied compiled source, no `innerHTML`/`outerHTML`/`insertAdjacentHTML` anywhere.

## In-place updates
- DOM built once at init. Chips diffed: existing chip nodes kept, only added/removed nodes mutate; preview `brand/inline/avatar/meta/domain/aliases/status`, hint, buttons, placeholder all update via `textContent`/`class`/`disabled`/`placeholder` on existing nodes.
- Auto-type timer (1100ms delay, 70+random*60ms per char, 700ms commit pause, respects `prefers-reduced-motion` + user-interact cancel) updates input value in place.
- Harness asserts full-loop node identity + zero `innerHTML` writes after init.

## v5 polish
- All `:hover` inside `@media (hover: hover) and (pointer: fine)`.
- `html{-webkit-tap-highlight-color:transparent}`.
- `body{font-variant-numeric:tabular-nums}`.
- Concentric radius (16px outer / 10px inner + padding), shadows for elevation + borders for structure, avatar inset outline via `box-shadow: inset 0 0 0 1px var(--img-outline)`, icon buttons optically nudged (`svg{margin-left:-2px}`, icon side ~2px less padding).

## Dark / light
- Tokens via CSS vars; light `surface #ffffff/page #fafaf9/ink #1c1917/muted #78716c/subtle #f5f5f4/border #e7e5e4`; dark `surface #1c1c1f/page #101012/ink #ededed/muted #a1a1aa/subtle #26262a/border #2e2e33`; amber `#f59e0b/#fef3c7/#92400e` → dark `#fbbf24/#451a03/#fde68a`.
- `data-theme` on `<html>`, toggle overrides stored `obw-brand-theme`, default `prefers-color-scheme`.
- No-flash guard first in `<head>`: inline `/*noflash*/` script + `html{background:#fafaf9}html[data-theme="dark"]{background:#101012}` + `<meta name="color-scheme" content="light dark">`.
- Checked both: harness toggles light→dark→light, asserts persistence + CSS blocks; visually verified via tokens (no grey-on-grey).

## What could not be verified
- Exact Pro `.tsx` styles (not fetched per spec); spacing/illustration matched from demo chunk behaviour + generic onboarding patterns.
- Real browser paint (no browser launch per task); verified via node DOM-stub + static token/content checks only.

## How to test
- Open `index.html` in a browser (double-click or `python3 -m http.server` then visit file).
- Wait ~1.1s: `Northwind Co.` types into input then commits to second chip; preview aliases update; hint appears.
- Type + Enter/`,` adds; × or Backspace-empty removes; Continue toasts `Continuing to Onboarding: Tone…`; Back toasts `Back to Onboarding: Website…`; toggle ◐/☾ top-right.
- Node-only verify (in this dir): `node --check verify.js` + `node verify.js` (asserts visible painted text, full-loop identity, zero innerHTML, light+dark). Main script syntax: extract inline script and `node --check` (done, passed).
