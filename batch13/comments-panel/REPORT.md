# Comments Panel — replica report

## What was built
ONE self-contained `index.html` (~23KB, no network, no external assets, system fonts):
a comment feed card (max-width 400px) with title header + close, filter tabs
(All / Questions / Edits + open-edits badge), sort popover (Newest/Oldest first),
comment list with avatars (initials), relative timestamps, resolve toggles,
runnable `/edit` commands (Run edit → Running… spinner → Edit applied + Undo),
empty states per tab, and a composer (input + round send button). Page chrome is
minimal: a label plus a visible sun/moon theme toggle (top-right) switching
`data-theme="light" | "dark"` on `<html>`. Default theme is **light**, matching the
original demo's appearance.

## Original data/behaviour matched (from `demo-original.js`, verbatim)
- 5 comments with exact names/texts/ages: Mara Lindqvist `/edit Rename every
  “customers” to “members” on the pricing page.` (2min), Jonas Weber
  `Should we mention the launch discount in the hero too?` (5min), Lena Hart
  `The new illustrations look great on mobile.` (11min), Theo Brandt
  `/edit Shorten every FAQ answer to two sentences.` (18min), Sofia Marin
  `Can we ship this before Friday?` (26min); current user Noah Keller.
- Edit detection `/^\/edit\b\s*\S/i`, question = non-edit ending in `?`; edits
  render as `/Edit` prefix + remainder.
- Counts exclude resolved; edits badge excludes `done`; tabs filter + newest/oldest
  sort; resolve dims + strikes through (opacity kept ≥ 0.75 per spec: 0.78) and hides
  edit actions; run takes **1100ms** then `Edit applied` + `Undo` (resets to idle);
  composer placeholder `Add a comment or /edit…`, prepends `c-<Date.now()>`, resets
  to All/newest, scrolls list to top; relative-time format
  (`just now`, `Nmin ago`, `Nh ago`, …) refreshing on a **30s** tick that updates
  only `<time>` text (never rebuilds the list); empty states `No open
  questions.` / `No edits to run.` / `No comments yet.`; close button + reopen.
- Tokens per spec (surface/page/ink/muted/subtle/border, radii 16/10/6, pills 999px,
  soft shadow, 150–200ms transitions, focus-visible rings, hover states); dark theme
  re-tokened (`#1c1c1f/#101012/#ededed/#a1a1aa/#26262a/#2e2e33`).
- Hard-won rules: no DOM rebuild in tick loop; sort popover opens on `pointerdown`
  (outside-close on capture `pointerdown`, keyboard via `detail===0` click, Esc
  closes); hover/focus never re-render; explicit `[hidden]{display:none}` rule;
  SVG classes set via `setAttribute` (icons also inlined as strings); no browser
  used — node only.
- No agent identities in this component (user comment avatars only), so no 3×3
  pixel-marks apply; header matches the original (`Comments` + close) rather than
  a crew-style project header.

## Browser-QA fix (2026-11-26): disabled Send comment icon contrast
- QA finding (confirmed against ground truth, NOT a false positive): the disabled
  `Send comment` button painted as a blank grey disc in light theme — the up-arrow
  was only visible in dark theme. Same defect class as `comment-thread`'s disabled
  `Send reply` button.
- Root cause: `demo-original.js` (ground truth, `.ui-cp__send` CSS) sets
  `background: linear-gradient(#323137,#201e25); color:#fff` with
  `.ui-cp__send:disabled{opacity:0.3}`. In light theme that fades the dark disc AND
  the white arrow together over the white card: effective disc ≈ `#c0c0c0`, arrow ≈
  `#d3d3d3` → contrast ≈ **1.1:1**, invisible. (Dark theme keeps a light disc/dark
  icon so the faded arrow stays marginally visible — hence the theme asymmetry QA
  reported.) The replica had copied the original rule verbatim, inheriting the flaw.
- Fix (intentional accessibility deviation from the original, enabled look unchanged):
  `.ui-cp__send:disabled{opacity:1; background:#e4e4e7; color:#6b6b70; ...}` plus
  `html[data-theme="dark"] .ui-cp__send:disabled{background:#2e2e33; color:#a1a1aa; ...}`.
  Enabled gradients untouched (`#323137→#201e25` light / `#f4f4f5→#e4e4e7` dark).
  Resulting icon contrast: **4.2:1** light, **5.3:1** dark (≥ 3:1 WCAG non-text).
  Ordering/specificity verified so the dark disabled rule beats the dark enabled rule.
- Nothing else changed: 30s tick still updates only `<time>` text in place (no DOM
  rebuild); sort popover still opens on `pointerdown` capture; `[hidden]{display:none}`
  intact; SVG classes via `setAttribute`; theme toggle still preserves demo state.

## Verification
- `node --check` on the extracted inline script: **passes**.
- In-dir DOM-stub harness `verify-harness.js` (no `/tmp` use): loads the page script,
  mocks timers, advances the full run loop (run → 1100ms → done → undo), tab filters,
  oldest/newest sort, resolve toggle, composer submit, 30s tick (asserts list not
  rebuilt), close/reopen, and theme toggle both ways. Asserts **visible** text only
  (hidden subtrees excluded; CSS scanned for `display:none`/`visibility:hidden`/
  `color:transparent`/`font-size:0` on text). Result: **65/65 PASS**, covering both
  light (default) and dark themes (dark token block + toggle round-trip asserted,
  plus visible-text assertions re-run in light → dark → light).
- Fix-specific harness checks: send `aria-label="Send comment"` + up-arrow path
  present; light `:disabled` is opaque (`opacity:1`, no `.3` fade) with explicit bg
  `#e4e4e7` / icon `#6b6b70` at 4.2:1; dark `:disabled` bg `#2e2e33` / icon `#a1a1aa`
  at 5.3:1; enabled gradients unchanged from the original in both themes.
- Harness maintenance: extraction now combines ALL `<style>` blocks and runs the
  LAST `<script>` (the page script), since the noflash stub is the first block and
  the old first-match extraction tested the wrong code.

## What could not be verified
- Pixel-level visual match and smooth animations/keyboard tab-order in a real
  browser (headless Chrome unavailable here). Open `index.html` in a browser and
  eyeball light + dark via the toggle; everything interactive works without a server.
- Avatar images (`/avatars/*.jpg` in the original) are offline, so initials
  monograms are rendered (the original's own fallback path).
