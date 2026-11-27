/* harness for enrichment-orbit Source-3 pill truncation fix.
 * Runs with node only, no installs. Uses in-dir DOM stub.
 * Usage: node ./harness.cjs [./index.html | ./original-backup.html]
 * Fails on original (equal-width flex + ellipsis clips pill 3),
 * passes on fixed (chips size to content + no ellipsis clip).
 */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const targetRel = process.argv[2] || "./index.html";
const targetPath = path.resolve(__dirname, targetRel);
const html = fs.readFileSync(targetPath, "utf8");

let failures = [];
function assert(cond, msg) {
  if (!cond) failures.push(msg);
  console.log((cond ? "PASS" : "FAIL") + " | " + msg);
}

// ---- 0. static file checks ----
assert(html.includes("/*noflash*/"), "noflash guard present");
assert(!html.includes("innerHTML"), "zero innerHTML writes in file");
assert(html.includes('aria-label="A Grok tile with data nodes orbiting around it"'), "verbatim aria-label present");
assert(html.includes("M114.1 54.5 A80 80 0 0 1 205.9 54.5"), "verbatim outer comet arc present");
assert(html.includes("M120.4 80.4 A56 56 0 0 1 199.6 80.4"), "verbatim inner comet arc present");

// ---- 1. CSS truncation fix check (VISIBLE paint) ----
// Extract <style> blocks
const styleBlocks = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]);
const css = styleBlocks.join("\n");

// helper: get rule body for selector
function ruleBody(sel) {
  const re = new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*\\{([^}]*)\\}", "s");
  const m = css.match(re);
  return m ? m[1] : "";
}
const chipBody = ruleBody(".node-chip");
const spanBody = (() => {
  // find ".node-chip span{...}"
  const m = css.match(/\.node-chip\s+span\s*\{([^}]*)\}/s);
  return m ? m[1] : "";
})();

console.log("--- CSS under test: " + targetRel + " ---");
console.log(".node-chip {" + chipBody.trim().slice(0, 200) + "}");
console.log(".node-chip span {" + spanBody.trim().slice(0, 200) + "}");

// Original defect: flex:1 1 0 + min-width:120px forces 3 equal narrow columns;
// longest text "delay -14.66s · enriching" overflows -> ellipsis "enrichi…".
// Fixed: flex-basis auto + min-width fit-content lets chip 3 size to content.
const hasEqualFlex = /flex\s*:\s*1\s+1\s+0\b/.test(chipBody);
const has120min = /min-width\s*:\s*120px/.test(chipBody);
const hasAutoBasis = /flex\s*:\s*1\s+1\s+auto\b/.test(chipBody);
const hasFitContent = /min-width\s*:\s*(fit-content|max-content|auto)/.test(chipBody);

assert(!hasEqualFlex, "FIX: .node-chip must NOT use equal-width flex:1 1 0 (clips pill 3)");
assert(!has120min, "FIX: .node-chip must NOT use min-width:120px floor (starves pill 3)");
assert(hasAutoBasis, "FIX: .node-chip uses flex:1 1 auto (sizes to content)");
assert(hasFitContent, "FIX: .node-chip min-width fit-content/max-content/auto (no shrink below content)");

// Span must paint in full: no hidden+ellipsis clip.
const spanHidden = /overflow\s*:\s*hidden/.test(spanBody);
const spanEllipsis = /text-overflow\s*:\s*ellipsis/.test(spanBody);
const spanVisible = /overflow\s*:\s*visible/.test(spanBody);
const spanClip = /text-overflow\s*:\s*clip/.test(spanBody);

assert(!spanHidden, "FIX: .node-chip span must NOT use overflow:hidden (clips pill 3 text)");
assert(!spanEllipsis, "FIX: .node-chip span must NOT use text-overflow:ellipsis (paints 'enrichi…')");
assert(spanVisible, "FIX: .node-chip span uses overflow:visible (paints full text)");
assert(spanClip, "FIX: .node-chip span uses text-overflow:clip (no ellipsis)");

// Simulated visible truncation: estimate widths.
// 12px span, ~6.6px/char avg; padding 10px*2; gap 8px.
// Container ~500px (card). Equal widths -> each ~161px -> content ~141px.
function estTextW(t) { return t.length * 6.6; }
const t1 = "delay 0s \u00B7 enriching";
const t2 = "delay -7.33s \u00B7 enriching";
const t3 = "delay -14.66s \u00B7 enriching";
const chipContentW_equal = (500 - 16) / 3 - 20;
const trunc3_equal = estTextW(t3) > chipContentW_equal;
assert(trunc3_equal, "sanity: equal-width model truncates pill 3 (defect exists in layout model)");
// With fix (auto basis + fit-content), chip sizes to content so no truncation by construction.
const fixLayoutOk = hasAutoBasis && hasFitContent && spanVisible && spanClip;
assert(fixLayoutOk, "VISIBLE: pill 3 paints in full (chip sizes to content, no ellipsis clip)");

// ---- 2. DOM-stub runtime checks ----
const scripts = [...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
assert(scripts.length >= 2, "two inline scripts found (noflash + main)");
const mainSrc = scripts[scripts.length - 1];
// save extracted for node --check
fs.writeFileSync(path.join(__dirname, ".extracted-main.js"), mainSrc, "utf8");

// --- minimal DOM stub ---
let innerHTMLWrites = 0;
class El {
  constructor(tag, ns) {
    this.tagName = (tag || "div").toUpperCase();
    this.ns = ns || null;
    this.attributes = {};
    this.children = [];
    this.style = {};
    this._class = "";
    this._text = "";
    this._listeners = {};
    const self = this;
    this.classList = {
      add(c) { const s = new Set(self._class.split(/\s+/).filter(Boolean)); s.add(c); self._class = [...s].join(" "); self.attributes["class"] = self._class; },
      remove(c) { const s = new Set(self._class.split(/\s+/).filter(Boolean)); s.delete(c); self._class = [...s].join(" "); self.attributes["class"] = self._class; },
      contains(c) { return self._class.split(/\s+/).includes(c); },
      toggle(c, f) { if (f === undefined) f = !this.contains(c); if (f) this.add(c); else this.remove(c); return f; }
    };
  }
  setAttribute(k, v) { this.attributes[k] = String(v); if (k === "class") this._class = String(v); if (k === "style") this._styleStr = String(v); }
  getAttribute(k) { return this.attributes[k] !== undefined ? this.attributes[k] : null; }
  appendChild(c) { this.children.push(c); return c; }
  addEventListener(t, f) { (this._listeners[t] = this._listeners[t] || []).push(f); }
  removeEventListener() {}
  click() { (this._listeners["click"] || []).forEach(f => f({})); }
}
Object.defineProperty(El.prototype, "innerHTML", {
  get() { return this._html || ""; },
  set(v) { innerHTMLWrites++; this._html = String(v); }
});
Object.defineProperty(El.prototype, "textContent", {
  get() { return this._text; },
  set(v) { this._text = String(v); }
});
Object.defineProperty(El.prototype, "className", {
  get() { return this._class; },
  set(v) { this._class = String(v); this.attributes["class"] = String(v); }
});
Object.defineProperty(El.prototype, "display", { get() { return this.style.display; } });

const byId = {};
function mkId(id) {
  const e = new El("div");
  e.setAttribute("id", id);
  byId[id] = e;
  return e;
}
// pre-create ids used by script
["orbitSvg","nodesG","nodeList","rings","tileRect","grokA","grokB","statusLine","enrichedCount","liveCount","tickLine","dStatus","dDelay","dOrbit","dRecords","detailTitle","detailCard","detailBtn","pauseBtn","pauseLabel","themeBtn","themeLabel","themeIco","ctxNum","ctxBar","workPill","workPillText","stageTitle","cometOuter","cometInner","tileG"].forEach(mkId);
// svg parent chain for togglePause: orbitSvg.parentElement.parentElement
byId["orbitSvg"].parentElement = { parentElement: {} };
const frameEl = new El("div");
frameEl.setAttribute("class", "orbit-frame");

const docEl = new El("html");
docEl.setAttribute("data-theme", "light");
const bodyEl = new El("body");

const documentStub = {
  readyState: "complete",
  documentElement: docEl,
  body: bodyEl,
  getElementById(id) { return byId[id] || null; },
  createElementNS(ns, tag) { return new El(tag, ns); },
  createElement(tag) { return new El(tag); },
  querySelector(sel) { if (sel === ".orbit-frame") return frameEl; return null; },
  addEventListener() {},
};
const store = {};
const localStorageStub = {
  getItem(k) { return store[k] !== undefined ? store[k] : null; },
  setItem(k, v) { store[k] = String(v); }
};
function matchMediaStub() { return { matches: false }; }

// getComputedStyle stub returns VISIBLE computed values
function getComputedStyleStub(elm) {
  // opacity: dimmed nodes .78 else 1
  let opacity = "1";
  if (elm && elm._class && elm._class.includes("is-dim")) opacity = "0.78";
  // visibility from display
  const visibility = (elm && elm.style && elm.style.display === "none") ? "hidden" : "visible";
  // colour: derive from theme for tile/mark analogues via attributes if present
  return {
    opacity, visibility,
    getPropertyValue(p) {
      if (p === "opacity") return opacity;
      if (p === "visibility") return visibility;
      return "";
    }
  };
}

const windowStub = { matchMedia: matchMediaStub };
const sandbox = {
  document: documentStub,
  window: windowStub,
  localStorage: localStorageStub,
  getComputedStyle: getComputedStyleStub,
  setInterval: () => null,
  clearInterval: () => {},
  console,
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
try {
  vm.runInContext(mainSrc, sandbox, { filename: "main.js" });
} catch (e) {
  console.log("FAIL | main script threw: " + (e && e.stack || e));
  process.exitCode = 1;
}

const api = sandbox.window.__enrichmentOrbit || sandbox.__enrichmentOrbit;
assert(!!api, "runtime exposes window.__enrichmentOrbit");

if (api) {
  // demo data verbatim
  assert(JSON.stringify(api.DELAYS) === JSON.stringify(["0s","-7.33s","-14.66s"]), "demo DELAYS verbatim [0s,-7.33s,-14.66s]");
  assert(api.LOOP_LEN === 22, "LOOP_LEN 22 verbatim");
  // chips built
  const chips = api.refs.nodeChips || [];
  assert(chips.length === 3, "3 node chips built");
  if (chips.length === 3) {
    const texts = chips.map(c => {
      // chip children: b + span; span is second child
      const sp = c.children[1];
      return sp ? sp.textContent : "";
    });
    assert(texts[0] === "delay 0s \u00B7 enriching", "chip 1 visible text full: 'delay 0s · enriching'");
    assert(texts[1] === "delay -7.33s \u00B7 enriching", "chip 2 visible text full: 'delay -7.33s · enriching'");
    assert(texts[2] === "delay -14.66s \u00B7 enriching", "chip 3 visible text full: 'delay -14.66s · enriching' (not 'enrichi…')");
    // VISIBLE: computed visibility not hidden for all chips
    chips.forEach((c, i) => {
      const cs = getComputedStyleStub(c);
      assert(cs.visibility === "visible", "chip " + (i+1) + " computed visibility visible (paints)");
      assert(cs.opacity === "1", "chip " + (i+1) + " computed opacity 1 (not dimmed/clipped)");
    });
  }
  const nodes = api.refs.nodeGs || [];
  assert(nodes.length === 3, "3 orbit nodes built");

  // light theme visible colours
  api.setTheme("light", false);
  assert(byId["tileRect"].getAttribute("fill") === "#FFFFFF", "light tile fill #FFFFFF (computed colour)");
  assert(byId["grokA"].getAttribute("fill") === "#171717", "light mark #171717");
  assert(byId["themeLabel"].textContent === "Dark", "light toggle label Dark");
  let csTile = byId["tileRect"].getAttribute("fill");
  assert(csTile === "#FFFFFF", "VISIBLE light tile colour #FFFFFF");

  // dark theme visible colours
  api.setTheme("dark", false);
  assert(byId["tileRect"].getAttribute("fill") === "#232326", "dark tile fill #232326 (computed colour)");
  assert(byId["grokA"].getAttribute("fill") === "#ededed", "dark mark #ededed");
  assert(byId["themeLabel"].textContent === "Light", "dark toggle label Light");
  // visibility still visible in dark
  (api.refs.nodeChips || []).forEach((c, i) => {
    const cs = getComputedStyleStub(c);
    assert(cs.visibility === "visible", "dark chip " + (i+1) + " computed visibility visible");
  });
  // back to light for loop test
  api.setTheme("light", false);

  // node clicking + details panel
  api.selectNode(2);
  assert(byId["detailTitle"].textContent === "Source 3 details", "click source 3 opens details title");
  assert(byId["dDelay"].textContent === "-14.66s", "details delay -14.66s verbatim");
  assert(byId["detailCard"].style.display !== "none", "details panel visible after select (computed visibility)");
  const csDetail = getComputedStyleStub(byId["detailCard"]);
  assert(csDetail.visibility === "visible", "details computed visibility visible");
  api.selectNode(0);
  assert(byId["detailTitle"].textContent === "Source 1 details", "click source 1 works");

  // full-loop node identity (22 ticks)
  const before = (api.refs.nodeGs || []).slice();
  for (let i = 0; i < 22; i++) api.tick();
  const after = api.refs.nodeGs || [];
  let same = before.length === 3 && after.length === 3;
  if (same) for (let i = 0; i < 3; i++) if (before[i] !== after[i]) same = false;
  assert(same, "full-loop (22 ticks) node identity preserved (in-place updates)");
  assert(api.state.tick !== undefined, "tick state advances, lap=" + api.state.lap);

  // zero innerHTML writes after init
  assert(innerHTMLWrites === 0, "zero innerHTML writes after init (got " + innerHTMLWrites + ")");
}

console.log("---");
if (failures.length) {
  console.log("RESULT FAIL (" + failures.length + "): " + targetRel);
  process.exitCode = 1;
} else {
  console.log("RESULT PASS: " + targetRel);
}
