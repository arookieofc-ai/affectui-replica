# decision-tree — replica report

## What was built
Single self-contained `index.html` (44 KB, no network, system fonts) replicating the
affectUI Pro **decision-tree** component: a tray card headed **Decisions** with a live
"N waiting for you" count and a pager (`W of N` + dots), showing one agent decision at a
time — agent row (identity, model, risk pill), question, context, branch buttons
(numbered kbd, label, "Agent's pick" tag), outcome leaf lines with highlighted
"unsure" flags, an "Other…" branch with an expanding inline editor, and an outcome card
("Approved · running" or "Sent to the …" + typing dots + agent reply). Measured
orthogonal SVG connectors link root → branches → leaves → outcome; narrow widths stack.
Auto-demo loops the original timeline; any pointer/key interaction pauses it for 9 s.

Clean-room: all HTML/CSS/JS written from scratch from observed behaviour. No demo
source copied; class names and code are original.

## Original data used (extracted from demo-original.js, not invented)
4 decisions, ids `dupes / contacts / rollout / escalate`:
1. **Billing agent** (Sonnet 5.5, high): "3 customers have two active subscriptions –
   how should I proceed?" / checkout-outage context. Options: "Cancel the newer ones"
   (agent pick; "Cancels 3 subscriptions · reversible for 30 days", "Sends 3 emails"),
   "Refund the newer ones" ("Refunds " + flag "$147 · not reversible" → Stripe note +
   source, "Cancels 3 subscriptions"), "Ask the customers".
2. **Data agent** (Opus 5.5, medium): "214 contacts lost their email…" / CSV context.
   Options: "Delete the 214 contacts" (flag "Deletes 214 rows · not reversible" →
   HubSpot note + source), "Archive them" (pick), "Fill emails from HubSpot".
3. **Pricing agent** (GPT-6 Sol, high): "The new Team price is ready…" / $12→$14 context.
   Options: "Everyone today" (flag "3,812 customers · new invoices tonight" → Billing
   note + source), "10% today, all on Monday" (pick), "Only new signups".
4. **Support agent** (Sonnet 5.5, high): "A customer threatens legal action…" /
   Ticket #10412 context. Options: "Escalate to Legal" (pick), "Refund now and
   apologize" (flag "Refunds $2,400 · not reversible" → Policy note + source),
   "Reply with the policy".
Other flow: typed text `EU first, after the notice – everyone else on Monday`,
custom reply only for `rollout`: `Got it – sending the notice to EU customers today,
their new price starts in 30 days.`; default reply `Got it – I'll take it from here.`
Announce strings ("– picked. … goes ahead.", "Sent to the …", empty state "All
decided / New decisions from your agents show up here.", hint "Pick a branch …")
all match the original.

## Timings / behaviour matched
pick→decided 1500 ms, send→decided 2600 ms, leaving fade 280 ms (0 under
reduced-motion), answer delay 700 ms, pressed flash 220 ms, typing 45 ms/char from
14.2 s, send at 17.2 s, auto timeline [3 hover, 4 choose, 7.6 peek, 9.4 unpeek+hover,
10.4 choose, 13.6 Other, 17.2 send, 22/22.8 hover+choose] restarting every 28 s and
pausing 9 s on user input. Keyboard: 1–9 choose, ←/→/j/k pager, f cycles flags,
Esc closes tip/editor. Tooltip shows flag note + source.

## Deviations required by spec v3 (noted, not oversights)
- Agent avatar is a deterministic **3×3 pixel-mark per agent id** (hue + pattern hashed
  from the id, exactly 9 `<i>` cells, pulse on the active card) instead of the
  original's initial letter — per spec; colours stay legible in both themes.
- Dimmed (non-hovered) rows stay at opacity **0.78**, and still-visible after a pick,
  instead of the original's 0.38/0 — per the ≥0.75 legibility rule.
- Light accent deepened to `#0369a1` so the "Agent's pick" tag passes 4.5:1.
- Theme toggle added (page top-right, `data-theme` on `<html>`, prefers-color-scheme
  default + localStorage override); dark theme adapted from the original's dark token
  block. Page has no token-count bar — the component has no token usage in the demo.

## Interactions
Click/hover/focus branches, flags show notes, Other… opens an editor (Enter sends),
pager + keyboard navigate, auto-demo runs and yields to the user, sun/moon toggles theme.

## Token audit
All colours go through CSS custom properties (`--page/surface/ink/strong/text/muted/
faint/subtle/border/…`, status `high/mid/ok/flag` pairs, link colours); no ad-hoc hex
per element. Radii 16/10/6 px, pills 999 px, 1 px borders + soft shadows, 150–200 ms
transitions, focus-visible rings, card padding 14–16 px, gaps 8–12 px — per spec.

## Contrast results (WCAG ratio, computed)
Light — body 7.63, muted 4.80, kbd faint 4.67, ink 17.93, high-risk 5.30,
medium-risk 6.37, accent tag 5.93, flag 6.37, ok-green 5.02: **all ≥ 4.5**.
Dark — body 9.51, muted 6.12, faint 4.64, ink 13.39, high 6.73, medium 12.03,
accent 7.32, flag 9.39, ok 7.55: **all ≥ 4.5**. Both themes verified (toggle + audit).

## Verification (all inside this directory)
- `node --check` on the extracted inline script: passes.
- `node harness.js` (DOM-stub + virtual timers, kept here): boots the real page
  script, advances the clock through the whole 28 s auto-demo and asserts content,
  pixel-mark cell count (9/mark), Approved outcome @4 s, advance to decision 2,
  peek tip, Other typing text, custom rollout reply, "All decided", bounded renders
  (23 < 60 — no tick-loop rebuilds), theme toggle both ways, manual choose +
  pointerdown→click (no lost clicks) + Other opening on pointerdown capture:
  **ALL HARNESS CHECKS PASSED**.
- Size: 44,422 bytes (< 200 KB). No external requests; system font stack.

## How to test
Open `index.html` in a browser. Watch the auto-demo, click branches, hover the
highlighted "unsure" spans, type in Other…, press 1–4 / arrows / f / Esc, toggle
the sun/moon button, narrow the window below 640 px.
