# Agent Handoff — Replica Report (v2)

## What was built
Standalone interactive `index.html` (inline CSS/JS, no external deps, system fonts, ~38KB) replicating the affectUI **Agent Handoff** relay: "A task passed from agent to agent like a relay – at every handoff what went along to the next one, and what got lost on the way."

- Relay **Researcher 🔍 → Writer ✍️ → Reviewer ✅** (3 runners, 2 handoffs), per v2 original demo data.
- Task switcher with the two original demo tasks: **"Support macro for refunds"** and **"API release notes"** — each task has its own agents' summaries, passed/lost lists, payload diffs, and retention curve (macro 100→91→78%, release 100→88→74%).
- Each handoff card shows **✔ Passed along** (green) + **⚠ Lost on the way** (amber, with "why" note) plus expandable field-level **payload diff**.
- Controls: task tabs, **Replay relay** (auto-steps 1.4s), **Prev / Next / Reset**, step indicator, **Show all / Passed only / Lost only** filter chips.
- Click runner for detail panel (role, model, tools, got/sent). Hover handoff ↔ runners chain highlight. Keyboard: `←/→` step, `Home/End`, `Enter` expand, `Esc` close. Narrow screens stack to one column.

## What changed for v2 (redo, not from scratch)
1. **Design-token system** — all colours now come from CSS custom properties (`--page/--surface/--ink/--muted/--subtle/--border`, status `--working/--success/--waiting/--failed/--idle`, `--accent/--focus/--violet/--code-bg`). Verified: zero hex literals outside the `:root` + `[data-theme="dark"]` token blocks, zero inline `style="#..."`, gradients built from tokens.
2. **Dark mode** — visible sun/moon toggle (top-right, `🌙 Dark / ☀️ Light`) switching `data-theme="light" | "dark"` on `<html>`. Default follows `prefers-color-scheme` (with `localStorage` override once toggled, live-updates on OS change until overridden). Dark tokens per spec: surface `#1c1c1f`, page `#101012`, ink `#ededed`, muted `#a1a1aa`, subtle `#26262a`, border `#2e2e33`; amber waiting adjusted to `#fbbf24` on `#451a03`, text `#fde68a`.
3. **Original demo data** — replaced v1's invented Refund-request/Triage pipeline with the specified relay (Researcher → Writer → Reviewer) and the two tasks above; removed Triage/Refunds/Approver agents.
4. **Polish** — cards `1px var(--border)` + soft `var(--shadow)`, radii `16px` cards / `10px` sections / `999px` pills, 12–16px card padding, 8–12px gaps, 150–200ms transitions, hover lift on buttons/chips/cards/nodes, `focus-visible` outline on all interactive elements.

## What matches the original (per spec)
Light theme white cards on warm-grey bg, amber waiting, hover/focus chain highlight, click-to-open details, working/waiting pulse-blink animations, responsive stacking, tight 14px system-sans type (15–16px semibold titles, 12–13px muted meta).

## What could not be verified
Exact original copy/colours/typography scale — no Pro source fetched; clean-room implementation from the public description + demo data in the prompt. Retention percentages are plausible per-task values in the described shape.

## Contrast check (both themes, measured)
- Light: ink/surface 17.5:1, muted/surface 4.8:1, waiting-text/bg 6.4:1, working 6.2:1, success 5.2:1 — all ≥ 4.5:1 PASS.
- Dark: ink/surface 14.5:1, muted/surface 6.6:1, waiting 12.0:1, working 11.0:1, success 9.7:1 — all PASS. No grey-on-grey body text; borders are spec values (`#e7e5e4` / `#2e2e33`), subtle but visible against surfaces.
- Manually confirmed: toggled light/dark in-browser logic (toggle flips `data-theme`, label/icon update, persists); both themes render finished pages (cards, timeline, detail, diffs legible, no invisible borders).

## How to test
Open `index.html` in any modern browser (double-click or `python3 -m http.server` + visit localhost). Try: task tabs, **Replay relay**, Prev/Next, runner click, card expand, filters, `←/→` keys, mobile-width resize, and the **Dark/Light toggle** (also test with OS dark mode for the default).
