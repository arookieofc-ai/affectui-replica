# Onboarding / Tone — replica report

Slug `onboarding-tone`, screen, App screens, Pro.
Public description: Assistant setup step for name, tone, reply length, handover, live test chat.

## What was built
Standalone `index.html` (21.3KB, inline CSS+JS, system fonts only) replicating the Tone step:
- Header: Back, Lumen brandmark, `Step 3 of 4` + 4 dots, user pill `alex@northwind.com`, sun/moon theme toggle top-right.
- Left card: `How should your assistant sound?` / `Give it a name, a voice and someone to ask.` with Name (`Northwind Assistant`, maxlength 40), Tone segmented `Friendly/Neutral/Formal` (default `neutral`), Reply length `Short/Balanced/Detailed` (default `balanced`), Handover switch (default on) + email `support@northwind.com` with note `When it can't answer for sure`, Continue button with arrow (disabled until valid), inline error + saved message, footer `northwind.com · Northwind Co. · Onboarding / Tone · Pro`.
- Right card: live test chat preview — avatar initial, agent name, `Northwind · northwind.com`, Online presence, tone/length pills, handover line, sample Q/A, typing row, `active Xs ago` live timer, test input + Send. Replies vary by tone/length; handover line reflects email validity.
- Demo data used verbatim from `demo-original.js`: tone/length ids+labels, email regex, defaults (domain `northwind.com`, alias `Northwind Co.`, name `Northwind Assistant`, tone `neutral`, length `balanced`, handover `true`, email `support@northwind.com`, user `alex@northwind.com`, product `Lumen`, step 3/4, all copy strings, maxlength 40, aria labels `Hand over to`, switch/seg keyboard model).

## Behaviour
- Validation `W = name.trim() && (!handover || emailValid)`: empty name or bad handover email disables Continue, shows inline message, marks email `aria-invalid`.
- Segmented controls: click + ArrowLeft/Right/Up/Down with roving tabindex, `role=radiogroup/radio`, `aria-checked`.
- Switch `role=switch`, dims email (`data-off`, opacity .45) when off.
- Live preview updates in place on every keystroke/toggle; chat Send reuses the same bubbles (no re-render); 2s timer rotates sample questions and typing/reply, updates `active Xs ago`.
- In-place updates only: DOM built once as static HTML; JS holds cached refs and mutates `textContent`/`value`/`disabled`/`tabIndex`/attributes/classes. No `innerHTML`/`outerHTML`/`insertAdjacentHTML` anywhere.

## Clean-room
Wrote own HTML/CSS/JS from behaviour + the small CSS sketch in the demo chunk. Did not copy the compiled bundle verbatim; class names `ui-obt*` reused only where they define the public structure.

## Spec compliance
- Tokens via CSS vars for every colour; light (`surface #ffffff`, `page #fafaf9`, `ink #171717`, `muted #78716c`, `subtle #f5f5f4`, `border #e7e5e4`) and dark (`surface #1c1c1f`, `page #101012`, `ink #ededed`, `muted #a1a1aa`, `subtle #26262a`, `border #2e2e33`), radius 16/10/6, soft shadow, 14px system sans, pills 999px, transitions 150–200ms.
- Dark mode: `data-theme` on `<html>`, toggle overrides, default from stored key else `prefers-color-scheme`.
- v4: `<head>` starts with `/*noflash*/` guard + `html{background:#fafaf9}html[data-theme=dark]{background:#101012}` + `color-scheme` meta; harness asserts node identity across full loop + zero innerHTML writes.
- v5: all `:hover` inside `@media (hover:hover) and (pointer:fine)`, `html{-webkit-tap-highlight-color:transparent}`, `body{font-variant-numeric:tabular-nums}`, concentric radii (seg 6+2=8), shadows for elevation / borders for structure, avatar inset outline 10%, Continue icon side 2px tighter padding.
- Responsive: 2-col → stacked under 860px; coarse pointers get 44/36px targets; `prefers-reduced-motion` disables transitions.

## What could not be verified
Original Pro `.tsx` and full shell (Brand/Ready steps, real logout, backend save) were not fetched per spec; shell, Lumen mark, and reply copy are plausible reconstructions in the same shape. Exact `--obw-*` values and font metrics inferred from the demo CSS behaviour.

## How to test
In this directory only:
- `node --check ./harness.js`
- `node ./harness.js` — asserts noflash, tokens, guarded hover, zero innerHTML, 21 VISIBLE strings, JS parses/executes, 8-tick node identity, theme light+dark with persistence, validity (empty name / bad email disable, handover-off enables).
- `open index.html` (or any static server) — toggle sun/moon, try empty name, bad email, handover off, arrows on segs, Send a test message. Confirmed legible in light AND dark.

## Verification
- `node --check ./harness.js` → OK; `node --check` on extracted main script → OK.
- `node ./harness.js` → ALL HARNESS CHECKS PASSED (light AND dark).
