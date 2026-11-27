#!/usr/bin/env node
// model-menu ghost-row harness (in-dir DOM stub, node only).
// Usage: node ./harness.js [target.html]   (default ./index.html)
// FAILs when the 7th row (Llama, [data-last]) is ghosted (faint colour / opacity<1);
// PASSes when it paints at full strength in light AND dark, as computed VISIBLE state.
// Also asserts: noflash guard, demo data verbatim, Gemini selection moves band,
// full-loop node identity, zero innerHTML writes after init.
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const target = process.argv[2] || "./index.html";
const full = path.resolve(__dirname, target);
const html = fs.readFileSync(full, "utf8");

let failures = [];
let passes = [];
function ok(name, cond, detail) {
  if (cond) { passes.push(name); console.log(`  PASS ${name}${detail ? " — " + detail : ""}`); }
  else { failures.push(name); console.log(`  FAIL ${name}${detail ? " — " + detail : ""}`); }
}
console.log(`TARGET: ${target}`);

// ---- 1. noflash guard ----
ok("noflash-guard", html.includes("/*noflash*/"), "/*noflash*/ present");

// ---- 2. source has zero innerHTML writes ----
const innerCountSrc = (html.match(/innerHTML/g) || []).length;
ok("no-innerHTML-in-source", innerCountSrc === 0, `occurrences=${innerCountSrc}`);

// ---- 3. demo data verbatim ----
const EXPECTED = ["DeepSeek","GPT","Claude Opus","Gemini","Mistral Large","Qwen","Llama"];
let namesOk = true;
for (const n of EXPECTED) { if (!html.includes(`"${n}"`)) namesOk = false; }
ok("demo-data-verbatim", namesOk && html.includes('["DeepSeek","GPT","Claude Opus","Gemini","Mistral Large","Qwen","Llama"]'), "7 names verbatim");

// ---- 4. CSS: compute VISIBLE Llama treatment in light AND dark ----
const styleBlocks = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]);
const css = styleBlocks.join("\n");
function blockFor(sel) {
  const re = new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*\\{([^}]*)\\}", "m");
  const m = css.match(re);
  return m ? m[1] : null;
}
function varInBlock(blockSel, varName) {
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(esc(blockSel) + "\\s*\\{([^}]*)\\}", "g");
  let m, last = null;
  while ((m = re.exec(css)) !== null) {
    const body = m[1];
    const rv = new RegExp(esc(varName) + "\\s*:\\s*([^;]+);").exec(body);
    if (rv) last = rv[1].trim();
  }
  return last;
}
const lightInk = varInBlock(":root", "--row-ink");
const lightFaint = varInBlock(":root", "--row-faint");
const darkInk = varInBlock('html[data-theme="dark"]', "--row-ink");
const darkFaint = varInBlock('html[data-theme="dark"]', "--row-faint");
console.log(`  INFO light --row-ink=${lightInk} --row-faint=${lightFaint}`);
console.log(`  INFO dark  --row-ink=${darkInk} --row-faint=${darkFaint}`);

// Find all rules targeting [data-last]
const lastRules = [...css.matchAll(/\.mmn__row\[data-last\][^{\n]*\{([^}]*)\}/g)].map(m => m[0]);
console.log(`  INFO [data-last] rules found: ${lastRules.length}`);
lastRules.forEach((r, i) => console.log(`  INFO rule${i}: ${r.replace(/\s+/g, " ").slice(0, 220)}`));

const lastCssText = lastRules.join(" ").toLowerCase();
// Ghost signals: references faint token, hard-coded faint alphas, or opacity<1
const usesFaintVar = /--row-faint/.test(lastCssText);
const usesFaintAlpha = /rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0?\.(36|3[0-9]|2[0-9]|1[0-9])/.test(lastCssText) ||
                       /rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0?\.[0-4]/.test(lastCssText);
let opacityVal = null;
const om = lastCssText.match(/opacity\s*:\s*([0-9.]+)/);
if (om) opacityVal = parseFloat(om[1]);
const dimsName = usesFaintVar || usesFaintAlpha || /color\s*:/.test(lastCssText) && !/var\(\s*--row-ink/.test(lastCssText) && !/rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0?\.88/.test(lastCssText) && !/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0?\.92/.test(lastCssText) && /color/.test(lastCssText) && !/--strong/.test(lastCssText);
const dimsLogo = opacityVal !== null && opacityVal < 1;

// Resolve effective computed colour/opacity for Llama in each theme
function effectiveLlama() {
  // name colour: if a [data-last] name rule sets colour, use it; else inherits --row-ink
  let nameDecl = null;
  for (const r of lastRules) { if (/mmn__name/.test(r)) { const cm = r.match(/color\s*:\s*([^;}]+)/i); if (cm) nameDecl = cm[1].trim(); } }
  // logo opacity: if a [data-last] logo rule sets opacity use it else 1
  let logoOp = 1;
  for (const r of lastRules) { if (/mmn__logo/.test(r)) { const l = r.match(/opacity\s*:\s*([0-9.]+)/i); if (l) logoOp = parseFloat(l[1]); } }
  return { nameDecl, logoOp };
}
const eff = effectiveLlama();
console.log(`  INFO effective Llama name colour decl=${eff.nameDecl === null ? "(inherit --row-ink)" : eff.nameDecl} logo opacity=${eff.logoOp}`);
console.log(`  INFO computed light: text=${eff.nameDecl || lightInk} icon-opacity=${eff.logoOp} on white card`);
console.log(`  INFO computed dark:  text=${eff.nameDecl || darkInk} icon-opacity=${eff.logoOp} on dark card`);

ok("llama-light-visible", !usesFaintVar && !usesFaintAlpha && !(opacityVal !== null && opacityVal < 1) && (eff.nameDecl === null || /--row-ink|0?\.88|255.*0?\.92/i.test(eff.nameDecl)) && eff.logoOp >= 1,
  `name=${eff.nameDecl || lightInk} opacity=${eff.logoOp} (need full-strength light)`);
ok("llama-dark-visible", !usesFaintVar && !usesFaintAlpha && !(opacityVal !== null && opacityVal < 1) && (eff.nameDecl === null || /--row-ink|0?\.88|255.*0?\.92/i.test(eff.nameDecl)) && eff.logoOp >= 1,
  `name=${eff.nameDecl || darkInk} opacity=${eff.logoOp} (need full-strength dark)`);

// ---- 5. DOM-stub run: selection + node identity + zero innerHTML after init ----
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const mainJs = scripts.filter(s => s.includes("__modelMenu") || s.includes("mmnRows"))[0] || "";
ok("main-script-found", !!mainJs, `bytes=${mainJs.length}`);
if (mainJs) {
  let innerHTMLWrites = 0;
  function makeStyle() {
    const o = {};
    o.setProperty = (k, v) => { o[k] = String(v); };
    o.getPropertyValue = (k) => (k in o ? o[k] : "");
    return o;
  }
  function makeEl(tag) {
    const e = {
      tagName: String(tag).toUpperCase(), children: [], attributes: {}, style: makeStyle(),
      className: "", _text: "", listeners: {},
      setAttribute(k, v) { this.attributes[k] = String(v); },
      getAttribute(k) { return k in this.attributes ? this.attributes[k] : null; },
      removeAttribute(k) { delete this.attributes[k]; },
      hasAttribute(k) { return k in this.attributes; },
      appendChild(c) { this.children.push(c); return c; },
      addEventListener(t, f) { (this.listeners[t] = this.listeners[t] || []).push(f); },
      focus() {},
      click() { (this.listeners.click || []).forEach(f => f.call(this)); },
    };
    Object.defineProperty(e, "textContent", {
      get() { return this._text; },
      set(v) { this._text = String(v); this.children = []; },
    });
    Object.defineProperty(e, "innerHTML", {
      get() { return ""; },
      set(v) { innerHTMLWrites++; },
    });
    return e;
  }
  const ids = {};
  ["mmnRows", "statusLine", "playBtn", "themeBtn", "mmnTitle", "mmn"].forEach(id => { ids[id] = makeEl("div"); ids[id].id = id; });
  const docEl = makeEl("html");
  docEl.setAttribute("data-theme", "light");
  const sandboxDocument = {
    createElement: (t) => makeEl(t),
    createElementNS: (ns, t) => makeEl(t),
    createTextNode: (t) => ({ nodeType: 3, text: String(t) }),
    getElementById: (id) => ids[id] || null,
    documentElement: docEl,
  };
  const sandboxWindow = {
    matchMedia: () => ({ matches: false }),
    setInterval: () => 1,
    clearInterval: () => {},
  };
  const sandboxLocal = { _s: {}, getItem(k) { return this._s[k] || null; }, setItem(k, v) { this._s[k] = String(v); } };
  const sandbox = { document: sandboxDocument, window: sandboxWindow, localStorage: sandboxLocal, console };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  try {
    vm.runInContext(mainJs, sandbox, { filename: "component.js" });
    const hook = sandbox.window.__modelMenu || sandbox.__modelMenu;
    ok("hook-exposed", !!hook, "window.__modelMenu");
    if (hook) {
      ok("row-count-7", hook.rows && hook.rows.length === 7, `rows=${hook.rows && hook.rows.length}`);
      ok("names-verbatim-runtime", JSON.stringify(hook.names) === JSON.stringify(EXPECTED), hook.names && hook.names.join(","));
      // selection: Gemini (idx 3) click moves band + check
      const bandBefore = hook.band;
      hook.select(3, true);
      const at = hook.rowsBox.style["--at"] || hook.rowsBox.style.getPropertyValue("--at");
      ok("gemini-select-moves-band", hook.selected === 3 && String(at) === "3", `selected=${hook.selected} --at=${at}`);
      const hasCheck = hook.band && hook.band.children && hook.band.children.length >= 1;
      ok("band-check-present", !!hasCheck, `band children=${hook.band && hook.band.children.length}`);
      ok("band-node-stable", hook.band === bandBefore, "band identity");
      // full-loop node identity: snapshot, step through full walk cycle + all rows
      const snap = hook.rows.slice();
      const boxSnap = hook.rowsBox;
      for (let i = 0; i < hook.walk; i++) hook.tick();
      hook.select(6, false); hook.select(0, false); hook.select(1, false);
      let ident = hook.rows.length === snap.length && hook.rowsBox === boxSnap;
      for (let i = 0; i < snap.length && ident; i++) if (hook.rows[i] !== snap[i]) ident = false;
      ok("full-loop-node-identity", ident, `${snap.length} rows + container identical after walk+selects`);
      ok("zero-innerHTML-after-init", innerHTMLWrites === 0, `writes=${innerHTMLWrites}`);
    }
  } catch (e) {
    ok("stub-run-no-throw", false, String(e && e.stack || e).slice(0, 400));
  }
}

console.log(`\nRESULT: ${failures.length === 0 ? "ALL CHECKS PASSED" : "FAILURES: " + failures.join(", ")} (${passes.length} passed, ${failures.length} failed)`);
process.exit(failures.length === 0 ? 0 : 1);
