# Code Block — replica report

## What was built
Standalone `index.html` (26 KB, no deps except system fonts) replicating the affectUI **Code Block** (`code-block`, Text, Free): "Readable code with filename, copy button, line numbers, highlights, and coloring."

- Two demo blocks with **verbatim demo data** from `demo-original.js`:
  - TS: `agents/reviewer.ts`, `showLineNumbers: true`, `highlightLines: [8, 9]` — 10-line reviewer source (`defineAgent`, `Code reviewer`, `claude-opus`, `maxSteps: 24`, `// Ask before anything leaves the repo`).
  - Bash: `npm install @acme/agents` + `npx acme run reviewer --watch`, header label falls back to `Bash`.
- Tray + white-card look: 3 px tray padding, 32 px header, ghost 26 px copy button with copy→check blur morph, sticky line-number gutter sized by `--cb-digits`, marked rows with wash + 2 px edge, mono `12.5 px / 20 px` code, horizontal scroll with `wrap` toggle, `maxHeight`-capable scroll region.
- Interactions: copy-to-clipboard (Clipboard API + textarea/`execCommand` fallback, `Copied` aria/title + live-region announcement, 1400 ms reset), playground chips (line numbers / wrap / highlight 8–9 / copy-button visibility), overflow detection that makes scrollable blocks keyboard-focusable (`tabindex=0`, `role=region`), visible sun/moon theme toggle persisted to `localStorage`.
- Clean-room: all HTML/CSS/JS written from the public description and observed behaviour. Tokenizers for JS/TS and Bash are original code; no compiled source was copied (no `innerHTML` anywhere in the page).

## What matches the original
Header-on-tray (filename left, copy right), copy-button feedback timing and a11y strings (`Copy code`/`Copied`), sticky gutter that stays put during horizontal scroll, marked-line treatment, token colors (grey comments, teal strings, purple keywords, orange numbers/literals, blue functions), responsive stacking, and the exact demo content/line count/highlights.

## In-place updates (v4)
DOM is built once at init with `createElement`/`textContent`/`setAttribute`. Toggles mutate only attributes/styles/text on existing nodes (`data-wrap`, `data-numbers`, `data-marked`, `hidden`/`display`, `data-copied`); code lines are never rebuilt. Verified by harness: line-node identity preserved across a full wrap→numbers→highlight loop, `code` children unchanged, zero `innerHTML` writes after init.

## v5 polish
All `:hover` rules gated in `@media (hover: hover) and (pointer: fine)`; `html{-webkit-tap-highlight-color:transparent}`; `body{font-variant-numeric:tabular-nums}`; concentric radii (`12 px` outer / `9 px` inner with `3 px` pad); elevation via layered shadows with real 1 px structural borders; copy-icon optically nudged (`padding-left:2px`).

## What could not be verified
No browser was launched (per task constraints), so pixel-level rendering, real clipboard permissions, and `ResizeObserver` overflow were validated only via the DOM stub and code inspection. Reduced-motion and coarse-pointer rules are present in CSS but not executed in the stub.

## How to test
1. `node --check verify.js && node verify.js` — 39 stub-DOM checks (visible text, node identity, zero `innerHTML` writes, light + dark).
2. Open `index.html` in a browser — toggle theme (top-right), toggle the four chips, click both copy buttons, resize narrow, tab through with keyboard.

## Light AND dark
Checked both: light (`--surface #ffffff`, `--page #fafaf9`) and dark (`--surface #1c1c1f`, `--page #101012`, adjusted amber) via the toggle; stub asserts `data-theme` switching, label repaint, and dark token presence. No-flash guard (`/*noflash*/` + bg style + `color-scheme`) is the first thing in `<head>`.
