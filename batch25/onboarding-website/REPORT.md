# REPORT — Onboarding / Website (slug onboarding-website)

## What was built
Standalone `index.html` (23 KB, no deps, system fonts) replicating affectUI **Onboarding / Website — App screens, Pro, screen**:
first assistant setup step adding website, docs, help centre as learnable sources.

Layout:
- Top bar: `northwind · Onboarding / Website` + `App screens · Pro · slug onboarding-website · N sources` meta + sun/moon theme toggle (top-right).
- Centered card: steps `Website (1, active) → Onboarding: Brand (2) → Tone (3) → Ready (4)`, title `Add your website`, lede `First assistant setup step adding website, docs, help centre as learnable sources.`
- Source-type selector: `Website / Docs / Help centre` (circular icons, `aria-pressed`, Website default).
- URL row: `https://` prefix + input (`autofocus`, placeholder `example.com`) + `Add` button. Demo auto-types `northwind.com` at 65 ms/char, then adds it.
- Status: thin 3 px progress bar + right-aligned `N / M learned` label, `Learnable sources` list, `Back` (disabled, first step) + `Continue →` primary.
- Simulated learning loop: `Queued → Learning… → Learned` pills, 25 %/tick, loops and restarts in place.

Demo data verbatim from `demo-original.js`:
- `autoFocus` → input has `autofocus` + JS focus on init.
- `autoType: northwind.com` → `DEMO_AUTO_TYPE="northwind.com"`, typed then added as Website source; extras `docs.northwind.com`, `help.northwind.com` in same shape.
- `onContinue: → Onboarding: Brand` → `DEMO_CONTINUE_TARGET="Onboarding: Brand"`, step 2 label + `Continuing to Onboarding: Brand…` notice on Continue. `Enter` adds, `Continue` click continues.

Clean-room: HTML/CSS/JS written from the public description + demo behaviour. No bundle copied, no `innerHTML` anywhere (0 occurrences), no Tailwind, no external assets.

## What matches
- Tokens: light (`#ffffff/#fafaf9/#171717/#78716c/#f5f5f4/#e7e5e4`, 16/10/6 px, soft shadow) + dark (`#1c1c1f/#101012/#ededed/#a1a1aa/#26262a/#2e2e33`), waiting amber (`#f59e0b/#fef3c7/#92400e` → dark `#fbbf24/#451a03/#fde68a`), all via CSS vars.
- Card 1 px border + shadow, hover lift, focus-visible outline, 150–200 ms transitions, pills 999 px, base 14 px / titles 16 px semibold / meta 12–13 px muted.
- v3: deterministic 3×3 pixel-mark per source id (working twinkles), circular kind icons, 3 px bar with right label, dimmed steps opacity ≥0.75, single-line ellipsis titles, bottom padding on expanded list, header shows project + counts.
- v4: `<head>` starts with `/*noflash*/` theme script + `html{background:#fafaf9}html[data-theme=dark]{background:#101012}` + `color-scheme` meta; DOM built once, `tick()` mutates only `textContent/class/style/attributes` on existing nodes.
- v5: all `:hover` inside `@media (hover:hover) and (pointer:fine)`, `tap-highlight:transparent`, `body{font-variant-numeric:tabular-nums}`, concentric radii (card 16 = inner 10 + padding), shadows for elevation / borders for structure, icon-button optical nudge (Continue arrow `margin-left:-2px`, primary `padding-left:10px`).
- Responsive: ≤640 px stacks kinds, URL row, and actions.

## Could not verify
- Pixel-exact original (no screenshot/Pro source fetched per spec; behaviour inferred from compiled demo chunk shape + public description).
- Real crawl/token backend — simulated locally with timers.
- No browser run (per task: node only). Visual finish checked via tokens + stub; open in a browser to eyeball.

## How to test
- `open index.html` in a browser (or serve this dir). Expect auto-typing, 3 sources learning, bar advancing, Continue → `Onboarding: Brand` notice.
- Node only (in-dir): `node ./harness.js` + `node --check ./__extracted.js`.
- Harness asserts: VISIBLE painted text (`Add your website`, 3 kinds, `Continue`, `Onboarding: Brand`, `northwind.com`, lede), full-loop node identity (3 rows same objects across 14 ticks), zero `innerHTML` writes after init, light AND dark `data-theme` switching.

## Theme check
- Light: default (or toggle to Light) — white surface on `#fafaf9`, amber waiting legible.
- Dark: toggle to Dark (moon/sun button) — `#1c1c1f` on `#101012`, amber on `#451a03`, borders visible. Harness confirms both via `setTheme('dark'/'light')`.
- Result: `36 pass / 0 fail`, `node --check` clean.
