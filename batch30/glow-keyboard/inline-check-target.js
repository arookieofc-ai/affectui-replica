
(function(){
"use strict";
var PROMPTS=["Find a quiet hike near Zermatt","Plan a sunrise climb for Saturday","What should I pack for two days?"];
var PLACEHOLDER="Ask AI anything...";
var KEYS=[["Escape","esc",24,24,149,56,"mod sm"],["F1","F1",183,24,96,56,"fkey"],["F2","F2",289,24,96,56,"fkey"],["F3","F3",395,24,96,56,"fkey"],["F4","F4",501,24,96,56,"fkey"],["F5","F5",607,24,96,56,"fkey"],["F6","F6",713,24,96,56,"fkey"],["F7","F7",819,24,96,56,"fkey"],["F8","F8",925,24,96,56,"fkey"],["F9","F9",1031,24,96,56,"fkey"],["F10","F10",1137,24,96,56,"fkey"],["F11","F11",1243,24,96,56,"fkey"],["F12","F12",1349,24,96,56,"fkey"],["","","1455",24,96,56,"touchid"],["^","^",24,90,96,96,""],["1","1",130,90,96,96,""],["2","2",236,90,96,96,""],["3","3",342,90,96,96,""],["4","4",448,90,96,96,""],["5","5",554,90,96,96,""],["6","6",660,90,96,96,""],["7","7",766,90,96,96,""],["8","8",872,90,96,96,""],["9","9",978,90,96,96,""],["0","0",1084,90,96,96,""],["ß","ß",1190,90,96,96,""],["´","´",1296,90,96,96,""],["Backspace","⌫",1402,90,149,96,"mod"],["Tab","⇥",24,196,149,96,"mod"],["q","q",183,196,96,96,""],["w","w",289,196,96,96,""],["e","e",395,196,96,96,""],["r","r",501,196,96,96,""],["t","t",607,196,96,96,""],["z","z",713,196,96,96,""],["u","u",819,196,96,96,""],["i","i",925,196,96,96,""],["o","o",1031,196,96,96,""],["p","p",1137,196,96,96,""],["ü","ü",1243,196,96,96,""],["+","+",1349,196,96,96,""],["Enter","↩",1455,196,96,202,"mod enter"],["CapsLock","⇪",24,302,149,96,"mod"],["a","a",183,302,96,96,""],["s","s",289,302,96,96,""],["d","d",395,302,96,96,""],["f","f",501,302,96,96,""],["g","g",607,302,96,96,""],["h","h",713,302,96,96,""],["j","j",819,302,96,96,""],["k","k",925,302,96,96,""],["l","l",1031,302,96,96,""],["ö","ö",1137,302,96,96,""],["ä","ä",1243,302,96,96,""],["#","#",1349,302,96,96,""],["ShiftLeft","⇧",24,408,122.5,96,"mod"],["","<",156.5,408,96,96,""],["y","y",262.5,408,96,96,""],["x","x",368.5,408,96,96,""],["c","c",474.5,408,96,96,""],["v","v",580.5,408,96,96,""],["b","b",686.5,408,96,96,""],["n","n",792.5,408,96,96,""],["m","m",898.5,408,96,96,""],[",",",",1004.5,408,96,96,""],[".",".",1110.5,408,96,96,""],["-","-",1216.5,408,96,96,""],["ShiftRight","⇧",1322.5,408,228.5,96,"mod"],["Fn","fn",24,514,96,96,"mod sm"],["ControlLeft","⌃",130,514,96,96,"mod"],["AltLeft","⌥",236,514,96,96,"mod"],["MetaLeft","⌘",342,514,122.5,96,"mod"],["Space","",474.5,514,520,96,"space"],["MetaRight","⌘",1004.5,514,122.5,96,"mod"],["AltRight","⌥",1137,514,96,96,"mod"],["ArrowLeft","←",1243,514,96,96,"mod arrow"],["ArrowUp","↑",1349,514,96,45.5,"mod arrow half"],["ArrowDown","↓",1349,564.5,96,45.5,"mod arrow half"],["ArrowRight","→",1455,514,96,96,"mod arrow"]];
// floor anchors (same scene geometry as demo, own wave code below)
var BIG={k:1,v1:[926.8,565.8],c:[302.1,297.3],l:[291.3,291.3],bottom:1222.8,r:[3155.8,361.3],v4:[2493.8,565.8],v3:[2189.3,565.8],m2:[1898.8,428.8],m1:[1510.8,428.8],v2:[1230.8,565.8]};
var SMALL={k:0.8427,v1:[781.039,476.815],c:[254.588,250.543],l:[245.486,245.486],bottom:1030.49,r:[2659.48,304.477],v4:[2101.59,476.815],v3:[1844.98,476.815],m2:[1600.17,361.361],m1:[1273.19,361.361],v2:[1037.23,476.815]};
var SPOT={x:581.3,y:461.7}, SPOT2={x:310.5,y:676.5};
var LOOP_MS=6000, FRAME_GAP=32, AMP=60, VAMP=45;
function $(id){return document.getElementById(id);}
var root=$("gk"), frame=$("gk-frame"), board=$("gk-board"), input=$("gk-input"),
    field=$("gk-field"), composer=$("gk-composer"), hard=$("gk-hard"),
    colorPath=$("floor-color-path"), lightPath=$("floor-light-path"),
    colorSvg=$("floor-color-svg"), lightSvg=$("floor-light-svg"),
    log=$("gk-log"), statusEl=$("gk-status"), submitsEl=$("gk-submits"),
    loopEl=$("loop-count"), visEl=$("gk-visible");
var SVGNS="http://www.w3.org/2000/svg";
var reduced=false;
try{reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;}catch(e){}
var alive=true, userTookOver=false, visible=true, started=false, rafId=0, lastFrame=0;
var keyByCode=new Map(), downAt=new Map(), ripples=[], submits=0, loopsDone=0;
// --- build keys once (in-place thereafter) ---
function unit(v){return "calc("+v+" * var(--u))";}
function buildKeys(){
  var frag=document.createDocumentFragment();
  for(var k=0;k<KEYS.length;k++){
    var code=KEYS[k][0], label=KEYS[k][1], x=KEYS[k][2], y=KEYS[k][3], w=KEYS[k][4], h=KEYS[k][5], cls=KEYS[k][6];
    var s=document.createElement("span");
    s.className="gk-key"+(cls?" "+cls.split(" ").filter(Boolean).map(function(c){return "gk-key--"+c;}).join(" "):"");
    if(code){s.setAttribute("data-k",code);keyByCode.set(code,s);}
    s.style.left=unit(x);s.style.top=unit(y);s.style.width=unit(w);s.style.height=unit(h);
    if(label){s.textContent=label;}
    frag.appendChild(s);
  }
  board.appendChild(frag);
}
function floorD(g,t){
  function wob(ph){return AMP*Math.sin(t+ph);}
  function vwob(ph){return VAMP*Math.sin(t+ph);}
  function Y(pt,off){return (pt[1]+off*g.k).toFixed(1);}
  return "M"+g.v1[0]+" "+Y(g.v1,vwob(Math.PI/2+0.25))+"C"+g.v1[0]+" "+Y(g.v1,vwob(Math.PI/2+0.25))+" "+g.c[0]+" "+Y(g.c,wob(0))+" "+g.l[0]+" "+Y(g.l,wob(0))+"V"+g.bottom+"H"+g.r[0]+"V"+Y(g.r,wob(1))+"L"+g.v4[0]+" "+Y(g.v4,vwob(-Math.PI/2+0.75))+"H"+g.v3[0]+"V"+Y(g.v3,vwob(-Math.PI/2+0.75))+"L"+g.m2[0]+" "+Y(g.m2,-60*Math.sin(t+0.5))+"H"+g.m1[0]+"V"+Y(g.m1,-60*Math.sin(t+0.5))+"L"+g.v2[0]+" "+Y(g.v2,vwob(Math.PI/2+0.25))+"H"+g.v1[0]+"V"+Y(g.v1,vwob(Math.PI/2+0.25))+"Z";
}
function rippleLife(ms){
  if(ms<160){return Math.sin(Math.PI/2*(ms/160));}
  if(ms<1360){return 0.5*(1+Math.cos(Math.PI*(ms-160)/1200));}
  return -1;
}
function glowMix(){
  // phase of the 6s hard-glow swap: 0..1
  var t=0;
  try{
    var anims=hard.getAnimations?hard.getAnimations({subtree:true}):[];
    for(var i=0;i<anims.length;i++){if(anims[i].animationName==="gk-swap"){t=Number(anims[i].currentTime||0);break;}}
  }catch(e){t=(Date.now()%LOOP_MS);}
  var ph=(1-Math.cos(2*Math.PI*((t%LOOP_MS)/LOOP_MS)))/2;
  return ph;
}
function spawnRipple(frac){
  if(reduced||!visible){return;}
  var scale=1;
  try{scale=frame.clientWidth/2200||1;}catch(e){}
  void scale;
  var cEl=document.createElementNS(SVGNS,"ellipse");
  cEl.setAttribute("fill","url(#gk-floor-grad)");
  cEl.setAttribute("rx","230");cEl.setAttribute("ry","320");
  cEl.setAttribute("cx",String(120+frac*1960+SPOT.x));
  cEl.setAttribute("cy",String(1361.7-SPOT.y));
  var lEl=document.createElementNS(SVGNS,"ellipse");
  lEl.setAttribute("fill","#ffffff");lEl.setAttribute("fill-opacity","0.8");
  lEl.setAttribute("rx","200");lEl.setAttribute("ry","260");
  lEl.setAttribute("cx",String(120+frac*1960+SPOT2.x));
  lEl.setAttribute("cy",String(1401.7-SPOT2.y));
  colorSvg.appendChild(cEl);lightSvg.appendChild(lEl);
  var nowFn=(window.performance&&window.performance.now)?window.performance.now.bind(window.performance):Date.now;
  ripples.push({c:cEl,l:lEl,t0:nowFn()});
  if(ripples.length>14){var old=ripples.shift();old.c.remove();old.l.remove();}
}
function spawnHit(frac){
  if(reduced||!visible){return;}
  var mix=glowMix();
  var r=Math.round(119*(1-mix)), a=Math.round(85*mix);
  var u=1;
  try{u=(frame.clientWidth||2200)/2200;}catch(e){}
  var d=document.createElement("div");
  d.className="gk-hit";
  d.style.left=((578.36+frac*1037.79-170)*u)+"px";
  d.style.background="radial-gradient(closest-side, rgba(255,"+r+","+a+",.95), rgba(255,"+r+","+a+",0))";
  composer.insertBefore(d,hard);
  var done=function(){if(d.parentNode===composer){composer.removeChild(d);}};
  try{
    if(d.animate){
      var an=d.animate([{opacity:0,transform:"scale(.8,1)"},{opacity:.6,transform:"translateY(-2px) scale(1.1,1.35)",offset:.15},{opacity:0,transform:"scale(1.2,1.15)"}],{duration:1100,easing:"ease-out"});
      an.onfinish=done;
      window.setTimeout(done,1300);
    }else{window.setTimeout(done,1100);}
  }catch(e){window.setTimeout(done,1100);}
}
function press(code){
  var el=keyByCode.get(code);
  if(!el){return;}
  el.setAttribute("data-down","");
  var nowFn=(window.performance&&window.performance.now)?window.performance.now.bind(window.performance):Date.now;
  downAt.set(code,nowFn());
}
function release(code){
  var el=keyByCode.get(code);
  if(!el){return;}
  var nowFn=(window.performance&&window.performance.now)?window.performance.now.bind(window.performance):Date.now;
  var held=Math.max(0,150-(nowFn()-(downAt.get(code)||0)));
  downAt.delete(code);
  window.setTimeout(function(){if(!downAt.has(code)){el.removeAttribute("data-down");}},held);
}
function releaseAll(){Array.from(downAt.keys()).forEach(release);}
function keyFrac(code){
  var el=keyByCode.get(code);
  if(!el){return 0.5;}
  var n=0, total=keyByCode.size, i=0;
  keyByCode.forEach(function(v,k){if(k===code){n=i;}i++;});
  return total<=1?0.5:n/(total-1);
}
function fireKey(code){
  if(!visible){return;}
  var f=keyFrac(code);
  spawnRipple(0.06+f*0.88);
  spawnHit(0.06+f*0.88);
}
function setInput(v){
  if(input.value!==v){input.value=v;}
  input.scrollLeft=input.scrollWidth;
  if(field){field.classList.toggle("has-text",v.length>0);}
  try{input.dispatchEvent(new Event("input",{bubbles:true}));}catch(e){}
  if(visEl){visEl.textContent=v?("“"+v+"”"):"–";}
}
function rand(a,b){return a+Math.random()*(b-a);}
function wait(ms){return new Promise(function(res){window.setTimeout(res,ms);});}
function stopped(){return !alive||userTookOver;}
var CODE_OF={ShiftLeft:"ShiftLeft",ShiftRight:"ShiftRight",ControlLeft:"ControlLeft",ControlRight:"ControlLeft",AltLeft:"AltLeft",AltRight:"AltRight",MetaLeft:"MetaLeft",MetaRight:"MetaRight",OSLeft:"MetaLeft",OSRight:"MetaRight",Space:"Space",Backspace:"Backspace",Delete:"Backspace",Tab:"Tab",Enter:"Enter",NumpadEnter:"Enter",CapsLock:"CapsLock",Escape:"Escape",ArrowLeft:"ArrowLeft",ArrowRight:"ArrowRight",ArrowUp:"ArrowUp",ArrowDown:"ArrowDown"};
var DE_OF={Minus:"ß",Equal:"´",BracketLeft:"ü",BracketRight:"+",Semicolon:"ö",Quote:"ä",Backslash:"#",Comma:",",Period:".",Slash:"-",Backquote:"^",IntlBackslash:"^",KeyY:"z",KeyZ:"y"};
var knownKeys=new Set(KEYS.map(function(k){return k[0];}).filter(Boolean));
function mapEvent(e){
  if(e&&e.code&&CODE_OF[e.code]){return CODE_OF[e.code];}
  if(e&&e.code&&/^F([1-9]|1[0-2])$/.test(e.code)){return e.code;}
  var k=e?e.key:null;
  if(typeof k==="string"&&k.length===1&&knownKeys.has(k.toLowerCase())){return k.toLowerCase();}
  if(e&&e.code&&/^Digit\d$/.test(e.code)){return e.code.slice(5);}
  if(e&&e.code&&DE_OF[e.code]){return DE_OF[e.code];}
  if(e&&e.code&&/^Key[A-Z]$/.test(e.code)){return e.code.slice(3).toLowerCase();}
  return null;
}
function submitNow(){
  var v=input.value.trim();
  if(v){
    var li=document.createElement("li");
    var who=document.createElement("span");
    who.className="who";who.textContent="you";
    li.appendChild(who);
    li.appendChild(document.createTextNode(v));
    while(log.children.length>=4){log.removeChild(log.firstChild);}
    log.appendChild(li);
  }
  setInput("");
  submits++;
  submitsEl.textContent=submits+(submits===1?" submit":" submits");
  statusEl.textContent=userTookOver?("you took over · autopilot off"):(loopsDone>0?("loop "+loopsDone+" · submitted · typing next…"):("submitted · typing next…"));
}
function tap(code,ms){
  ms=ms==null?rand(130,180):ms;
  press(code);fireKey(code);
  return wait(ms).then(function(){release(code);});
}
function typeChar(ch){
  if(ch===" "){return tap("Space").then(function(){setInput(input.value+" ");});}
  var lo=ch.toLowerCase();
  if(!knownKeys.has(lo)){setInput(input.value+ch);return Promise.resolve();}
  if(ch!==lo){
    press("ShiftLeft");
    return wait(rand(60,90)).then(function(){
      press(lo);fireKey(lo);setInput(input.value+ch);
      return wait(rand(130,170));
    }).then(function(){release(lo);return wait(60);}).then(function(){release("ShiftLeft");});
  }
  press(lo);fireKey(lo);setInput(input.value+ch);
  return wait(rand(130,180)).then(function(){release(lo);});
}
function typeLoop(){
  return wait(1700).then(function loop(){
    if(stopped()){statusEl.textContent=userTookOver?"paused · you are typing":"paused";return Promise.resolve();}
    var list=PROMPTS;
    if(!list.length){return Promise.resolve();}
    var seq=Promise.resolve();
    var idx=loopsDone;
    var text=list[idx%list.length];
    var typoAt=idx===0?Math.min(text.length-1,text.indexOf(" ")+4||4):-1;
    for(var c=0;c<text.length;c++){
      (function(pos){
        seq=seq.then(function(){
          if(stopped()){throw "stop";}
          if(pos===typoAt){
            return tap("w").then(function(){return wait(rand(320,420));})
              .then(function(){return tap("Backspace");})
              .then(function(){setInput(input.value.slice(0,-1));return wait(rand(160,220));});
          }
          return null;
        }).then(function(){
          if(stopped()){throw "stop";}
          return typeChar(text[pos]);
        }).then(function(){
          if(stopped()){throw "stop";}
          return wait(text[pos]===" "?rand(220,380):rand(110,260));
        });
      })(c);
    }
    return seq.then(function(){
      if(stopped()){return null;}
      return wait(1600);
    }).then(function(){
      if(stopped()){return null;}
      return tap("Enter").then(submitNow).then(function(){loopsDone++;loopEl.textContent=String(loopsDone);});
    }).then(function(){
      if(stopped()){return null;}
      return wait(1100);
    }).then(function(){
      if(stopped()){return null;}
      return loop();
    }).catch(function(err){if(err==="stop"){return null;}throw err;});
  });
}
function tick(now){
  if(!alive){return;}
  rafId=(window.requestAnimationFrame||function(cb){return window.setTimeout(function(){cb(Date.now());},50);})(tick);
  if(now-lastFrame<FRAME_GAP){return;}
  lastFrame=now;
  if(!visible||reduced){return;}
  var t=now/LOOP_MS*Math.PI*2;
  colorPath.setAttribute("d",floorD(BIG,t));
  lightPath.setAttribute("d",floorD(SMALL,t));
  var nowFn=(window.performance&&window.performance.now)?window.performance.now.bind(window.performance):Date.now;
  var cur=nowFn();
  for(var i=ripples.length-1;i>=0;i--){
    var rp=ripples[i], life=rippleLife(cur-rp.t0);
    if(life<0){rp.c.remove();rp.l.remove();ripples.splice(i,1);continue;}
    rp.c.setAttribute("cy",(1361.7-life*470-SPOT.y).toFixed(1));
    rp.l.setAttribute("cy",(1401.7-life*330-SPOT2.y).toFixed(1));
  }
}
function onKeyDown(e){
  if(e&&e.isTrusted){userTookOver=true;}
  var code=mapEvent(e);
  if(code){press(code);if(!e.repeat){fireKey(code);}}
  if(e&&e.key==="Enter"){if(e.preventDefault){e.preventDefault();}submitNow();}
}
function onKeyUp(e){
  var code=mapEvent(e);
  if(code){release(code);}
  if(code==="MetaLeft"||code==="MetaRight"){releaseAll();}
}
function initTheme(){
  var btn=$("theme-toggle"), icon=$("theme-icon"), label=$("theme-label");
  function paint(){
    var dark=document.documentElement.getAttribute("data-theme")==="dark";
    btn.setAttribute("aria-pressed",dark?"true":"false");
    btn.setAttribute("aria-label",dark?"Switch to light theme":"Switch to dark theme");
    icon.textContent=dark?"☀":"☾";
    label.textContent=dark?"Light":"Dark";
  }
  paint();
  btn.addEventListener("click",function(){
    var cur=document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark";
    document.documentElement.setAttribute("data-theme",cur);
    try{localStorage.setItem("glow-keyboard-theme",cur);}catch(e){}
    paint();
  });
  window.__gkSetTheme=function(mode){
    document.documentElement.setAttribute("data-theme",mode);
    try{localStorage.setItem("glow-keyboard-theme",mode);}catch(e){}
    paint();
  };
}
function boot(){
  if(started){return;}
  started=true;
  if(input.placeholder!==PLACEHOLDER){input.setAttribute("placeholder",PLACEHOLDER);}
  input.setAttribute("aria-label",PLACEHOLDER);
  buildKeys();
  $("key-count").textContent=String(keyByCode.size);
  $("prompt-count").textContent=String(PROMPTS.length);
  root.setAttribute("data-in","");
  input.addEventListener("keydown",onKeyDown);
  input.addEventListener("keyup",onKeyUp);
  input.addEventListener("blur",releaseAll);
  input.addEventListener("focus",function(){userTookOver=true;statusEl.textContent="you took over · autopilot off";});
  root.addEventListener("pointerdown",function(e){if(e.target!==input){if(e.preventDefault){e.preventDefault();}try{input.focus();}catch(err){}}});
  $("btn-replay").addEventListener("click",function(){userTookOver=false;statusEl.textContent="replaying loop…";});
  $("btn-submit").addEventListener("click",function(){submitNow();try{input.focus();}catch(e){}});
  initTheme();
  statusEl.textContent=reduced?"reduced motion · static scene":"typing…";
  var raf=window.requestAnimationFrame||function(cb){return window.setTimeout(function(){cb(Date.now());},50);};
  if(!reduced){rafId=raf(tick);}
  if(typeof IntersectionObserver!=="undefined"&&IntersectionObserver){
    try{
      var io=new IntersectionObserver(function(entries){
        visible=entries[0]?entries[0].isIntersecting:true;
        root.toggleAttribute("data-paused",!visible);
      });
      io.observe(root);
      window.__gkIO=io;
    }catch(e){visible=true;}
  }else{visible=true;}
  typeLoop();
  window.__glowKeyboard={prompts:PROMPTS.slice(),input:input,log:log,status:statusEl,
    keys:keyByCode,down:downAt,ripples:ripples,
    get submits(){return submits;},get loops(){return loopsDone;},
    takeOver:function(){userTookOver=false;},stopAuto:function(){userTookOver=true;},
    submitNow:submitNow,press:press,release:release,fireKey:fireKey,
    get userTookOver(){return userTookOver;},get visible(){return visible;},
    colorPath:colorPath,lightPath:lightPath,root:root,board:board};
}
if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",boot);}
else{boot();}
})();
