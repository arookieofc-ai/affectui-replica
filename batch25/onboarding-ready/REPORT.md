# Report — Onboarding / Ready (slug `onboarding-ready`)

## What was built
Standalone interactive `index.html` (20.9 KB, inline CSS+JS, system fonts only) replicating affectUI **Onboarding / Ready**: final assistant setup summary with name, voice, handover, edits, dashboard activation.

Layout:
- Top bar: `Lumen` + `Pro` pill + `alex@northwind.com` chip + sun/moon theme toggle (top-right).
- Left card: stepper `Step 4 of 4` (4 dots + 3px bar, 100%), `Your assistant is ready`, sub `Here's what it knows. You can change all of it later.`, 4-row summary list, `Open dashboard →` primary button, status line, `← Back to tone`.
- Right card: live assistant preview (`Northwind Assistant`, `northwind.com · Northwind Co.`, `Connecting… → Live` badge, 2 chat bubbles + meta line, `Checked Xs ago · live` tick).
- Toast for edit/back/dashboard feedback.

Interactions (all in-place, no rebuilds):
- `Connecting…` (amber waiting) → `Live` (green working) after 1300 ms (0 ms with reduced-motion), typing dots hide, first bot bubble reveals.
- `previewTick` updates every 2 s (`Checked 2s ago…` cycling 0–12 s then `Checked just now`), same text node mutated.
- 4× `Edit` buttons toast `Opening Onboarding: Website / Tone (demo)` and mark `data-touched`.
- `Open dashboard` → `Opening…` (disabled) → `Dashboard ready ✓` + `Dashboard activated for alex@northwind.com ✓` + toast; second click toasts already-open.
- `← Back to tone` toasts demo nav. `data-autofocus` focuses `Open dashboard` on load. Full keyboard focus-visible support. Narrow (<860 px) stacks to single column.

## Demo data verbatim (from `./demo-original.js`)
- `domains: [northwind.com]`, `aliases: [Northwind Co.]`, derived brand `Northwind`, `name → Northwind Assistant`, `tone neutral + length balanced → Neutral, balanced replies`, `handoverTo support@northwind.com`, `email alex@northwind.com`, `product Lumen`, `step 4 / steps 4`.
- Titles/sub exact: `Your assistant is ready`, `Here's what it knows. You can change all of it later.`, row labels `Learns from / Name / Voice / Hands over to`, `Edit`, `Open dashboard`.
- Chat bubbles (`Do you ship…?` etc.) are plausible demo in same shape — original bundle only defines preview props (`brand, aliases, domains, agentName, tone, length, handoverTo, live, focus:top`), not message text.

## What matches
- Row grid `112px minmax(0,1fr) auto`, `min-height 36px` (44 px coarse), single-line ellipsis, `+N` overflow pattern retained in CSS.
- Original class hooks kept (`ui-obw-title/sub/form`, `ui-obr/list/row/text/name/edit/go`) with own clean-room CSS via tokens (`--obw-*` aliased to theme tokens).
- Tokens: light `surface #ffffff / page #fafaf9 / ink #1c1917 / muted #78716c / subtle #f5f5f4 / border #e7e5e4`, dark `surface #1c1c1f / page #101012 / ink #ededed / muted #a1a1aa / subtle #26262a / border #2e2e33`, amber waiting `#f59e0b/#fef3c7/#92400e` → dark `#fbbf24/#451a03/#fde68a`, radius-lg 16 / radius 10 / radius-sm 6, shadow elevation + 1 px structural borders.
- v3: deterministic 3×3 pixel-mark per `northwind` id (coloured, twinkle when live), no text pills for tools, opacity ≥0.75, no wrap, stepper reserved space.
- v4: `/*noflash*/` script first in `<head>` (stored key `affectui-onboarding-ready-theme` else `prefers-color-scheme`), inline `html{background}` + `meta color-scheme`, DOM built once, timers mutate `textContent/classList/style` only, loop restarts in place.
- v5: all `:hover` inside `@media (hover:hover) and (pointer:fine)`, `html{-webkit-tap-highlight-color:transparent}`, `body{font-variant-numeric:tabular-nums}`, concentric `outer 16 = inner 10 + 6px`, shadows for elevation only, image inset outline 10%, `Open dashboard` optical `padding 0 12px 0 14px` (icon side −2 px).

## What could not be verified
- No Pro `.tsx` source fetched; preview pane styling inferred from props + public description, not pixel-compared to original screenshot.
- Exact brand-derivation (`a(domain)`) and avatar component (`d`) internals unknown — used `Northwind` + pixel-mark as faithful stand-in.
- Handover `undefined → Nobody` fallback and multi-domain `+N` badge logic implemented in CSS but single-domain default shown.

## How to test
- Open `index.html` in a browser (double-click, no server needed).
- Click `Edit` ×4, `Open dashboard`, `← Back to tone`, toggle sun/moon, resize <860 px, enable dark OS theme + reload (no white flash).
- Node-only verification (no browser install):
  - `node --check harness.js`
  - `node harness.js` — asserts visible painted text, full-loop node identity, zero innerHTML writes, light AND dark themes.
  - Main JS syntax also checked via extracted `node --check` (passed).

## Theme check
- Light and dark both checked: harness flips `setTheme('dark'/'light')`, asserts `data-theme` + tokens, plus manual contrast pass (no grey-on-grey, borders visible in both). Dark uses adjusted amber/backgrounds and lighter shadows.
- Clean-room: no compiled source copied; all CSS/JS written from behaviour + demo data.
