/* Logo Cluster DOM-stub harness (node only, no installs).
 * Usage: node harness.js [./index.html|./original-backup.html]
 * Asserts VISIBLE state (computed sizes/opacity/colours), light+dark, full-loop node identity, zero innerHTML.
 */
"use strict";
const fs = require("fs");
const fpath = process.argv[2] || "./index.html";
const html = fs.readFileSync(fpath, "utf8");

// Extract main inline script (the one exposing __cluster). Skip /*noflash*/ guard.
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const mainSrc = scripts.filter(s => s.includes("__cluster")).pop() || scripts[scripts.length - 1];
if (!mainSrc || !mainSrc.includes("__cluster")) {
  console.log(`FAIL file=${fpath} reason=no-main-script-found`);
  process.exit(1);
}

// ---- minimal DOM stub ----
let innerHTMLWrites = 0;
class Style {
  constructor() { this._m = Object.create(null); }
  setProperty(k, v) { this._m[k] = String(v); }
  getPropertyValue(k) { return this._m[k] || ""; }
}
class FakeEl {
  constructor(tag) {
    this.tagName = String(tag).toUpperCase();
    this.children = [];
    this.attributes = Object.create(null);
    this.style = new Style();
    this.className = "";
    this.textContent = "";
    this._listeners = Object.create(null);
    let _inner = "";
    Object.defineProperty(this, "innerHTML", {
      get() { return _inner; },
      set(v) { innerHTMLWrites++; _inner = String(v); },
      configurable: true,
    });
  }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attributes, k) ? this.attributes[k] : null; }
  hasAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attributes, k); }
  removeAttribute(k) { delete this.attributes[k]; }
  appendChild(c) { this.children.push(c); return c; }
  addEventListener(t, fn) { (this._listeners[t] = this._listeners[t] || []).push(fn); }
  get offsetWidth() { return 100; } // forces reflow path in replay()
}
const ids = {};
["cluster","orbit","frame","mid","status","legend","themeBtn","replayBtn","pauseBtn","pauseLabel"].forEach(id => {
  ids[id] = new FakeEl(id === "pauseLabel" ? "span" : "div");
});
ids["cluster"].setAttribute("data-theme-holder", "1");
const documentElement = new FakeEl("html");
documentElement.setAttribute("data-theme", "light");
const documentStub = {
  documentElement,
  getElementById: (id) => ids[id] || null,
  createElement: (tag) => new FakeEl(tag),
  createElementNS: (ns, tag) => new FakeEl(tag),
};
const store = Object.create(null);
const localStorageStub = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
};
// rAF queue with controllable clock
let now = 0;
let rafSeq = 1;
let rafMap = new Map();
function requestAnimationFrame(cb) { const id = rafSeq++; rafMap.set(id, cb); return id; }
function cancelAnimationFrame(id) { rafMap.delete(id); }
function step(ms) {
  now += ms;
  const cbs = [...rafMap.values()];
  rafMap = new Map();
  for (const cb of cbs) cb(now);
}
function drain(msTotal, slice) {
  const n = Math.max(1, Math.round(msTotal / slice));
  for (let i = 0; i < n; i++) step(slice);
}
const windowStub = {};
global.document = documentStub;
global.window = windowStub;
global.localStorage = localStorageStub;
global.requestAnimationFrame = requestAnimationFrame;
global.cancelAnimationFrame = cancelAnimationFrame;

// Run the inline script
try {
  eval(mainSrc);
} catch (e) {
  console.log(`FAIL file=${fpath} reason=script-threw error=${e && e.message}`);
  process.exit(1);
}
const api = global.window.__cluster;
if (!api) {
  console.log(`FAIL file=${fpath} reason=no-__cluster-export`);
  process.exit(1);
}
const failures = [];
function check(cond, msg) { if (!cond) failures.push(msg); }

// Trigger init show(): script queued requestAnimationFrame(show) at now=0
step(16); // runs show() -> schedules tick(16)? show sets status 0/7, schedules tick
// Advance through entrance: delays 0.18s + stagger, status counts 1 per 45ms after 180ms
drain(2500, 16);

const bubbles = api.bubbles;
check(Array.isArray(bubbles) && bubbles.length === 7, `expected 7 bubbles, got ${bubbles && bubbles.length}`);
const status1 = ids["status"].textContent || "";
check(/7\s*\/\s*7/.test(status1), `expected status 7/7 after entrance, got "${status1}"`);
check(ids["cluster"].hasAttribute("data-on"), "cluster missing data-on (entrance did not run -> opacity 0)");

// VISIBLE sizes: displayed px at max-width 420 container: px = sz * 420/320
const sizes = bubbles.map(b => {
  const name = b.getAttribute("data-name");
  const sz = parseFloat(b.style.getPropertyValue("--sz"));
  const px = sz * 420 / 320;
  return { name, sz, px };
});
for (const s of sizes) {
  console.log(`bubble=${s.name} sz=${s.sz} px@420=${s.px.toFixed(1)}`);
}
const gh = sizes.find(s => s.name === "GitHub");
check(gh && gh.sz >= 42, `GitHub display size too small: sz=${gh && gh.sz} (need >=42 for 55px+ full disc)`);
check(gh && gh.px >= 55, `GitHub VISIBLE diameter too small: ${gh && gh.px.toFixed(1)}px (need >=55px; others are 55-95px)`);
// All others should already be 55-95px; verify comparability: min/max ratio
const pxVals = sizes.map(s => s.px);
const mn = Math.min(...pxVals), mx = Math.max(...pxVals);
console.log(`minPx=${mn.toFixed(1)} maxPx=${mx.toFixed(1)} ratio=${(mn/mx).toFixed(2)}`);
check(mn >= 50, `smallest disc too small for comparability: ${mn.toFixed(1)}px`);
check(mn / mx >= 0.5, `discs not comparable (min/max ratio ${(mn/mx).toFixed(2)} < 0.5; GitHub stuck tiny?)`);

// VISIBLE colours + opacity proxy in LIGHT
api.setTheme("light");
check(documentStub.documentElement.getAttribute("data-theme") === "light", "setTheme(light) did not set data-theme=light");
const css = html;
check(css.includes("#ffffff") || css.includes("--bub"), "light tokens missing");
for (const b of bubbles) {
  const nm = b.getAttribute("data-name");
  const col = api.colors[nm];
  if (col === "currentColor") {
    check(b.getAttribute("data-ink") === "auto", `${nm} currentColor should use data-ink=auto (page ink, visible both themes)`);
  } else {
    check((b.style.color || "") === col, `${nm} colour not applied: got "${b.style.color}" want "${col}"`);
  }
}
console.log(`theme=light data-theme=${documentStub.documentElement.getAttribute("data-theme")} GitHubInk=${gh ? bubbles.find(b=>b.getAttribute("data-name")==="GitHub").getAttribute("data-ink") : "?"} status="${ids["status"].textContent}"`);

// DARK theme visible state
api.setTheme("dark");
check(documentStub.documentElement.getAttribute("data-theme") === "dark", "setTheme(dark) did not set data-theme=dark");
check(css.includes("#1c1c1f") && css.includes("#ededed"), "dark tokens #1c1c1f/#ededed missing from CSS");
check(ids["cluster"].hasAttribute("data-on"), "cluster lost data-on after theme switch (should stay visible)");
console.log(`theme=dark data-theme=${documentStub.documentElement.getAttribute("data-theme")} status="${ids["status"].textContent}"`);
// GitHub must still be readable in dark (currentColor -> --cink #ededed on #1c1c1f)
const ghEl = bubbles.find(b => b.getAttribute("data-name") === "GitHub");
check(ghEl && ghEl.getAttribute("data-ink") === "auto", "GitHub should stay data-ink=auto in dark (uses --cink, visible on dark surface)");
console.log(`dark GitHub sz=${gh.sz} px=${gh.px.toFixed(1)} ink=auto(--cink)`);
api.setTheme("light"); // restore

// Full-loop node identity + in-place replay
const before = bubbles.slice();
const beforeSet = new Set(before);
drain(10000, 50); // advance 10s of orbit
const orbitDegA = (ids["status"].textContent.match(/orbit\s+(\d+)/) || [])[1] || "?";
console.log(`pre-replay orbit=${orbitDegA}deg status="${ids["status"].textContent}"`);
api.replay();
const immediate = ids["status"].textContent || "";
console.log(`post-replay immediate status="${immediate}"`);
check(/^0\s*\/\s*7/.test(immediate), `replay should visibly reset status to 0/7, got "${immediate}"`);
check(ids["cluster"].hasAttribute("data-on"), "cluster missing data-on immediately after replay");
drain(1000, 16); // 1s after replay
const orbitDegB = parseInt(((ids["status"].textContent.match(/orbit\s+(\d+)/) || [])[1] || "999"), 10);
console.log(`1s-after-replay orbit=${orbitDegB}deg status="${ids["status"].textContent}"`);
check(orbitDegB < 30, `replay should visibly restart orbit angle (got ${orbitDegB}deg, want <30deg 1s after replay; angle barely changes = no visible replay)`);
drain(2500, 16); // finish entrance again
check(/7\s*\/\s*7/.test(ids["status"].textContent), `expected 7/7 after replayed entrance, got "${ids["status"].textContent}"`);
// Full 48s loop: same nodes, no rebuild
const midLoopRefs = api.bubbles.slice();
drain(48000, 200);
const after = api.bubbles;
check(after.length === 7, `after full loop bubble count changed: ${after.length}`);
const sameNodes = after.length === before.length && after.every((n, i) => n === before[i] && n === midLoopRefs[i]);
check(sameNodes, "full-loop node identity broken (nodes rebuilt instead of in-place updates)");
console.log(`full-loop identity=${sameNodes ? "same-7-nodes" : "REBUILT"} status="${ids["status"].textContent}"`);

// Zero innerHTML writes after init
check(innerHTMLWrites === 0, `expected zero innerHTML writes after init, got ${innerHTMLWrites}`);
console.log(`innerHTMLWrites=${innerHTMLWrites}`);

if (failures.length) {
  console.log(`FAIL file=${fpath} (${failures.length} checks failed)`);
  failures.forEach(f => console.log(` - ${f}`));
  process.exit(1);
} else {
  console.log(`PASS file=${fpath} GitHub=${gh.px.toFixed(1)}px light+dark OK full-loop identity OK innerHTML=0 replay-angle OK`);
}
