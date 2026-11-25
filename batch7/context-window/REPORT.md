# context-window — replica report

## What was built
`index.html` (24,426 bytes, self-contained, no network, system fonts) replicating the
affectUI Pro **context-window** component: a card showing a model's context window as a
**field of cells** plus a per-part breakdown, with hover inspection, removal, and compaction.
Clean-room implementation — original layout/behaviour re-created from the compiled demo's
observable data and tour; no demo source copied (the only reused literal is the
terracotta `#D97757` icon tint and the demo's data constants).

Layout: header (model badge + `claude-sonnet-5-5` + `limit 200k` pill left,
right-aligned `175.6k / 200k` token label — counts, never percentages), thin 3px usage bar,
120-cell field coloured by part, legend, expandable part rows, footer with demo status.
`New chat`, `Collapse all`, and a sun/moon theme toggle (top-right toolbar).

## Original data used (from `demo-original.js`, exact)
- `limit: 200000`, `model: 'claude-sonnet-5-5'`, action `New chat` (resets).
- Parts: `System prompt` 4200 (**locked**), `Tools` 12800, `Files` →
  `schema.prisma` 9400, `billing.ts` 21300, `meeting-notes.md` 15400,
  `Conversation` 108600 with `compact: 0.28`, `Memory` 3900.
- Totals derived, not invented: fresh `175600 → "175.6k / 200k"`;
  after Tools removal `162.8k`; after compact (`round(108600×0.28)=30408`) `84.6k`.
- Auto-demo tour timings/selectors reproduced exactly:
  `[3200 expand-first-collapsed] → [1300 remove-first] → [1500 compact] →
  [4200 collapse-open] → [1600 new-chat]`, cancellable on
  pointer-enter / pointer-down (capture) / key-down, same as the original effect.
- Nothing invented: all labels, counts, flags, timings come from the demo chunk.

## Interactions
- **Hover** a row → its cells get `.hot` (others dim to 0.75, never below), row dims;
  hover uses class toggles only, never a re-render.
- **Click / pointerdown / Enter-Space** on a row toggles its detail (`aria-expanded`,
  Files lists its 3 files, Conversation shows message/compact detail). Expand handling is
  bound on **pointerdown + mousedown capture**, before any re-render, with a click-guard
  so a real mouse press is never lost across a rebuild.
- **× Remove** deletes a part/file (locked System prompt has no remove button);
  **Compact** condenses Conversation to 28% (`↓72%` badge); **New chat** restores all;
  **Collapse all** closes details; **Esc** closes details too.
- **Re-render only on state change**: `render()` early-returns on identical state
  signature; there is no tick loop — only the chained tour `setTimeout`s. Verified by
  harness (repeat `render()` does not touch the DOM).
- Responsive: header wraps and file-meta hides under 560px; `prefers-reduced-motion`
  disables transitions; focus-visible outlines on all controls.

## Token audit (all colours via CSS custom properties)
`--surface #ffffff / #1c1c1f`, `--page #fafaf9 / #101012`, `--ink #1c1917 / #ededed`,
`--muted #78716c / #a1a1aa`, `--subtle #f5f5f4 / #26262a`, `--border #e7e5e4 / #2e2e33`,
`--radius-lg 16px`, `--radius 10px`, `--radius-sm 6px`,
`--shadow` per theme, `--wait-dot #f59e0b → #fbbf24`, `--wait-bg #fef3c7 → #451a03`,
`--wait #92400e → #fde68a`. Part hues via `--cw-system/tools/files/chat/memory`
(adjusted per theme). No ad-hoc hex in element styles; pills fully rounded.
No 3×3 pixel-mark is used: this component's demo data has **no agent ids**, so the
conditional pixel-mark rule does not apply (and no 8-cell-style half-built markup exists).

## Contrast results (WCAG, computed in harness — all ≥ 4.5:1)
- light ink/surface 17.49, light muted/surface 4.80, light amber 6.37
- dark ink/surface 14.52, dark muted/surface 6.63, dark amber 12.03
Checked in both themes; light AND dark render fully (dark tokens for surface, borders,
part hues, amber triple).

## How to test
1. Open `index.html` in a browser — the auto tour plays (expand → remove → compact →
   collapse → new chat); move the pointer over the card to take over and click around.
2. Toggle ◐/☾ to check dark mode; narrow the window for the stacked layout.
3. Headless: `node harness-cw.js` — boots the page's own script in a DOM stub, fires the
   real chained tour timers (delays asserted: 3200/1300/1500/4200/1600), checks totals,
   labels, hover, capture-phase expand, theme persistence, contrast, and the <200KB /
   no-network budgets. **45/45 checks pass.** `node --check` on the extracted script passes.

## What could not be verified
- Pixel-fidelity against the closed Pro `.tsx` source (only the public compiled demo was
  used, per spec); cell granularity (120 cells) and hues are reasonable reconstructions.
- A real browser run (no browser in this environment) — verified via syntax check plus
  the DOM-stub run of the actual page script instead.
