# Comment Thread — replica report

## What was built
`index.html` (32 KB, single file, inline CSS + JS, system fonts, zero network
except the inert SVG-namespace constant) replicating the `Comment` thread demo:
gray tray + white card, header (`Comment` + `N messages` + close), scrollable
message list, assistant status report with expandable details, `Thinking…`
indicator, and reply composer. Demo chrome adds a page header
(`Comment Thread` + live message count + 1 agent) and a sun/moon theme toggle.

## Original data / behaviour matched (verbatim from `demo-original.js`)
- Authors: `Lena Lindqvist` (`/avatars/lena.jpg`), assistant `Atlas` (gradient
  avatar `#5b9dff → #2f6bff → #8b5cf6`), `Sofia Marin` (`/avatars/sofia.jpg`).
- Messages: `/edit Rename every “customers” to “members” on the pricing page.`
  (renders muted `/Edit` chip + remainder, 3 min ago → `3min ago`); Atlas
  `Edit completed` with details `Renamed 12 mentions in 3 sections` /
  `Kept “customer support” as it is` / `Left the legal pages untouched`
  (1 min ago → `1min ago`), entrance delayed 700 ms like the original.
- Composer: placeholder `Reply, or ask @Atlas…`, `aria-label="Reply"`, send
  `aria-label="Send reply"`, arrow icon, disabled while empty/thinking.
- Send flow: message appended instantly (`just now`); only `/@atlas/i`
  triggers `Thinking…` (`aria-label="Atlas is thinking"`) then a reply after
  **1400 ms**, cycling verbatim: `Done – I also updated the meta description.`
  → `Good catch. I'll leave a note for the copy review.`
  → `On it. You'll see the change in a minute.` → wraps around.
- Relative-time clock ticks every **30 s** and touches only `<time>` text
  nodes (no DOM rebuild); count uses `Intl.NumberFormat("en")` +
  `message`/`messages`; staggered entrance, tree-line details with per-line
  stagger, shimmer thinking, 320–420 ms transitions, `prefers-reduced-motion`
  support, responsive narrow layout.
- Photo avatars use the verbatim paths with the original `onError` → initials
  (`LL`/`SM`) fallback, which is what renders offline.
- Atlas keeps the original gradient-circle avatar; agent identity in the page
  chrome is a deterministic 3×3 pixel-mark (EXACTLY 9 cells, blue/violet
  palette) that twinkles while Atlas is thinking.
- Clean-room code (own `ct-*` classes/structure); details open on
  `pointerdown` capture with the follow-up click swallowed (no double toggle);
  hover/focus are CSS-only; `[hidden]{display:none}` is explicit; SVG classes
  use `setAttribute`; close hides the thread behind a Reopen button
  (original passed a no-op `onClose`).

## Browser-QA fixes (2026-11-26, ground truth checked in `demo-original.js` first)
- (1) Disabled Send arrow invisible in light — root cause: `.ct-send:disabled`
  was only `opacity:.3`, copied from the original `.ui-ct__send:disabled`. That
  fades the dark disc (`#323137`) and the white arrow together, leaving a plain
  grey disc with a faint white arrow on the light tray (visible only in dark
  where the light disc still contrasts). Fix: disabled is now opaque
  (`opacity:1`) with token colours — `background:var(--subtle)`,
  `color:var(--muted)`, `box-shadow:0 0 0 1px var(--border)` — plus an explicit
  `html[data-theme="dark"] .ct-send:disabled` override, so the arrow stays
  legible in both themes. Enabled gradients untouched.
- (2) `/Edit` token had no visible tint — root cause: `.ct-command` set only
  `color:var(--muted)`, matching the original `.ui-ct__command`, which reads as
  plain grey text although the page-note promises an `/edit command tint`.
  Fix: token pill restored with `background-color:var(--subtle)`,
  `border:1px solid var(--border)`, `border-radius:var(--radius-sm)`,
  `padding:0 5px`, `inline-block`, semibold 12.5px — visible tint in light
  (`#78716c` on `#f5f5f4`) and dark (`#a1a1aa` on `#26262a`), tokens only.
- (3) Blank-then-fade on first load — root cause: `.ct-msg > *` used
  `animation:ct-in 420ms both` with `--ct-d:700ms` on the initial assistant
  message (same as the original `.ui-ct__msg`), so `both` fill holds `opacity:0`
  through the delay and the card paints blank white before fading. Fix: entrance
  is now gated behind `[data-anim]` (`.ct-msg[data-anim] > *` + nth-child
  staggers); `buildThread` initial messages carry no `data-anim` and paint
  immediately, while `appendMessage` and `buildThinking` set `data-anim=""` so
  later sends/replies keep the staggered entrance. Timings preserved: 700ms /
  420ms / 320ms entrance, 1400ms reply, 30s clock (verified against original;
  `30000` vs original `3e4` is the same).
- Hard rules preserved: 30s tick touches only `<time>` text nodes (no rebuild),
  details open on `pointerdown` capture with click swallowed, `[hidden]` keeps
  explicit `[hidden]{display:none!important}`, SVG classes only via
  `setAttribute`, no DOM rebuild in tick, no browser used.

## Verification (node only, no browser — all files in this directory)
- `node --check page-script.check.js` (script extracted from `index.html`): passes.
- `node verify-harness.js` — stub DOM + mocked timers, advances the full loop:
  **ALL CHECKS PASSED** (initial render/counts/timestamps/placeholder/aria,
  LL/SM fallback, 9-cell pixel-mark, pointerdown expand + verbatim details,
  plain send with no reply, 4 full `@atlas` cycles incl. case-insensitivity,
  thinking lockout, node-identity assertions proving no rebuild on clock tick
  or hover/focus, dark→light toggle, close/reopen, and a CSS scan proving no
  rule sets `display:none`/`visibility:hidden`/`color:transparent`/`font-size:0`
  on anything but `[hidden]`).
- Plus VISIBLE-painted-text asserts in light AND dark and per-fix asserts:
  (1) disabled-send CSS has `opacity:1` + `--subtle` disc + `--muted` arrow in
  both themes and no `opacity:.3` fade, send button `chainVisible` in both;
  (2) `.ct-command` has `--subtle` background + border + radius + padding,
  `/Edit` + remainder `VISIBLE` in light, dark, and back-to-light;
  (3) no ungated `.ct-msg > *` animation remains, initial articles have no
  `data-anim` (paint immediately, asserted before any timer advance), later
  messages do carry `data-anim`, and 700ms/420ms + 1400ms/30s timings asserted
  present. No `/tmp` use; `page-script.check.js` regenerated in-dir by the harness.
- Light AND dark checked: default `data-theme="light"` (the original demo's
  appearance); toggle switches to `dark` (surface `#1c1c1f`, page `#101012`,
  adjusted amber/placeholder/borders) and back; key texts asserted visible in
  both. Theme choice persists via guarded `localStorage`.

## Could not verify / notes
- Real-browser rendering (pixels, fonts, animation smoothness) — headless
  Chrome cannot run here; layout follows the original CSS values closely.
- Photo avatars can't load offline (expected; initials fallback verified).
- Height-morph animation simplified to CSS transitions (behaviour preserved).

## How to test
Open `index.html` in a browser. Type a message and send; try `@Atlas …`
(with any casing) to get the cycling replies; click `Edit completed` to
expand the report; toggle sun/moon (top right) for dark mode.
