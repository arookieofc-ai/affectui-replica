# Agent / Activity — replica report

## What was built
ONE self-contained `index.html` (22.5KB, inline CSS+JS, system fonts, no network) in this directory.
Daily grouped agent-activity log: Today / Yesterday / Last week, each entry with agent 3×3 pixel-mark, action title, time, approval source, reason, status pill, circular tool icon, reversible Undo/Restore, expandable “Why?” detail (pointerdown-capture toggle).

Header follows v3 pattern: `Atlas Launch · 2 working · 4 agents` + right-aligned token context `44k / 200k` with thin 3px bar + sun/moon theme toggle (top-right).
Live loop: every 3s a live entry prepends to Today (4 templates), token +0.4k, working 2→1→2; 5th tick resets in place to the initial 4 items. All updates are in-place text/class/style/append/remove — zero `innerHTML` anywhere.

## Matched data / behaviour
- `demo-original.js` in this directory is a 404 page (`<title>Page not found</title>`, no demo data, no timings). So per spec (“if data is unknown, use plausible demo data in same shape”) all names/numbers are plausible, same shape: 4 agents (Scout/Patch/Relay/Scribe), 9 entries with approval source (Maya Chen via Slack #ship, Auto-approved · low-risk, Waiting · needs Priya review, Jonas via Dashboard, Failed checks · quarantined), reasons, reversible undo, token `44k / 200k`.
- Default theme = original appearance: the 404 shell advertises light (`theme-color #ffffff`), so default is light; noflash guard still respects stored `theme` or `prefers-color-scheme`, toggle overrides and persists.
- v3–v5 rules applied: deterministic pixel-marks (exactly 9 `<i>` cells, working twinkle), circular tool SVGs (class via `setAttribute` only), dimmed opacity 0.92 (≥0.75), single-line ellipsis titles, `[hidden]{display:none!important}`, all `:hover` inside `@media (hover:hover) and (pointer:fine)`, `html{-webkit-tap-highlight-color:transparent}`, `body{font-variant-numeric:tabular-nums}`, concentric radii (outer 16 = inner 10 + 6 pad), shadows for elevation / borders for structure, icon-side 2px-less button padding, focus-visible outline, 150–200ms transitions, narrow stacked layout.

## Could not verify
- Original demo visuals/timings (source was 404); loop timing (3s) and copy are invented but plausible.
- Real-browser paint/first-frame: no browser installed per instructions; verified with node only.

## How to test
Open `index.html` in a browser. Click Undo/Restore, Why? toggles, theme toggle; watch live entries arrive every 3s then loop-restart.

## Verification (node only, in-dir files)
- `node --check` on extracted page script: OK.
- `node harness.js` (DOM-stub in this dir): 50/50 PASS — loads script, asserts visible text (`Merged PR #482 — auth refresh`, `44k / 200k`), advances 4 ticks (Today 4→8, token advances), 5th tick resets (Today→4, token→44k), yesterday/week/initial-today nodes keep `===` identity, zero `innerHTML` writes after init, undo→Restore→Undo in place, theme light→dark→light toggles, dark CSS present. Light AND dark checked.
