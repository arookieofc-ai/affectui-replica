
(function(){
"use strict";
var SVGNS="http://www.w3.org/2000/svg";
var DELAYS=["0s","-7.33s","-14.66s"];
var LOOP_LEN=22;
var state={tick:0,lap:1,enriched:1240,selected:0,paused:false,theme:"light"};
var refs={};

function el(id){return document.getElementById(id)}
function fmt(n){return n.toLocaleString("en-US")}

function applyThemeToArt(theme){
  var rings=el("rings");
  var tile=el("tileRect");
  var a=el("grokA"), b=el("grokB");
  if(theme==="dark"){
    if(rings) rings.setAttribute("stroke","rgba(255,255,255,0.14)");
    if(tile){tile.setAttribute("fill","#232326");tile.setAttribute("stroke","rgba(255,255,255,0.08)")}
    if(a) a.setAttribute("fill","#ededed");
    if(b) b.setAttribute("fill","#ededed");
  }else{
    if(rings) rings.setAttribute("stroke","#E4E7EC");
    if(tile){tile.setAttribute("fill","#FFFFFF");tile.setAttribute("stroke","#E4E7EC")}
    if(a) a.setAttribute("fill","#171717");
    if(b) b.setAttribute("fill","#171717");
  }
}

function setTheme(next, persist){
  if(next!=="light"&&next!=="dark") return;
  state.theme=next;
  document.documentElement.setAttribute("data-theme",next);
  var btn=el("themeBtn"), lab=el("themeLabel"), ico=el("themeIco");
  if(btn) btn.setAttribute("aria-pressed", next==="dark"?"true":"false");
  if(lab) lab.textContent = next==="dark"?"Light":"Dark";
  if(ico) ico.textContent = next==="dark"?"\u2600":"\u263E";
  applyThemeToArt(next);
  if(persist!==false){try{localStorage.setItem("enrichment-orbit-theme",next)}catch(e){}}
}

function buildNodes(){
  var g=el("nodesG");
  var list=el("nodeList");
  refs.nodeGs=[];refs.nodeChips=[];refs.nodeBubbles=[];
  for(var k=0;k<3;k++){
    (function(idx){
      var orbit=document.createElementNS(SVGNS,"g");
      orbit.setAttribute("class","eo-orbit eo-node");
      orbit.setAttribute("style","animation-delay:"+DELAYS[idx]);
      orbit.setAttribute("tabindex","0");
      orbit.setAttribute("role","button");
      orbit.setAttribute("aria-label","Source "+(idx+1)+" data node, delay "+DELAYS[idx]);
      var up=document.createElementNS(SVGNS,"g");
      up.setAttribute("class","eo-upright");
      up.setAttribute("style","animation-delay:"+DELAYS[idx]);
      var bub=document.createElementNS(SVGNS,"circle");
      bub.setAttribute("cx","160");bub.setAttribute("cy","40");bub.setAttribute("r","17");
      bub.setAttribute("fill", state.theme==="dark"?"#232326":"#FFFFFF");
      bub.setAttribute("stroke", state.theme==="dark"?"rgba(255,255,255,0.08)":"#E4E7EC");
      bub.setAttribute("stroke-width","0.5");
      bub.setAttribute("class","eo-bubble");
      var ic=document.createElementNS(SVGNS,"g");
      ic.setAttribute("transform","translate(154 34) scale(0.0288)");
      ic.setAttribute("fill", state.theme==="dark"?"#c4c4c4":"#6B6F76");
      ic.setAttribute("fill-opacity","0.55");
      var p=document.createElementNS(SVGNS,"path");
      p.setAttribute("d","M278 88C278 115.614 300.386 138 328 138H366C393.614 138 416 160.386 416 188V228C416 255.614 393.614 278 366 278H328C300.386 278 278 300.386 278 328V366C278 393.614 255.614 416 228 416H188C160.386 416 138 393.614 138 366V328C138 300.386 115.614 278 88 278H50C22.3858 278 0 255.614 0 228V188C0 160.386 22.3858 138 50 138H88C115.614 138 138 115.614 138 88V50C138 22.3858 160.386 0 188 0H228C255.614 0 278 22.3858 278 50V88ZM140 226C140 253.614 162.386 276 190 276H226C253.614 276 276 253.614 276 226V190C276 162.386 253.614 140 226 140H190C162.386 140 140 162.386 140 190V226Z");
      ic.appendChild(p);
      up.appendChild(bub);up.appendChild(ic);orbit.appendChild(up);
      orbit.addEventListener("mouseenter",function(){highlight(idx,true)});
      orbit.addEventListener("mouseleave",function(){highlight(idx,false)});
      orbit.addEventListener("focus",function(){highlight(idx,true)});
      orbit.addEventListener("blur",function(){highlight(idx,false)});
      orbit.addEventListener("click",function(){selectNode(idx)});
      orbit.addEventListener("keydown",function(ev){if(ev.key==="Enter"||ev.key===" "){if(ev.preventDefault)ev.preventDefault();selectNode(idx)}});
      g.appendChild(orbit);
      refs.nodeGs.push(orbit);refs.nodeBubbles.push(bub);

      var chip=document.createElement("button");
      chip.setAttribute("class","node-chip");
      chip.setAttribute("role","listitem");
      chip.setAttribute("aria-label","Select source "+(idx+1));
      var b=document.createElement("b");
      b.textContent="Source "+(idx+1);
      var s=document.createElement("span");
      s.textContent="delay "+DELAYS[idx]+" \u00B7 enriching";
      chip.appendChild(b);chip.appendChild(s);
      chip.addEventListener("mouseenter",function(){highlight(idx,true)});
      chip.addEventListener("mouseleave",function(){highlight(idx,false)});
      chip.addEventListener("focus",function(){highlight(idx,true)});
      chip.addEventListener("blur",function(){highlight(idx,false)});
      chip.addEventListener("click",function(){selectNode(idx)});
      list.appendChild(chip);
      refs.nodeChips.push(chip);
    })(k);
  }
}

function highlight(idx,on){
  var n=refs.nodeGs[idx], c=refs.nodeChips[idx];
  if(!n||!c) return;
  if(on){n.classList.add("is-active");c.classList.add("is-active")}
  else if(idx!==state.selected){n.classList.remove("is-active");c.classList.remove("is-active")}
  for(var j=0;j<refs.nodeGs.length;j++){
    if(j!==idx&&j!==state.selected){refs.nodeGs[j].classList.remove("is-active");refs.nodeChips[j].classList.remove("is-active")}
  }
}

function selectNode(idx){
  state.selected=idx;
  for(var j=0;j<refs.nodeGs.length;j++){
    if(j===idx){refs.nodeGs[j].classList.add("is-active");refs.nodeChips[j].classList.add("is-active")}
    else{refs.nodeGs[j].classList.remove("is-active");refs.nodeChips[j].classList.remove("is-active")}
  }
  var t=el("detailTitle"), ds=el("dStatus"), dd=el("dDelay"), dr=el("dRecords");
  if(t) t.textContent="Source "+(idx+1)+" details";
  if(dd) dd.textContent=DELAYS[idx];
  if(ds) ds.textContent="orbiting \u00B7 enriching";
  if(dr) dr.textContent=fmt(410+idx*3+state.tick)+" enriched";
  var card=el("detailCard");
  if(card) card.style.display="";
  var db=el("detailBtn");
  if(db) db.setAttribute("aria-expanded","true");
}

function tick(){
  state.tick=(state.tick+1)%LOOP_LEN;
  if(state.tick===0){state.lap+=1;state.enriched+=22}
  else{state.enriched+=1}
  var s=el("statusLine"), e=el("enrichedCount"), l=el("liveCount"), tl=el("tickLine"), dr=el("dRecords");
  if(s) s.textContent="Enriching 3 sources \u00B7 lap "+state.lap+" \u00B7 "+fmt(state.enriched)+" records";
  if(e) e.textContent=fmt(state.enriched)+" enriched";
  if(l) l.textContent="3 nodes orbiting";
  if(tl) tl.textContent="tick "+state.tick+" of "+LOOP_LEN+" \u00B7 comets 7s loop";
  if(dr) dr.textContent=fmt(410+state.selected*3+state.tick)+" enriched";
}

function togglePause(){
  state.paused=!state.paused;
  var svg=el("orbitSvg");
  if(svg&&svg.parentElement&&svg.parentElement.parentElement){
    /* toggle on frame + svg root for stub + real DOM */
  }
  document.body.classList.toggle("paused",state.paused);
  var frame=document.querySelector(".orbit-frame");
  if(frame) frame.classList.toggle("paused",state.paused);
  var b=el("pauseBtn"), lab=el("pauseLabel");
  if(b) b.setAttribute("aria-pressed",state.paused?"true":"false");
  if(lab) lab.textContent=state.paused?"Play":"Pause";
}

function init(){
  refs.statusLine=el("statusLine");
  refs.enriched=el("enrichedCount");
  refs.tickLine=el("tickLine");
  var cur=document.documentElement.getAttribute("data-theme");
  if(cur==="dark"||cur==="light") state.theme=cur;
  else{
    var m=null;
    try{m=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}catch(e){m="light"}
    state.theme=m||"light";
  }
  applyThemeToArt(state.theme);
  var tb=el("themeBtn"), lab=el("themeLabel"), ico=el("themeIco");
  if(lab) lab.textContent=state.theme==="dark"?"Light":"Dark";
  if(ico) ico.textContent=state.theme==="dark"?"\u2600":"\u263E";
  if(tb) tb.setAttribute("aria-pressed",state.theme==="dark"?"true":"false");
  buildNodes();
  selectNode(0);
  var tbb=el("themeBtn");
  if(tbb) tbb.addEventListener("click",function(){setTheme(state.theme==="dark"?"light":"dark")});
  var pb=el("pauseBtn");
  if(pb) pb.addEventListener("click",togglePause);
  var db=el("detailBtn");
  if(db) db.addEventListener("click",function(){
    var card=el("detailCard");
    if(!card) return;
    var hidden=card.style.display==="none";
    card.style.display=hidden?"":"none";
    db.setAttribute("aria-expanded",hidden?"true":"false");
  });
  document.addEventListener("keydown",function(ev){if(ev.key==="Escape"){var card=el("detailCard");if(card)card.style.display="none";var dbb=el("detailBtn");if(dbb)dbb.setAttribute("aria-expanded","false")}});
  refs.initTick=state.tick;
}

if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",init)}else{init()}
var timer=null;
try{timer=setInterval(tick,1000)}catch(e){}
window.__enrichmentOrbit={state:state,refs:refs,tick:tick,setTheme:setTheme,selectNode:selectNode,togglePause:togglePause,highlight:highlight,DELAYS:DELAYS,LOOP_LEN:LOOP_LEN,timer:timer};
})();
