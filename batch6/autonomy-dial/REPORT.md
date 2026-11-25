# autonomy-dial — replica report

## What was built
Single self-contained `index.html` (26,013 bytes, no network, system fonts) replicating the
affectUI Pro **autonomy-dial** component: a three-stop dial controlling how much an agent may do
without asking. Card title "Sales agent", subtitle "What it may do without asking you", a
segmented 3-stop control (Always ask / If risky / Full auto + hint line), and two live groups
("Runs on its own" / "Asks you first") with animated counts, per-action rows (identity mark,
label, risk chip, lock pin button), empty states, and a polite live region. Page header shows the
project name plus a live "N on their own · M ask first" summary (the dial's equivalent of the
working/agent counts); sun/moon toggle sits top-right.

All code is original. `demo-original.js` was read only to extract data, timings, and behaviour;
no source was copied (icons, CSS, and structure were rewritten from scratch).

## Original demo data used (exact, nothing invented)
- Stops: `Always ask` / "Nothing happens without your OK" · `If risky` /
  "Safe actions run, risky ones wait for you" · `Full auto` / "Everything runs, except what you locked".
- Ask rule: asks ⟺ pinned, or level 0, or (level 1 and risk ≠ safe). Level clamped 0–2 (rounded).
- Actions (6, ids/labels/risks verbatim): `read` Read files and docs (safe), `draft` Draft emails
  (safe), `crm` Update CRM records (risky), `send` Send emails (risky), `delete` Delete files
  (destructive), `spend` Spend money (destructive). The demo defines no per-action detail strings,
  so none are shown.
- Group headers "Runs on its own" / "Asks you first"; empties "Every action waits for you" /
  "The agent runs everything itself"; live summary "{label}: {own} on its own, {ask} ask first".
- Pin button arias/titles verbatim ("Always ask before: X", "X: always asks – unlock", etc.).
- Scripted tour (initial level 1 + pinned `[spend]`): steps
  `{1,[spend]} → {2,[spend]} → {2,[spend,delete]} → {0,[spend,delete]} → {1,[spend]}` looping,
  first advance after 2000 ms, then every 2400 ms; any pointer/key interaction stops the tour.
- Timings/eases: pill slide 320 ms, row FLIP 420 ms with 20 ms stagger, count roll 360 ms
  (up/down keyframes), `prefers-reduced-motion` disables animation; counts via
  `Intl.NumberFormat("en")`.

## Interactions
Click a stop (or ArrowLeft/Right/Up/Down inside the radiogroup, with focus following selection);
lock/unlock icon per row overrides the dial (pinned rows always ask); empty states appear at
level 0 (own) and fully-unpinned level 2 (ask); theme toggle flips `data-theme` on `<html>`
(light default, dark on `prefers-color-scheme: dark`, toggle overrides). Narrow screens stack and
hide detail text; touch devices get taller stops and always-visible pins.

## Design-token audit
Every colour lives in `:root` / `html[data-theme="dark"]` custom properties — the harness asserts
zero hex codes outside token blocks. Light: surface `#ffffff`, page `#fafaf9`, ink `#171717`,
muted `#78716c`, subtle `#f5f5f4`, border `#e7e5e4`, radii 16/10/6 px, pill `999px` chips,
warn `#f59e0b`/`#fef3c7`/`#92400e`, danger `#fdecea`/`#c4320a`. Dark: surface `#1c1c1f`,
page `#101012`, ink `#ededed`, muted `#a1a1aa`, subtle `#26262a`, border `#2e2e33`,
warn `#fbbf24`/`#451a03`/`#fde68a`, danger `#ff8a7a`/`#451a03`. Focus ring, 150–200 ms hover
transitions, card border + soft shadow with hover lift, single-line ellipsis titles.

## Contrast results (computed, normal-text AA ≥ 4.5)
Light — ink/surface 17.9, muted/surface 4.8, muted/page 4.6, warn 6.4, danger 4.8, ok 4.6. Dark —
ink/surface 14.5, muted/surface 6.6, warn 12.0, danger 6.5, ok 8.6. All pass. `faint` grey is
decorative-only (hidden lock icons); always-visible pins (touch, pressed) use `muted`, which passes
in both themes.

## Deviations / not verified
- Identity icons: the original uses per-action brand-style glyphs; this replica uses a deterministic
  coloured 3x3 pixel-mark per action id (exactly 9 `<i>` cells per mark, mirrored-symmetric, centre
  always on; "runs" marks gently twinkle per the v3 motion cue). No pixel data was copied.
- No visual screenshot comparison was possible in this environment (no browser); both themes were
  verified structurally (token audit) and the dark palette mirrors the original's dark-mode values.
- Container height animation is via WAAPI (no layout transition); behaviour matches.

## How to test
Open `index.html` in a browser: watch the dial auto-cycle, then click stops/locks, use arrow keys,
toggle the theme. Headless: `node verify-harness.js` in this directory — 35 checks (syntax via
extracted script + `node --check`, initial partition, 9-cell marks, pill position, full 2000/2400 ms
tour loop, FLIP 420 ms + height anims, takeover, dial/pin/keyboard, theme toggle, token/contrast
hygiene, <200 KB). All 35 pass.
