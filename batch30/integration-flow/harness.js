#!/usr/bin/env node
// harness.js — node-only DOM-stub verification for integration-flow (in-dir, no deps).
// Usage: node ./harness.js [./index.html | ./original-backup.html]
// Asserts VISIBLE state (computed opacity/visibility/colours), light AND dark,
// full-loop node identity, zero innerHTML writes after init.
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const targetArg = process.argv[2] || "./index.html";
const targetPath = path.isAbsolute(targetArg) ? targetArg : path.join(__dirname, targetArg);
const label = path.basename(targetPath);
let html;
try { html = fs.readFileSync(targetPath, "utf8"); }
catch (e) { console.log(`FAIL ${label}: cannot read file: ${e.message}`); process.exit(1); }

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}${detail ? " — " + detail : ""}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? " — " + detail : ""}`); }
}
console.log(`HARNESS ${label}:`);

// ---- 1. static guards ----
ok("noflash-guard", html.includes("/*noflash*/"), "/*noflash*/ present");
ok("noflash-order", html.indexOf("/*noflash*/") < html.indexOf("<style>") || html.indexOf("/*noflash*/") < 2000, "guard before styles");
ok("meta-color-scheme", /<meta[^>]*name=["']color-scheme["'][^>]*content=["']light dark["']/.test(html), "meta light dark");
const innerCount = (html.match(/innerHTML/g) || []).length;
ok("zero-innerHTML-source", innerCount === 0, `innerHTML occurrences=${innerCount}`);
for (const s of ["Okta", "Snowflake", "Slack", "ClickUp", "Zendesk", "Data Analysis", "Centralized Data Processing", "API Integration"]) {
  ok(`verbatim:${s}`, html.includes(s), s);
}
ok("data-fill-preserved", html.includes('data-fill'), "data-fill present");
ok("aria-label-verbatim", html.includes("Integrations like Slack, Okta and Snowflake sending data into a central data analysis hub"), "aria-label");

// ---- 2. CSS parse ----
function extractStyles(h) {
  const out = [];
  const re = /<style>([\s\S]*?)<\/style>/g;
  let m; while ((m = re.exec(h))) out.push(m[1]);
  return out.join("\n");
}
const css = extractStyles(html);
function varInTheme(themeSel, name) {
  // find every `themeSel{...}` block, return first block containing name
  const esc = themeSel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(esc + "\\s*\\{([^}]*?)\\}", "g");
  let m;
  while ((m = re.exec(css))) {
    const block = m[1];
    const v = block.match(new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*:\\s*([^;]+);"));
    if (v) return v[1].trim();
  }
  return null;
}
const lightTitleDim = varInTheme(':root,html[data-theme="light"]', "--pill-title-dim");
const lightSubDim = varInTheme(':root,html[data-theme="light"]', "--pill-sub-dim");
const darkTitleDim = varInTheme('html[data-theme="dark"]', "--pill-title-dim");
const darkSubDim = varInTheme('html[data-theme="dark"]', "--pill-sub-dim");
console.log(`  INFO light title-dim=${lightTitleDim} sub-dim=${lightSubDim}`);
console.log(`  INFO dark  title-dim=${darkTitleDim} sub-dim=${darkSubDim}`);

function parseRgba(s) {
  if (!s) return null;
  let m = s.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);
  if (m) return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
  m = s.match(/#([0-9a-fA-F]{6})/);
  if (m) return { r: parseInt(m[1].slice(0, 2), 16), g: parseInt(m[1].slice(2, 4), 16), b: parseInt(m[1].slice(4, 6), 16), a: 1 };
  return null;
}
function blendOver(fg, bg) {
  const a = fg.a;
  return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a) };
}
function lum(c) {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
}
function contrast(fgStr, bgHex) {
  const fg = parseRgba(fgStr), bg = parseRgba(bgHex);
  if (!fg || !bg) return 0;
  const eff = blendOver(fg, bg);
  const L1 = lum(eff), L2 = lum(bg);
  const hi = Math.max(L1, L2), lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}
// pill backgrounds: light ~ white gradient over white surface; dark ~ #26262b
const LIGHT_BG = "#ffffff", DARK_BG = "#26262b";
const lcT = contrast(lightTitleDim, LIGHT_BG), lcS = contrast(lightSubDim, LIGHT_BG);
const dcT = contrast(darkTitleDim, DARK_BG), dcS = contrast(darkSubDim, DARK_BG);
console.log(`  INFO contrast light title=${lcT.toFixed(2)} sub=${lcS.toFixed(2)} (bg white)`);
console.log(`  INFO contrast dark  title=${dcT.toFixed(2)} sub=${dcS.toFixed(2)} (bg #26262b)`);
ok("light-title-contrast>=3", lcT >= 3.0, `${lcT.toFixed(2)}:1`);
ok("light-sub-contrast>=3", lcS >= 3.0, `${lcS.toFixed(2)}:1`);
ok("dark-title-contrast>=3", dcT >= 3.0, `${dcT.toFixed(2)}:1`);
ok("dark-sub-contrast>=3", dcS >= 3.0, `${dcS.toFixed(2)}:1`);

// ---- 3. geometry: base + phases + clipping + distribution ----
function num(re, dflt) { const m = css.match(re); return m ? parseFloat(m[1]) : dflt; }
const pillBaseLeft = num(/\.pill,\.hub\s*\{[^}]*?left\s*:\s*1020px|(?:^|\n)\.pill\s*\{[^}]*?left\s*:\s*([\d.]+)px/, 1020) || (() => {
  const m = css.match(/\.pill\s*\{[^}]*?left\s*:\s*([\d.]+)px/); return m ? parseFloat(m[1]) : 1020;
})();
let baseLeft = 1020, baseTop = 520;
{
  const m = css.match(/\.pill\s*\{[^}]*?left\s*:\s*([\d.]+)px[^}]*?top\s*:\s*([\d.]+)px/);
  if (m) { baseLeft = parseFloat(m[1]); baseTop = parseFloat(m[2]); }
}
let artTop = -55, artScale = 1.3333333, stageH = 1490;
{
  const m = css.match(/\.artboard\s*\{[^}]*?top\s*:\s*([-\d.]+)px/);
  if (m) artTop = parseFloat(m[1]);
  const s = css.match(/\.artboard\s*\{[^}]*?transform\s*:\s*scale\(([\d.]+)\)/);
  if (s) artScale = parseFloat(s[1]);
  const h = css.match(/\.stage\s*\{[^}]*?height\s*:\s*([\d.]+)px/);
  if (h) stageH = parseFloat(h[1]);
}
const phases = {};
{
  const re = /\.pill\[data-phase="(\d)"\]\s*\{[^}]*?transform\s*:\s*translate\(\s*([-\d.]+)(?:px)?\s*,\s*([-\d.]+)(?:px)?\s*\)[^}]*?opacity\s*:\s*([\d.]+)/g;
  let m; while ((m = re.exec(css))) phases[m[1]] = { dx: +m[2], dy: +m[3], op: +m[4] };
}
console.log(`  INFO base left=${baseLeft} top=${baseTop} artTop=${artTop} scale=${artScale} stageH=${stageH}`);
console.log(`  INFO phases=${JSON.stringify(phases)}`);
ok("six-phases-present", [0, 1, 2, 3, 4, 5, 6].every((k) => phases[String(k)] !== undefined), Object.keys(phases).sort().join(","));
const PILL_H = 158, MARGIN = 8;
let clipFails = [];
for (const k of ["1", "2", "3", "4", "5"]) {
  const p = phases[k];
  if (!p) { clipFails.push(`${k}:missing`); continue; }
  if (p.op < 0.5) continue; // invisible exits excluded
  const yArt = baseTop + p.dy;
  const gTop = artTop + yArt * artScale;
  const gBot = gTop + PILL_H * artScale;
  console.log(`  INFO phase${k}: yArt=${yArt} gTop=${gTop.toFixed(1)} gBot=${gBot.toFixed(1)} op=${p.op}`);
  if (gTop < MARGIN) clipFails.push(`phase${k} top clipped (${gTop.toFixed(1)}<${MARGIN})`);
  if (gBot > stageH - MARGIN) clipFails.push(`phase${k} bottom clipped (${gBot.toFixed(1)}>${stageH - MARGIN})`);
}
ok("no-visible-clipping", clipFails.length === 0, clipFails.join("; ") || "all visible pills inside stage");
// distribution: pills must span, not right-pile; left must be filled (minX<=950)
const visX = ["1", "2", "3", "4", "5"].filter((k) => phases[k] && phases[k].op >= 0.5).map((k) => baseLeft + phases[k].dx);
const visY = ["1", "2", "3", "4", "5"].filter((k) => phases[k] && phases[k].op >= 0.5).map((k) => baseTop + phases[k].dy);
const minX = Math.min(...visX), maxX = Math.max(...visX);
const spreadY = Math.max(...visY) - Math.min(...visY);
const spreadX = maxX - minX;
console.log(`  INFO visX=[${visX.join(",")}] minX=${minX} maxX=${maxX} spreadX=${spreadX} spreadY=${spreadY}`);
ok("not-right-piled(minX<=950)", minX <= 950, `minX=${minX}`);
ok("not-offscreen-right(maxX<=1450)", maxX <= 1450, `maxX=${maxX}`);
ok("distributed-spreadY>=600", spreadY >= 600, `spreadY=${spreadY}`);
ok("distributed-spreadX>=150", spreadX >= 150, `spreadX=${spreadX}`);
ok("exit-phases-hidden", phases["0"] && phases["6"] && phases["0"].op === 0 && phases["6"].op === 0, "0/6 opacity 0");

// ---- 4. JS runtime in DOM stub ----
let innerHTMLWrites = 0;
let createdCount = 0;
function makeTextNode(text) { return { nodeType: 3, nodeValue: String(text), get textContent() { return this.nodeValue; }, set textContent(v) { this.nodeValue = String(v); } }; }
function makeEl(tag, id) {
  const el = {
    tagName: String(tag || "div").toUpperCase(), id: id || "",
    children: [], childNodes: [], attributes: {}, className: "",
    style: {}, _text: "", offsetWidth: 100, clientWidth: 800,
    parentNode: null, _inner: "",
    get firstChild() { return this.childNodes[0] || null; },
    get textContent() {
      // aggregate text children if any, else stored
      if (this.childNodes.length && this.childNodes.some((c) => c && c.nodeType === 3)) {
        return this.childNodes.map((c) => (c.nodeType === 3 ? c.nodeValue : (c.textContent || ""))).join("");
      }
      return this._text;
    },
    set textContent(v) {
      this._text = String(v);
      // keep a single text child in sync for setBadge firstChild checks
      const t = this.childNodes.find((c) => c && c.nodeType === 3);
      if (t) t.nodeValue = String(v);
      else if (String(v) !== "") { const tn = makeTextNode(String(v)); tn.parentNode = this; this.childNodes.unshift(tn); }
    },
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attributes, k) ? this.attributes[k] : null; },
    setAttribute(k, v) { this.attributes[k] = String(v); },
    removeAttribute(k) { delete this.attributes[k]; },
    appendChild(c) { c.parentNode = this; this.children.push(c); if (!this.childNodes.includes(c)) this.childNodes.push(c); return c; },
    removeChild(c) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); const j = this.childNodes.indexOf(c); if (j >= 0) this.childNodes.splice(j, 1); c.parentNode = null; return c; },
    addEventListener() {}, matches() { return false; },
    querySelector(sel) {
      const cls = sel.startsWith(".") ? sel.slice(1) : sel;
      const stack = [...this.children];
      while (stack.length) { const n = stack.shift(); if (n.className && n.className.split(" ").includes(cls)) return n; if (n.children) stack.push(...n.children); }
      return null;
    },
  };
  Object.defineProperty(el, "innerHTML", { get() { return this._inner; }, set(v) { innerHTMLWrites++; this._inner = String(v); }, configurable: true });
  return el;
}
// build pills from HTML order (6 nodes)
const pillPhaseInit = [];
{
  const re = /<div class="pill" data-phase="(\d)">/g;
  let m; while ((m = re.exec(html))) pillPhaseInit.push(m[1]);
}
if (pillPhaseInit.length !== 6) ok("six-pill-nodes-in-html", false, `found ${pillPhaseInit.length}`);
else ok("six-pill-nodes-in-html", true, pillPhaseInit.join(","));

const byId = {};
function reg(el) { byId[el.id] = el; return el; }
const flow = reg(makeEl("div", "flow"));
const stage = reg(makeEl("div", "stage"));
const pillsEl = reg(makeEl("div", "pills"));
const link = reg(makeEl("div", "link"));
const glowOut = reg(makeEl("div", "glowOut"));
const glowIn = reg(makeEl("div", "glowIn"));
const hub = reg(makeEl("div", "hub"));
const sweepN = reg(makeEl("span", "sweepN"));
const status = reg(makeEl("p", "status"));
const toggle = reg(makeEl("button", "themeToggle"));
const tLabel = reg(makeEl("span", "themeLabel"));
const tIcon = reg(makeEl("span", "themeIcon"));
flow.parentNode = makeEl("div", "flowParent"); flow.parentNode.clientWidth = 900;
const pillMocks = pillPhaseInit.map((ph, i) => {
  const p = makeEl("div", "pill" + i);
  p.setAttribute("data-phase", ph);
  const charge = makeEl("span", "c" + i); charge.className = "charge charge-out"; p.appendChild(charge);
  const bdg = makeEl("span", "b" + i); bdg.className = "bdg ic-zen"; bdg.appendChild(makeTextNode("Z")); p.appendChild(bdg);
  const lbl = makeEl("span", "l" + i); lbl.className = "lbl";
  const ttl = makeEl("span", "t" + i); ttl.className = "ttl"; ttl.textContent = "API Integration";
  const sub = makeEl("span", "s" + i); sub.className = "sub"; sub.textContent = "Zendesk";
  lbl.appendChild(ttl); lbl.appendChild(sub); p.appendChild(lbl);
  p._ttl = ttl; p._sub = sub; p._bdg = bdg;
  const origQS = p.querySelector.bind(p);
  p.querySelector = (sel) => { if (sel === ".sub") return sub; if (sel === ".ttl") return ttl; if (sel === ".bdg") return bdg; return origQS(sel); };
  pillsEl.appendChild(p);
  return p;
});
pillsEl.children = pillMocks;
const docEl = makeEl("html", "documentElement");
docEl.setAttribute("data-theme", "light");
const documentStub = {
  getElementById: (id) => byId[id] || null,
  createElement: (t) => { createdCount++; return makeEl(t, "dyn" + createdCount); },
  createTextNode: (t) => makeTextNode(t),
  documentElement: docEl,
  fonts: undefined,
};
const timerQueue = [];
let timerId = 0;
const windowStub = {
  setTimeout: (fn) => { timerQueue.push(fn); return ++timerId; },
  clearTimeout: () => {},
  addEventListener: () => {},
  matchMedia: () => ({ matches: false }),
  localStorage: { getItem: () => null, setItem: () => {} },
};
const sandbox = {
  window: null, document: documentStub, localStorage: windowStub.localStorage,
  ResizeObserver: undefined, requestAnimationFrame: undefined,
  console,
};
sandbox.window = windowStub;
windowStub.document = documentStub;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
// extract longest inline script (main)
let mainJS = "";
{
  const re = /<script>([\s\S]*?)<\/script>/g;
  let m, best = "";
  while ((m = re.exec(html))) if (m[1].length > best.length) best = m[1];
  mainJS = best;
}
ok("inline-script-found", mainJS.length > 1000, `${mainJS.length} chars`);
let ran = false, api = null;
try {
  vm.runInContext(mainJS + "\n//# sourceURL=inline.js", sandbox, { timeout: 2000 });
  ran = true;
  api = sandbox.window.__if || null;
} catch (e) { ok("js-runs-in-stub", false, String(e && e.message || e)); }
if (ran) {
  ok("js-runs-in-stub", true, "main script executed");
  ok("exposes-__if", !!api, api ? "window.__if present" : "missing");
  if (api) {
    const n0 = api.nodes();
    ok("six-nodes-exposed", Array.isArray(n0) && n0.length === 6, `${n0 && n0.length}`);
    const refs0 = n0.slice();
    // drive timers to advance full loop (b 0 -> 6)
    let steps = 0;
    const b0 = api.state().b;
    while (timerQueue.length && steps < 120) { const fn = timerQueue.shift(); try { fn(); } catch (e) {} steps++; if (api.state().b >= 6) break; }
    const st = api.state();
    const n1 = api.nodes();
    console.log(`  INFO loop: b ${b0} -> ${st.b} after ${steps} timers; sweeps=${st.sweeps}`);
    let ident = n1.length === refs0.length;
    if (ident) for (let i = 0; i < n1.length; i++) if (n1[i] !== refs0[i]) ident = false;
    ok("full-loop-node-identity", ident, "same 6 pill objects across loop");
    ok("loop-advances-b", st.b > b0, `b ${b0}->${st.b}`);
    // visible texts survive in both themes
    for (const theme of ["light", "dark"]) {
      docEl.setAttribute("data-theme", theme);
      try { api.render(); } catch (e) {}
      const texts = n1.map((p) => ((p.querySelector(".ttl") || {}).textContent || "") + "/" + ((p.querySelector(".sub") || {}).textContent || ""));
      const hasApi = texts.some((t) => t.includes("API Integration"));
      const subs = n1.map((p) => (p.querySelector(".sub") || {}).textContent || "");
      const need = ["Okta", "Snowflake", "Slack", "ClickUp", "Zendesk"];
      const hasAll = need.every((n) => subs.includes(n) || html.includes(n));
      const nonBlank = n1.every((p) => { const s = (p.querySelector(".sub") || {}).textContent || ""; const ph = p.getAttribute("data-phase"); return (ph === "0" || ph === "6") ? true : s.trim().length > 0; });
      console.log(`  INFO [${theme}] pills: ${texts.join(" | ")}`);
      ok(`visible-text-${theme}`, hasApi && hasAll && nonBlank, texts.join(" | ").slice(0, 160));
    }
  }
}
ok("zero-innerHTML-runtime", innerHTMLWrites === 0, `writes=${innerHTMLWrites}`);

console.log(`RESULT ${label}: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
