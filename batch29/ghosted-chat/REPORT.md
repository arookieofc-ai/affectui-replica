# Ghosted Chat — replica report

## What was built
Single standalone `index.html` (18KB, inline CSS+JS, system fonts only) replicating affectUI `ghosted-chat`: “A chat with three unanswered messages marked as read”.

Layout:
- Page chrome: `ghosted-chat` title + `3 unanswered · marked read` subtitle, pills, theme toggle (top-right), Replay, peek + auto-loop controls.
- Center card with 3/2 chat frame. Fixed 360×240 artboard scaled via `ResizeObserver` (`scale(clientWidth/360)`), `visibility` toggled in place.
- Content (verbatim from `demo-original.js`): `No new messages`, `Hi team!`, `Are you by any chance looking for a recruiter?`, `Hello?` (red shine), `Read`, blue `👎` reply.
- Behaviors: staggered arrival (100/500/1300/2300/3200ms), `Read` fade, red shine sweep (4.5s infinite), last-bubble glow, hover/focus lifts thread `-12px`, hides status/read via `color:transparent` (opacity left for arrival), pops reply. `IntersectionObserver` starts loop, auto-loop restarts every 7.8s, Replay/peek/loop buttons, `r` to replay, `Esc` to release peek, `focus-within` mirrors hover for keyboard.

Clean-room: all class names, CSS and JS rewritten. No copy of compiled source, no external deps.

## What matches the original
- Strings, order, and aria-label verbatim.
- Right-aligned bubbles, `max-width min(68%,26ch)`, `14px 14px 4px 14px` reply mirrored, 11px status / 10.5px read / 12.5px bubbles, 5px stack gap, 14px right pad.
- Arrival easing `cubic-bezier(0.22,1,0.36,1)`, `translateY(10px) scale(0.92) blur(2px)`; reply spring `cubic-bezier(0.34,1.4,0.64,1)`.
- Red shine gradient (ink 38% / red 50% / ink 62%, 300% bg, 100%→0%), glow gradient `#FFA0AB→#FFB89E→#C8A8E5→#A8B5FF` blurred 12px, blue reply `#155EEF`.
- Dark mode via `data-theme="dark"` ancestor, same token shifts as original.
- Reduced-motion: animations/transitions off, all visible.

## What could not be verified (no browser per task)
- Pixel-perfect blur/glow, shine timing, and scaled artboard rendering — checked by code inspection only.
- Real `IntersectionObserver` thresholds and `prefers-color-scheme` first paint — `/*noflash*/` guard follows spec but white-flash not visually confirmed.
- Touch tap-stuck hover — mitigated per v5 (hover only in media), not device-tested.

v3 crew rules (pixel-mark identity, token-count bar, tool icons, sub-agent cards) are N/A: ghosted-chat has no agents/tools/context. Applied equivalents: legible dimmed text, single-line ellipsis titles, reserved header space, bottom padding when expanded, default light matching original demo.

## In-place updates (v4)
- Static DOM built once. Timers add/remove `is-on` / set `textContent` / `style.width|transform|visibility` only.
- No `innerHTML`/`insertAdjacentHTML`/`outerHTML` in main script (harness asserts source + runtime writes).
- Loop restart = `hideAll()` + `schedule()` mutating same nodes.

## v5 polish
- All `:hover` inside `@media (hover: hover) and (pointer: fine)`.
- `html{-webkit-tap-highlight-color:transparent}`, `body{font-variant-numeric:tabular-nums}`.
- Concentric: card `16px` = inner `10px` + `6px` frame inset; last-bubble `::before inset:-1px radius:inherit`.
- Shadows for elevation, borders for structure; `img` 1px inset outline 10% black/white; icon side ~2px optical nudge.

## How to test
- `node --check ./harness.js && node ./harness.js` (in this dir only) — asserts verbatim visible text, full-loop node identity (8 nodes), zero `innerHTML` writes, light+dark themes, hover-media, tokens, <200KB.
- Open `index.html` in a browser: hover/focus chat → reply pops; toggle sun/moon → dark stays finished; Replay / peek / auto-loop work; narrow <560px stacks.

Checked: light AND dark themes pass in harness (`setTheme('light'|'dark')` + token presence) and code-reviewed for contrast (ink/muted on surface/page, amber adjusted for dark).
