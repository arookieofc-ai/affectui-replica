# Writing Assistant — replica report

## What was built
`index.html` (25.7 KB, self-contained, no network, system fonts only) replicates the
**Writing Assistant** affectUI component: an AI chat card ("Quill — Your writing companion.")
with gradient glow (pink/violet/blue drifting blobs), greeting + 4 suggestion chips,
chat messages, streaming replies, typing indicator, voice-dictation mic, and a
new-chat (+) button. Clean-room code — behaviour studied from `demo-original.js`,
no source copied.

## Matches the original
- **Verbatim demo data**: name `Quill`, tagline, greeting `What should we write?`,
  all 4 suggestions, placeholder `Ask anything…`, dictation sentence
  `Write a friendly reminder that the report is due on Friday`, and all six
  responder branches (remind / shorter+short / tone / reply / email+polish / fallback).
- **Verbatim timings**: 700 ms min reply wait, 38 ms/word streaming, 450 ms
  chip→send delay, dictation `260 + n·170` ms/word + 500 ms tail + 450 ms send.
- **Behaviour**: Enter sends / Shift+Enter newline, textarea autoresize (max 103 px),
  typing dots while waiting, word-by-word streaming reveal, simulated dictation when
  `SpeechRecognition` is unavailable (real API used when present), new-chat resets
  everything, reduced-motion disables animations/streaming, `+` button only
  visible/focusable once a chat exists (`data-chat`).
- **Look**: card/panel radii, 340 px body, pill composer + 54 px mic button,
  user/assistant bubble shapes, masked scroll fade, glow dims to 60% in chat.

## Spec compliance (v2/v3/v4)
- Design tokens as CSS custom properties; light + dark via `data-theme` with a
  visible ☾/☀ toggle (top-right); **default = light**, the original demo's appearance.
- `/*noflash*/` guard is the first script in `<head>` (stored key → else light),
  plus `html{background}` paint style and `meta color-scheme`.
- **In-place updates only**: DOM built once at init; timers tick existing nodes
  (`textContent`/attrs/styles). No `innerHTML` anywhere in the script.
- `[hidden]{display:none!important}` present; SVG styling via markup/`setAttribute`
  only; mic/new-chat have pointerdown-capture listeners; hover/focus are CSS-only
  (never re-render).

## Verification (node only, no browser)
- `node --check` on the extracted inline script: clean.
- `node harness.js` (in-dir DOM stub): **73/73 pass** — visible greeting/chips/
  placeholder, chip-click full loop (user node + streamed assistant node with the
  exact polish-branch text), container + chip + control **node identity** preserved
  across the loop and across new-chat reset, **zero innerHTML writes**, all five
  responder branches, theme toggle light→dark→light.
- Light AND dark checked: token sets asserted in both themes (`#ffffff/#fafaf9`
  vs `#1c1c1f/#101012`, amber adjusted for dark) and toggle logic exercised in
  the harness. No grey-on-grey: dark reuses the original's adjusted palette
  (ink `#ededed`, muted `#a1a1aa`, borders `#2e2e33`).

## Not verified / notes
- No pixel screenshot comparison (no browser allowed here); visual fidelity is by
  reconstructed CSS values from the original stylesheet.
- No agent identities in this component, so the 3×3 pixel-mark / project-header
  rules do not apply; the card keeps its original Quill header.
- Real speech recognition can't be exercised in node; the simulated dictation path
  (the default in browsers without SR) mirrors the original's word timing.

## How to test
Open `index.html` in a browser. Click a suggestion chip, type + Enter, try the mic
(simulated dictation), toggle ☾/☀, start a new chat with +. Or run `node harness.js`.
