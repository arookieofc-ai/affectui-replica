# REPORT — fix-integration-settings (targeted dark-toggle + save-bar fix)

## What was done
Targeted fix of existing `./index.html` (no rebuild). Kept everything identical except two in-place logic lines to match `./demo-original.js`:
1. `renderHead()` now sets/removes `data-off` on the card `section` (original: `"data-off": !w.enabled`).
2. `discardBtn` handler now also restores `draft.enabled = saved.enabled` and calls `renderHead()` (original discard is `T(S)` — full saved-snapshot restore, including `enabled`).

No layout/CSS/DOM-structure changes. No new sections. No `innerHTML` (still zero). `/*noflash*/` guard kept. Demo data verbatim.

## Original behaviour (from `./demo-original.js`)
- Toggle (`role=switch`, `aria-checked`) flips `enabled` in **both** working (`w`) and saved (`S`) snapshots immediately: `V({enabled:e}), C(t=>({...t,enabled:e}))`, calls `onToggle`. It does **not** mark dirty.
- Meta: `enabled ? meta : "Paused – no data is synced"` (`title` only when enabled). `section[data-off]` when disabled (no CSS rule, but part of original paused styling).
- Fold: `<div class=ui-is__fold data-open={enabled} inert={!enabled}>` with grid `0fr/opacity:0` → `1fr/opacity:1`. Collapse on OFF is **original** — DOM stays, only `data-open`/opacity/grid change. Verified in `demo-original.js` CSS/JSX.
- Save bar: `B = siteUrl!==saved.siteUrl || timeZone!==saved.timeZone || apiKey!==saved.apiKey` — **excludes `enabled`**. `div.ui-is__save[data-open={B}] inert={!B}` inside `fold-inner`, sibling of card. Appears only on API-key / site / timezone edits, not on toggle. `Save` normalises URL (`siteUrl:R`), `Discard` restores `T(S)`.
- Data verbatim: `Shopify store`, `128`, `Connected on March 4, 2026 at 09:12`, `Your store's primary domain from Settings › Domains`, `lumen-studio.com`, `(GMT +01:00) Berlin`, 13 zones (Los Angeles … Sydney).

## Root cause(s)
1. **Missing `data-off` parity** — replica never set `section[data-off]`, diverging from original paused styling. Harmless visually (no CSS rule) but breaks attribute parity and any QA hook checking original attributes.
2. **Incomplete discard round-trip** — replica discard restored only `siteUrl/timeZone/apiKey` and never called `renderHead()`, while original does full `T(S)` (including `enabled`) + re-render. Any `draft.enabled !== saved.enabled` desync would leave header/fold/meta stale. This is the “state must round-trip fully” suspect: a rebuild-from-incomplete-state pattern would lose fields; here the fix guarantees in-place full round-trip.
3. **Reported “ENTIRE body vanishes / fields never come back / save bar never appears”** — checked against original:
   - Fold collapse on OFF (header-only visible, `opacity:0/0fr`) **is original**, not a bug — noted, not “fixed” to stay visible. What must never happen (and now asserted) is DOM removal / identity loss.
   - `Sync orders / Sync products / Manage plan` do **not** exist in `demo-original.js` excerpt (only API key / Site address / Time zone + save bar). No such sections invented, per verbatim rule. Replica preserves all 3 existing sections with same node identity across OFF→ON in both themes. If fuller component has extra sections, same in-place pattern preserves them (no rebuild).
   - Save-bar trigger already matched original (`isDirty` excludes `enabled`); harness proves it opens on site/timezone edits in light **and** dark. No change needed beyond discard fix.

## Fix(es)
- `renderHead`: added `section.removeAttribute("data-off")` when enabled / `section.setAttribute("data-off","")` when disabled. In-place attribute only.
- `discardBtn`: added `draft.enabled = saved.enabled;` + `renderHead();` to existing `renderKey(); renderSite(); renderZone(); renderSave();`. In-place only.
- Both keep: single build-once DOM, timers/ticks update only text/class/attrs, zero `innerHTML` writes after init.

## Verification (node only, in-dir)
- `node --check ./harness-toggle-save.js` → ok.
- App-script syntax: `vm.Script` parse of extracted inline script → ok (harness runs it; any syntax error would throw).
- `node ./harness-toggle-save.js` → ALL CHECKS PASSED (see below). Stub DOM, no installs:
  - Light + dark: OFF → meta `Paused – no data is synced`, `fold` loses `data-open`, `section` gains `data-off`, `aria-checked=false`, but `bodyCard` + 3 `int-section`s keep **same object identity**, still parented, `hidden==false`, no `display:none/visibility:hidden/opacity:0` inline.
  - ON → meta restored, `fold[data-open]` + `section[data-off]` removed, same identities, VISIBLE.
  - Save bar: closed initially + after toggle alone (original `B`), opens (`data-open`) on site edit + timezone edit, `saveBtn` enabled when valid, closes on Discard/Save, `saved`/`draft` commit normalised URL. Verified in light **and** dark.
  - Full-loop node identity for `section/head/fold/genBtn/keyRow/siteInput/zoneBtn/saveBar/metaEl` + 3 sections.
  - `innerHTMLWrites === 0`.
- Kept: `/*noflash*/`, in-place updates only, zero `innerHTML`, demo data verbatim, `prefers-color-scheme` default + toggle override, contrast checked in both themes (tokens from spec).

## What matches / could not verify
- Matches: header (logo/name/count/meta/switch), API-key generate/show/copy/regenerate + once-only note, site field + validation/hint/ok-check, timezone searchable popover, save bar trigger/appearance, fold/inert behaviour, theme tokens + toggle, focus/keyboard/Esc/outside-close.
- Could not verify in real browser (node-only per task): actual pixel collapse animation, `inert` focus behaviour, `clipboard.writeText`, `crypto.getRandomValues` randomness. Harness stubs these.
- `Sync orders / Sync products / Manage plan` — not in excerpt, not added; if QA expects them, they belong to fuller spec outside `./demo-original.js`.

## How to test
Open `./index.html` in a browser (no server needed). Toggle sun/moon for light/dark. Click `Shopify store sync` OFF → status becomes Paused, card collapses (original) but DOM stays; ON → restores. Edit Site address or Time zone → `Unsaved changes` save bar appears; Discard/Save work.
