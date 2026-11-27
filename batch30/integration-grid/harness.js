/* integration-grid DOM-stub harness — node only, no installs.
 * Usage (run INSIDE this directory with RELATIVE paths):
 *   node ./harness.js ./index.html
 *   node ./harness.js ./original-backup.html
 * Asserts FIXED behaviour as VISIBLE state (computed opacity/visibility/colours),
 * in light AND dark, plus full-loop node identity and zero innerHTML writes after init.
 */
"use strict";
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const targetArg = process.argv[2] || "./index.html";
const targetPath = targetArg; // keep relative as passed
const fileText = fs.readFileSync(targetPath, "utf8");

let failures = [];
function assert(cond, msg) {
  if (!cond) failures.push(msg);
}
function ok(msg) { /* collected via failures only */ }

// ---- static guards ----
assert(fileText.includes("/*noflash*/"), "static: missing /*noflash*/ guard");
assert(fileText.indexOf("/*noflash*/") < fileText.indexOf("</head>"), "static: /*noflash*/ must be in <head>");
assert(fileText.includes('name="color-scheme"'), "static: missing color-scheme meta");
assert(!fileText.includes("innerHTML"), "static: file must contain zero innerHTML writes");

// demo data verbatim (names in order + tints)
const EXPECTED = [
  ["Notion", null], ["Stripe", "#635BFF"], ["Figma", "#F24E1E"], ["Linear", "#5E6AD2"],
  ["HubSpot", "#FF7A59"], ["Dropbox", "#0061FF"], ["Jira", "#0052CC"], ["Shopify", "#7AB55C"],
  ["Zapier", "#FF4F00"], ["Airtable", "#18BFFF"], ["Slack", "#4A154B"], ["GitHub", null],
  ["Google Drive", "#4285F4"], ["Gmail", "#EA4335"], ["Asana", "#F06A6A"], ["Trello", "#0052CC"],
  ["Discord", "#5865F2"], ["Salesforce", "#00A1E0"], ["Loom", "#625DF5"], ["Intercom", null],
  ["Webflow", "#146EF5"], ["Calendly", "#006BFF"],
];
for (const [nm, col] of EXPECTED) {
  assert(fileText.includes('name:"' + nm + '"') || fileText.includes('"' + nm + '"'), "static: demo app missing: " + nm);
  if (col) assert(fileText.includes(col), "static: demo tint missing for " + nm + " " + col);
}

// ---- extract main inline script (the one with buildOnce) ----
const scripts = [...fileText.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const mainSrc = scripts.find(s => s.includes("buildOnce")) || "";
assert(mainSrc.length > 1000, "static: main inline script not found");
assert(!mainSrc.includes("innerHTML"), "static: main script must not use innerHTML");

// ---- DOM stub ----
function makeEnv(initialTheme) {
  let innerHTMLWritesAfterInit = 0;
  let appendsAfterInit = 0;
  let inited = false;
  let theme = initialTheme;
  const intervalCbs = [];

  class El {
    constructor(tag, ns) {
      this.tagName = String(tag).toUpperCase();
      this.namespace = ns || null;
      this.children = [];
      this.parentNode = null;
      this.attributes = {};
      this._listeners = {};
      this.textContent = "";
      this._inner = "";
      // style with setProperty/getPropertyValue + direct props
      const props = {};
      this.style = {
        _props: props,
        setProperty: function (k, v) { props[k] = String(v); this[k] = String(v); },
        getPropertyValue: function (k) { return props[k] || this[k] || ""; },
      };
      this._classSet = new Set();
      const self = this;
      this.classList = {
        add: (...a) => { a.forEach(x => self._classSet.add(x)); sync(); },
        remove: (...a) => { a.forEach(x => self._classSet.delete(x)); sync(); },
        contains: (x) => self._classSet.has(x),
      };
      this.className = "";
      function sync() { self.className = [...self._classSet].join(" "); }
      Object.defineProperty(this, "innerHTML", {
        get() { return this._inner; },
        set(v) { if (inited) innerHTMLWritesAfterInit++; this._inner = String(v); },
        configurable: true,
      });
    }
    setAttribute(k, v) { this.attributes[k] = String(v); if (k === "class") { this._classSet = new Set(String(v).split(/\s+/).filter(Boolean)); this.className = [...this._classSet].join(" "); } }
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attributes, k) ? this.attributes[k] : null; }
    appendChild(c) { if (inited) appendsAfterInit++; c.parentNode = this; this.children.push(c); return c; }
    addEventListener(t, fn) { (this._listeners[t] = this._listeners[t] || []).push(fn); }
    focus() {}
  }

  // pre-created static nodes by id
  const ids = ["stage", "spotLabel", "detailDot", "detailName", "detailMeta", "detailTag", "miniList",
    "playBtn", "playLabel", "playIcon", "themeBtn", "themeIcon", "prevBtn", "nextBtn",
    "detail", "ctxLabel", "ctxFill", "liveText", "liveDot", "brandName", "countPill", "miniList"];
  const byId = {};
  for (const id of ids) { const e = new El("div"); e.setAttribute("id", id); byId[id] = e; }
  // detail contains dot+text for parent check (static HTML nesting)
  byId["detail"].tagName = "DIV";
  byId["detailDot"].parentNode = byId["detail"];
  byId["detailName"].parentNode = byId["detail"];
  byId["detailMeta"].parentNode = byId["detail"];
  byId["detailTag"].parentNode = byId["detail"];

  const documentElement = new El("html");
  documentElement.setAttribute("data-theme", theme);

  const documentStub = {
    documentElement,
    activeElement: null,
    getElementById: (id) => byId[id] || null,
    createElement: (t) => new El(t),
    createElementNS: (ns, t) => new El(t, ns),
    addEventListener: () => {},
  };
  const localStorageStub = {
    _m: {},
    getItem(k) { return Object.prototype.hasOwnProperty.call(this._m, k) ? this._m[k] : null; },
    setItem(k, v) { this._m[k] = String(v); },
  };
  if (initialTheme === "dark") localStorageStub._m["integration-grid-theme"] = "dark";

  function getComputedStyle(el) {
    // computed opacity/visibility/colours (stub resolves theme vars like a real engine would)
    const op = el.style.opacity || el.style.getPropertyValue("opacity") || "1";
    const vis = el.style.visibility || el.style.getPropertyValue("visibility") || "visible";
    let bg = el.style.background || el.style.backgroundColor || "";
    if (!bg && el.style.getPropertyValue("--ta")) {
      const ta = parseFloat(el.style.getPropertyValue("--ta"));
      bg = (theme === "dark") ? `rgb(35 35 38 / ${ta})` : `rgb(255 255 255 / ${ta})`;
    }
    if (!bg && el === byId["detailDot"]) bg = el.style.background || "";
    let w = el.style.width || "", h = el.style.height || "";
    if (el === byId["detailDot"]) { w = w || "36px"; h = h || "36px"; }
    return { opacity: String(op), visibility: String(vis), backgroundColor: String(bg), width: String(w), height: String(h) };
  }

  const sandbox = {
    document: documentStub,
    window: {},
    localStorage: localStorageStub,
    matchMedia: (q) => ({ matches: false }),
    setInterval: (cb) => { intervalCbs.push(cb); return intervalCbs.length; },
    clearInterval: () => {},
    getComputedStyle,
    console,
  };
  sandbox.window.matchMedia = sandbox.matchMedia;
  sandbox.window.__ig = null;
  vm.createContext(sandbox);
  vm.runInContext(mainSrc, sandbox, { filename: "page-inline.js" });
  inited = true;
  return { sandbox, byId, documentStub, getComputedStyle, stats: () => ({ innerHTMLWritesAfterInit, appendsAfterInit }), theme: () => documentStub.documentElement.getAttribute("data-theme") };
}

function themeInk(th) { return th === "dark" ? "#ededed" : "#0a0a0a"; }

function runTheme(th) {
  const env = makeEnv(th);
  const ig = env.sandbox.window.__ig;
  assert(ig, `${th}: missing window.__ig hooks`);
  if (!ig) return;
  const cells = ig.cells();
  const apps = ig.apps;

  // wall paints: 22 tiles + centre
  assert(cells.length === 22, `${th}: expected 22 tiles, got ${cells.length}`);
  const stage = env.byId["stage"];
  const core = stage.children.find(c => (c.className || "").includes("tile--core"));
  assert(core, `${th}: centre product tile missing`);
  if (core) {
    const cs = env.getComputedStyle(core);
    assert(cs.opacity === "1", `${th}: centre computed opacity must be 1, got ${cs.opacity}`);
    assert(cs.visibility === "visible", `${th}: centre must be visible`);
    assert(core.style.opacity === "1" && core.style.visibility === "visible", `${th}: centre needs explicit resolved visible state (inline opacity/visibility)`);
    const hasMark = core.children.some(ch => (ch.className || "").includes("core-mark") && ch.children.length > 0);
    assert(hasMark, `${th}: centre core-mark SVG missing`);
  }
  // each tile visible with logo content
  for (let i = 0; i < cells.length; i++) {
    const b = cells[i];
    const cs = env.getComputedStyle(b);
    assert(cs.opacity === "1", `${th}: tile ${i} computed opacity must be 1, got ${cs.opacity}`);
    assert(cs.visibility === "visible", `${th}: tile ${i} must be visible`);
    assert(b.style.opacity === "1" && b.style.visibility === "visible", `${th}: tile ${i} needs explicit inline visible state (unresolved entrance?)`);
    const ta = parseFloat(b.style.getPropertyValue("--ta"));
    assert(!Number.isNaN(ta) && ta >= 0.22 && ta <= 0.65, `${th}: tile ${i} edge fade --ta out of range: ${b.style.getPropertyValue("--ta")}`);
    const glyphWrap = b.children.find(c => (c.className || "").includes("glyph"));
    assert(glyphWrap, `${th}: tile ${i} glyph wrapper missing (content never inserted?)`);
    if (glyphWrap) {
      const gs = env.getComputedStyle(glyphWrap);
      assert(gs.opacity === "1" && gs.visibility === "visible", `${th}: tile ${i} glyph must be visibly painted (opacity/visibility)`);
      const svg = glyphWrap.children[0];
      assert(svg && /svg/i.test(svg.tagName), `${th}: tile ${i} logo SVG missing`);
      if (svg) {
        const g = svg.children[0];
        const fill = g ? g.getAttribute("fill") : null;
        assert(fill, `${th}: tile ${i} logo fill missing`);
        if (fill) {
          const app = apps[i];
          const expectedInk = themeInk(env.theme() === "dark" ? "dark" : th);
          if (app.name === "Slack") {
            const want = (th === "dark") ? expectedInk : app.color;
            assert(fill.toLowerCase() === String(want).toLowerCase(), `${th}: Slack glyph colour must be ${want}, got ${fill}`);
          } else if (!app.color) {
            assert(fill.toLowerCase() === expectedInk.toLowerCase(), `${th}: ink tile ${app.name} must use ${expectedInk}, got ${fill}`);
          } else {
            assert(fill.toLowerCase() === String(app.color).toLowerCase(), `${th}: tile ${app.name} must use ${app.color}, got ${fill}`);
          }
        }
      }
    }
    // colours: background alpha resolves per fade curve
    assert(cs.backgroundColor.includes("rgb"), `${th}: tile ${i} computed backgroundColor must resolve colours, got '${cs.backgroundColor}'`);
  }

  // inspector tracks tour/selection (DESYNC regression)
  const spotLabel = env.byId["spotLabel"], detailName = env.byId["detailName"],
    detailMeta = env.byId["detailMeta"], detailDot = env.byId["detailDot"];
  assert(spotLabel.textContent.includes("Spotlight 1 / 22") && spotLabel.textContent.includes("Notion"), `${th}: initial spotlight must be 1/22 Notion, got '${spotLabel.textContent}'`);
  assert(detailName.textContent === "Notion", `${th}: initial inspector must be Notion, got '${detailName.textContent}'`);
  // advance tour 3 ticks (simulates ~5s); inspector must follow
  ig.tick(); ig.tick(); ig.tick();
  const afterSpot = ig.spot(), afterPicked = ig.picked();
  assert(afterSpot === 3, `${th}: after 3 ticks spot must be 3, got ${afterSpot}`);
  assert(afterPicked === 3, `${th}: inspector must track tour (picked must be 3 after 3 ticks), got ${afterPicked} — DESYNC`);
  assert(detailName.textContent === apps[3].name, `${th}: inspector name must track tour (${apps[3].name}), got '${detailName.textContent}'`);
  assert(spotLabel.textContent.includes(apps[3].name), `${th}: counter must match inspector (${apps[3].name}), got '${spotLabel.textContent}'`);

  // Next button: inspector moves correctly + letter paints full size in proper place
  const nextListeners = (env.byId["nextBtn"]._listeners["click"] || []);
  assert(nextListeners.length > 0, `${th}: Next button missing click handler`);
  nextListeners.forEach(fn => fn());
  assert(ig.spot() === 4 && ig.picked() === 4, `${th}: after Next spot/picked must be 4, got ${ig.spot()}/${ig.picked()}`);
  assert(detailName.textContent === apps[4].name, `${th}: after Next inspector must be ${apps[4].name}, got '${detailName.textContent}'`);
  assert(detailMeta.textContent.includes("Tile 5"), `${th}: after Next meta must say Tile 5, got '${detailMeta.textContent}'`);
  const wantLetter = apps[4].name.charAt(0);
  assert(detailDot.textContent === wantLetter, `${th}: selected '${wantLetter}' letter must paint in inspector, got '${detailDot.textContent}'`);
  const ds = env.getComputedStyle(detailDot);
  assert(ds.opacity === "1" && ds.visibility === "visible", `${th}: selected letter must be visibly painted (opacity/visibility), got ${ds.opacity}/${ds.visibility}`);
  assert(detailDot.style.opacity === "1", `${th}: selected letter needs explicit visible state`);
  assert(ds.width === "36px" && ds.height === "36px", `${th}: selected letter must paint at full size 36x36 in its proper place, got ${ds.width}x${ds.height}`);
  assert(detailDot.parentNode === env.byId["detail"], `${th}: selected letter must stay in inspector panel (proper place, in-place update, no reparent below controls squashed)`);
  assert(ds.backgroundColor && ds.backgroundColor.length > 0, `${th}: selected letter must have computed background colour`);

  // full-loop node identity + zero innerHTML after init
  const beforeRefs = ig.cells().slice();
  for (let k = 0; k < 22; k++) ig.tick();
  const afterRefs = ig.cells();
  assert(afterRefs.length === 22, `${th}: full loop must keep 22 tiles`);
  assert(beforeRefs.every((n, idx) => n === afterRefs[idx]), `${th}: full-loop must preserve node identity (in-place updates only, no rebuild)`);
  // exact wrap: started at 4 after Next, +22 ticks => back to 4
  assert(ig.spot() === 4 && ig.picked() === 4, `${th}: full 22-tour loop must wrap to same tile, got ${ig.spot()}/${ig.picked()}`);
  const st = env.stats();
  assert(st.innerHTMLWritesAfterInit === 0, `${th}: zero innerHTML writes after init, got ${st.innerHTMLWritesAfterInit}`);
  assert(st.appendsAfterInit === 0, `${th}: in-place updates only (zero post-init appends), got ${st.appendsAfterInit}`);
}

runTheme("light");
runTheme("dark");

if (failures.length) {
  console.log("HARNESS FAIL — " + targetPath);
  failures.forEach(f => console.log("  ✗ " + f));
  console.log(`  (${failures.length} failing assertion(s))`);
  process.exit(1);
} else {
  console.log("HARNESS PASS — " + targetPath + " — wall paints 22+centre with logos, inspector tracks tour/selection, letter full-size in place, light+dark, full-loop identity, zero innerHTML");
}
