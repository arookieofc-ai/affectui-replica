# REPORT — Agent Overlap Map (affectUI replica)

## What was built
Single self-contained `index.html` (33 KB, no external dependencies) replicating the
affectUI **Agent Overlap Map** ("Agent overlaps") component: a map of colliding agent
work with conflicts highlighted by severity and owner.

- Header follows the original pattern: **"Agent overlaps" + count badge (8)**,
  plus an owners/agents summary line — not a generic toolbar.
- Map: agent nodes (left/right) wired to conflict badges (centre) with curved SVG
  connectors coloured by severity (low = dashed). Hover traces the chain
  (connected items stay lit, the rest dim to **0.75 opacity** so they stay legible).
- Agent identity is a **deterministic 3x3 pixel-mark per agent id**, coloured per
  agent; marks twinkle (busy pulse). Tool identity is a small **circular icon**
  with harness initials + agent name (no text pills).
- Click an agent node or a conflict badge to pin details in the panel below:
  conflict view = severity chip + meaning + full title + involved agents with
  owner notes; agent view = owner note, harness, and their overlap list
  (clickable to jump between conflicts).
- Severity filter: legend doubles as filter (`All severities / Needs a decision /
  Heads-up / Minor`) with counts; `Esc` clears selection; narrow widths collapse
  to a stacked list (wires hidden, nodes full-width). Single-line ellipsis on
  titles/names; details panel sits below the map so no text sits under a button.

## Original demo data used (exact values from `demo-original.js`)
- Title: `Agent overlaps`; severity meanings: high `Needs a decision`,
  medium `Heads-up`, low `Minor`.
- People (9): Sam Ortiz (Moving checkout to the new API), Priya Nair (Pricing page
  and plan limits), Lena Vogel (Billing emails), Marco Rossi (Invoice PDFs),
  Ava Chen (Design tokens), Jonas Weber (Onboarding flow), Noah Kim
  (Usage-based billing), Elif Demir (Billing docs), Tom Becker (Dashboard theming).
- Conflicts (8): c1 `Contradicts` high (Pro limit 50 vs 25 emails),
  c2 `Same files` high (three agents editing `billing/invoice.ts`),
  c3 `Same work` medium (plan comparison table), c4 `Out of sync` medium
  (old price IDs), c5 `Same files` low (`tokens/colors.css`),
  c6 `Same work` medium (usage-based billing guide), c7 `Contradicts` high
  (invoice rounding), c8 `Same files` low (`tailwind.config.ts`).
- Harnesses: `claude-code` → Claude Code, `codex` → Codex,
  `gemini-cli` → Gemini CLI. Sync line: Jonas Weber (only owner with zero
  overlaps) `is in sync`. Empty state string also taken from the demo.
- Clean-room: behaviour/markup/styling studied from the demo bundle only; all
  HTML/CSS/JS rewritten from scratch. No demo code copied; harness logos
  redrawn as initial-based circular icons.

## Tokens
All colours live in the two token blocks (`:root` light + `html[data-theme="dark"]`)
and are referenced via `var()` everywhere else:
- Light: surface `#ffffff`, page `#fafaf9`, ink `#171717`, strong `#1c1917`,
  muted `#78716c`, subtle `#f5f5f4`, border `#e7e5e4`; radii 16/10/6px,
  pills `999px`; amber `#f59e0b` / `#fef3c7` / `#92400e`.
- Dark: surface `#1c1c1f`, page `#101012`, ink `#ededed`, muted `#a1a1aa`,
  subtle `#26262a`, border `#2e2e33`; amber `#fbbf24` / `#451a03`-tinted bg /
  `#fde68a`.
- System sans, base 14px, titles 15–16px semibold, meta 12–13px; 1px border +
  soft shadow cards, hover lift, focus-visible outline, 150–200ms transitions.

## Light + dark checked
- Visible sun/moon toggle (top-right) switching `data-theme` on `<html>`;
  default follows `prefers-color-scheme` (follows OS; stored choice overrides,
  OS changes respected until overridden). Toggle label/icon update per theme.
- Token audit: **0 hex colours and 0 rgb()/hsl() calls outside the token
  blocks**; no external refs, no `@import`.
- Contrast (WCAG, normal text ≥ 4.5): light ink 17.9, text 10.3, muted 4.8,
  high 6.8, medium 6.4, low 7.0–7.6; dark ink 14.5, text 11.5, muted 6.6,
  high 9.0, medium 13.7, low 11.5. One initial miss (muted on the tinted
  details panel, 4.40) fixed by using `--text` on `--subtle` (9.4 light /
  10.2 dark). Dimmed nodes use 0.75 opacity per v3 (not the original's 0.4).

## Visual-QA fixes (2026-11-25 batch-3 review)

Two defects found against the replica, both fixed in `index.html`
(35.6 KB, still self-contained, no new colours/tokens):

1. **Click-to-pin never updated the details panel (mouse + Tab+Enter).**
   Root cause: hover/focus handlers ran a full `render()`, which deletes and
   recreates every `.node`/`.badge` element. Focusing a badge (Tab, or the
   implicit focus on mousedown) therefore destroyed the focused element
   mid-gesture: keyboard focus fell back to `<body>` so Enter hit nothing,
   and the mousedown/mouseup targets became two different elements, so the
   browser retargeted the `click` to `#map` and the badge handler never ran.
   The panel stayed on `Contradicts · C1`. (The old `paintLit()` was just an
   alias for `render()`, so even pure hover was a full rebuild.)
   Fix: hover/focus now only call a real lightweight `paintLit()` that
   toggles `data-lit`/`data-dim` in place (wires carry `data-c`, wide-mode
   nodes/badges now carry `data-agent`/`data-conflict`, matching the narrow
   list). Full `render()` runs only on selection, filter, resize and Esc.
   Keyboard clicks (`event.detail === 0`) restore focus to the rebuilt
   badge/node so Tab position survives. Esc (and clicking the pinned badge
   again) now shows an explicit `No conflict pinned` placeholder instead of
   silently falling back to the first conflict, so "Esc clears" is visible.
   Severity names/counts untouched: Needs a decision 3 / Heads-up 3 /
   Minor 2.

2. **Connector loop/kink between the top `Contradicts` badge and the middle
   `Same files` badge.** Root cause: wires were computed in a synthetic
   `0 0 100 H` viewBox (percent-like x, pixel y) while nodes/badges are laid
   out in CSS pixels, so the SVG's aspect-preserving scale letterboxed the
   paths into a strip that no longer matched the cards; the mixed-unit
   midpoint routing rendered as a folded kink on the c1–c2 span in both
   themes (geometry is theme-independent).
   Fix: wires are now computed in pixel space exactly like the original
   demo — `viewBox="0 0 W H"` with `W = map.clientWidth`, node edges at
   `8+nodeW` / `W-8-nodeW` (`nodeW = min(196, W*0.3)`), badges at `W/2`
   (badge `left` is now px, not %), path
   `M x1 y1 C x1+a y1 x2-a y2 x2 y2` with `a = (x2-x1)*0.55`. Control
   offsets share the sign of dx, so x is monotonic along every connector —
   clean S-curves/elbows with no loops; endpoints tuck under the cards.

## Verification (re-run after fixes)

- DOM-stub harness (jsdom, in-page script executed): realistic
  hover→focus→mousedown→mouseup→click pins each of the 8 conflicts
  (c1 toggles off on second click by design); hover/focus leave the live
  element in the DOM; Tab+Enter pins `Out of sync · C4` and focus is
  restored to the rebuilt badge; Esc shows `No conflict pinned`;
  narrow mode (500px) lists 8 badges and pins `Same files · C5`.
  **44/44 checks pass**, plus narrow smoke test OK.
- Wire geometry: `viewBox 0 0 W H` in real pixels (800×506 in the stub), 17 paths (sum of
  sides); all 17 sampled at 41 points each are x-monotonic (no folds).
- Token audit: **0 hex / 0 rgb()/hsl() outside the two token blocks**,
  no external refs; v3 tokens and light+dark toggle unchanged.
- Contrast (WCAG normal text ≥ 4.5): light ink 17.9 / text 10.3 /
  muted 4.8 / chips 6.4–7.0 / text-on-subtle 9.4; dark ink 14.5 /
  text 11.5 / muted 6.6 / chips 9.0–13.7 / text-on-subtle 10.2.
- `node --check` on the extracted inline script: OK.

## Could not verify
- Pixel-perfect parity with the production screenshot (no screenshot available
  in this environment); placement algorithm is my own (alternate left/right
  agents, centred badges) rather than the original's force layout.
- Original harness logo artwork (replaced with initial monograms).

## How to test
Open `index.html` in a browser (double-click or `python3 -m http.server` in this
directory). Toggle the sun/moon button; filter via the legend pills; click
badges/nodes; press `Esc`; resize below 560px for the stacked list. To switch
demos back, the untouched `demo-original.js` sits alongside for reference.
