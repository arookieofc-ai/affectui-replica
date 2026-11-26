# Agent / Thread replica — REPORT

Slug: `agent-thread`. Public description: Orchestrator conversation with plain answers, task and decision cards, resilient to interruptions.

## What was built
`index.html` (self-contained, ~25KB, system fonts only) replicating the Agent/Thread App screen:

- Header: project name "Atlas Launch" + "2 working · 3 agents", deterministic 3x3 pixel-mark avatars (working ones pulse), context "44k / 200k tokens" with thin 3px bar, sun/moon theme toggle top-right.
- Thread: user bubble + orchestrator plain-answer bubble, task card ("Prepare launch checklist", checklist, circular tool icons, click-to-expand details), smaller sub-agent card (no model line), decision card ("Approve staging deploy?" with Approve / Request changes updating pill + note in place), typing indicator, composer (upload / input / dictate / send).
- All 9 demo states verbatim from `demo-original.js` as a mode switcher: `live, decision, scrolled, offline, uploading, dictating, away, error, loading` with labels Live / Decision / Scrolled up / Offline / Uploading / Dictating / Away summary / Error / Loading. Each maps to visible UI: live typing loop, decision awaiting card, "3 new messages below" jump pill, offline queue banner (composer queues, count increments), upload progress, dictation timer + waveform, away-summary banner, error + Retry (retries then returns to live), loading skeletons.
- Footer routes "Agent Inbox" and "Tasks" update the route note (mirrors `onNavigate`/`onShowTask`/`onOpenInbox` behaviour without copying code).
- Clean-room: all HTML/CSS/JS written from the description + state list; no bundle source copied.

## Spec compliance
- Tokens via CSS vars (light + dark), radius 16/10/6, pills 999px, shadows, 150–200ms transitions, hover/focus states, 12–16px card padding.
- Dark mode: `data-theme` toggle on `<html>`, defaults to stored key → `prefers-color-scheme`; dark tokens adjusted (amber `#fbbf24` on `#451a03`).
- v3: header pattern, token-count context, pixel-marks, circular tools, small sub-cards, opacity ≥ 0.75, single-line ellipsis titles, reserved heading space.
- v4: `<head>` starts with `/*noflash*/` guard + `html{background}` inline + `color-scheme` meta. DOM built once; `tick()`/mode changes update only text/class/style/hidden on existing nodes; no `innerHTML` anywhere (static check + runtime counter).
- v5: all `:hover` inside `@media (hover:hover) and (pointer:fine)`, `tap-highlight: transparent`, `tabular-nums` on body, concentric radii, shadow-vs-border discipline, keyboard (Enter send, Esc clears/dismisses, task card Enter/Space), responsive stack under 560px.

## Verification (node only, no browser)
- `node harness.js` (in-dir DOM-stub, no deps) — PASS:
  - `node --check` on extracted app JS,
  - visible painted text asserted (Atlas Launch, readiness message, task title, decision title, Agent Inbox, Tasks, 44k/200k, all 9 mode labels),
  - full-loop node identity (25 ticks + cycle all 9 modes + 25 ticks; every ref `===`),
  - zero `innerHTML` writes,
  - light AND dark runs + theme toggle flips `data-theme` both ways,
  - decision approve + task expand keep node identity.
- `index.html` 25KB < 200KB.

## Not verified / limits
- No browser render check (per instructions); layout judged from CSS only. Pixel-mark colours, waveform timing, and exact original copy beyond the state list are plausible reconstructions.
- Resilience (offline queue, retry, scrolled jump) is simulated locally, not against a real socket.

## How to test
Open `index.html` in a browser, click each mode button, try Approve/Request changes, expand the task card, send a message (queues while Offline), toggle sun/moon for light/dark. Re-run `node harness.js` to re-verify.
