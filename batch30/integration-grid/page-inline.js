
(function(){
"use strict";
var COLS=9, STEP=160, ROW_Y=280, BASE_W=80;
function fieldWidth(c){return c*STEP+BASE_W;}
function positions(cols){
  var rows=[cols-2,cols,cols-2];
  var cx=fieldWidth(cols)/2, out=[];
  for(var r=0;r<3;r++){
    var len=rows[r];
    for(var k=0;k<len;k++){
      var x=cx+(k-(len-1)/2)*STEP;
      var y=ROW_Y+(r-1)*STEP;
      var d=Math.hypot((x-cx)/STEP,(y-ROW_Y)/STEP);
      out.push({x:x,y:y,center:(r===1&&k===(len-1)/2),d:d,row:r,col:k});
    }
  }
  return out;
}
function alphaFor(d){return Math.max(0.22,0.64-0.095*d);}
function keepFor(d){return Math.max(0.35,1-0.16*d);}
/* Demo data (names + brand tints in original order). Glyph artwork below is original to this replica. */
var APPS=[
  {name:"Notion",color:null},
  {name:"Stripe",color:"#635BFF"},
  {name:"Figma",color:"#F24E1E"},
  {name:"Linear",color:"#5E6AD2"},
  {name:"HubSpot",color:"#FF7A59"},
  {name:"Dropbox",color:"#0061FF"},
  {name:"Jira",color:"#0052CC"},
  {name:"Shopify",color:"#7AB55C"},
  {name:"Zapier",color:"#FF4F00"},
  {name:"Airtable",color:"#18BFFF"},
  {name:"Slack",color:"#4A154B",dark:"ink"},
  {name:"GitHub",color:null},
  {name:"Google Drive",color:"#4285F4"},
  {name:"Gmail",color:"#EA4335"},
  {name:"Asana",color:"#F06A6A"},
  {name:"Trello",color:"#0052CC"},
  {name:"Discord",color:"#5865F2"},
  {name:"Salesforce",color:"#00A1E0"},
  {name:"Loom",color:"#625DF5"},
  {name:"Intercom",color:null},
  {name:"Webflow",color:"#146EF5"},
  {name:"Calendly",color:"#006BFF"}
];
var SVGNS="http://www.w3.org/2000/svg";
function ink(){return document.documentElement.getAttribute("data-theme")==="dark"?"#ededed":"#0a0a0a";}
function paintFor(app){
  if(app.color) return app.color;
  return ink();
}
/* Clean-room glyphs: 8 tiny geometric marks cycling across tiles. Not copies of brand artwork. */
function makeGlyph(app,idx){
  var s=document.createElementNS(SVGNS,"svg");
  s.setAttribute("viewBox","0 0 24 24");
  s.setAttribute("aria-hidden","true");
  var c=paintFor(app), v=idx%8, g=document.createElementNS(SVGNS,"g");
  g.setAttribute("fill",c);
  function el(tag,attrs){var e=document.createElementNS(SVGNS,tag);for(var k in attrs){e.setAttribute(k,attrs[k]);}g.appendChild(e);return e;}
  if(v===0){el("circle",{cx:"12",cy:"12",r:"8"});el("circle",{cx:"12",cy:"12",r:"3.2",fill:"#fff",opacity:".85"});}
  else if(v===1){el("rect",{x:"4",y:"4",width:"16",height:"16",rx:"4"});el("rect",{x:"9",y:"9",width:"6",height:"6",rx:"1.5",fill:"#fff",opacity:".9"});}
  else if(v===2){el("path",{d:"M12 3 L21 20 L3 20 Z"});el("circle",{cx:"12",cy:"15",r:"2.6",fill:"#fff",opacity:".9"});}
  else if(v===3){el("path",{d:"M12 2 L22 12 L12 22 L2 12 Z"});el("circle",{cx:"12",cy:"12",r:"3",fill:"#fff",opacity:".9"});}
  else if(v===4){el("path",{d:"M12 2 L20.7 7 L20.7 17 L12 22 L3.3 17 L3.3 7 Z"});el("rect",{x:"9",y:"9",width:"6",height:"6",rx:"1",fill:"#fff",opacity:".9"});}
  else if(v===5){el("rect",{x:"3",y:"6",width:"18",height:"4",rx:"2"});el("rect",{x:"3",y:"14",width:"18",height:"4",rx:"2"});}
  else if(v===6){el("circle",{cx:"8.5",cy:"12",r:"5.5"});el("circle",{cx:"15.5",cy:"12",r:"5.5",opacity:".65"});}
  else{el("path",{d:"M4 4 L14 4 L14 14 L20 14 L20 20 L4 20 Z",opacity:".95"});el("rect",{x:"15.5",y:"3.5",width:"5",height:"5",rx:"1.2"});}
  if(app.dark==="ink"){g.setAttribute("data-ink","1");}
  s.appendChild(g);
  return {svg:s,group:g,base:c};
}
function makeCoreMark(){
  var s=document.createElementNS(SVGNS,"svg");
  s.setAttribute("viewBox","0 0 48 48");
  s.setAttribute("aria-hidden","true");
  var soft=document.createElementNS(SVGNS,"g");
  soft.setAttribute("opacity",".32");
  soft.setAttribute("fill","currentColor");
  for(var i=0;i<4;i++){
    var p=document.createElementNS(SVGNS,"ellipse");
    p.setAttribute("cx","24");p.setAttribute("cy","13");p.setAttribute("rx","5.2");p.setAttribute("ry","9.5");
    p.setAttribute("transform","rotate("+(45+i*90)+" 24 24)");
    soft.appendChild(p);
  }
  s.appendChild(soft);
  var hard=document.createElementNS(SVGNS,"g");
  hard.setAttribute("fill","currentColor");
  for(var j=0;j<4;j++){
    var q=document.createElementNS(SVGNS,"ellipse");
    q.setAttribute("cx","24");q.setAttribute("cy","13");q.setAttribute("rx","5.2");q.setAttribute("ry","9.5");
    q.setAttribute("transform","rotate("+(j*90)+" 24 24)");
    hard.appendChild(q);
  }
  s.appendChild(hard);
  var core=document.createElementNS(SVGNS,"circle");
  core.setAttribute("cx","24");core.setAttribute("cy","24");core.setAttribute("r","3.4");
  core.setAttribute("fill","var(--core)");
  s.appendChild(core);
  return s;
}
var stage=document.getElementById("stage");
var spotLabel=document.getElementById("spotLabel");
var detailDot=document.getElementById("detailDot");
var detailName=document.getElementById("detailName");
var detailMeta=document.getElementById("detailMeta");
var detailTag=document.getElementById("detailTag");
var miniList=document.getElementById("miniList");
var playBtn=document.getElementById("playBtn");
var playLabel=document.getElementById("playLabel");
var playIcon=document.getElementById("playIcon");
var themeBtn=document.getElementById("themeBtn");
var themeIcon=document.getElementById("themeIcon");
var cells=[], glyphGroups=[], miniDots=[];
var spot=0, picked=0, playing=true, timer=null;
function currentTheme(){return document.documentElement.getAttribute("data-theme")||"light";}
function refreshThemeBtn(){
  var dark=currentTheme()==="dark";
  themeBtn.setAttribute("aria-label",dark?"Switch to light theme":"Switch to dark theme");
  themeIcon.textContent=dark?"☾":"◐";
}
function recolorInkGlyphs(){
  var c=ink();
  for(var i=0;i<glyphGroups.length;i++){
    if(glyphGroups[i]&&glyphGroups[i].isInk){glyphGroups[i].g.setAttribute("fill",c);}
  }
  for(var j=0;j<miniDots.length;j++){
    if(miniDots[j]&&miniDots[j].isInk){miniDots[j].el.style.background=c;}
  }
  if(!APPS[picked].color){detailDot.style.background=c;}
}
function setSpot(n,focusIt){
  var total=cells.length;
  var next=((n%total)+total)%total;
  if(cells[spot]){cells[spot].classList.remove("is-spot");}
  spot=next;
  cells[spot].classList.add("is-spot");
  var app=APPS[spot];
  spotLabel.textContent="Spotlight "+(spot+1)+" / "+total+" — "+app.name;
  if(focusIt&&document.activeElement!==cells[spot]){try{cells[spot].focus({preventScroll:true});}catch(e){cells[spot].focus();}}
}
function selectApp(n){
  var total=cells.length;
  var next=((n%total)+total)%total;
  if(cells[picked]){cells[picked].classList.remove("is-picked");cells[picked].setAttribute("aria-pressed","false");}
  picked=next;
  var app=APPS[picked];
  cells[picked].classList.add("is-picked");
  cells[picked].setAttribute("aria-pressed","true");
  detailName.textContent=app.name;
  var pos=cells[picked].getAttribute("data-pos");
  detailMeta.textContent="Tile "+(picked+1)+" · edge fade "+alphaFor(parseFloat(pos)).toFixed(3)+" · press Enter on any tile";
  detailDot.textContent=app.name.charAt(0);
  detailDot.style.background=paintFor(app);
  detailDot.style.opacity="1";detailDot.style.visibility="visible";
  detailTag.textContent="Ready to connect";
}
function tick(){setSpot(spot+1,false);selectApp(spot);}
function startTour(){if(timer) return;timer=setInterval(tick,1600);playing=true;playLabel.textContent="Pause tour";playIcon.textContent="❚❚ ";}
function stopTour(){if(timer){clearInterval(timer);timer=null;}playing=false;playLabel.textContent="Play tour";playIcon.textContent="▶ ";}
function buildOnce(){
  var layout=positions(COLS);
  var ai=0;
  for(var i=0;i<layout.length;i++){
    (function(pos){
      if(pos.center){
        var core=document.createElement("span");
        core.className="tile tile--core";
        core.setAttribute("aria-hidden","true");
        core.style.setProperty("--px",String(pos.x));
        core.style.setProperty("--py",String(pos.y));
        core.style.opacity="1";core.style.visibility="visible";
        var cm=document.createElement("span");
        cm.className="core-mark";
        cm.appendChild(makeCoreMark());
        core.appendChild(cm);
        stage.appendChild(core);
        return;
      }
      var app=APPS[ai%APPS.length];
      var b=document.createElement("button");
      b.className="tile";
      b.type="button";
      b.setAttribute("aria-label",app.name+" integration");
      b.setAttribute("aria-pressed",ai===0?"true":"false");
      b.setAttribute("data-pos",String(pos.d));
      b.style.setProperty("--px",String(pos.x));
      b.style.setProperty("--py",String(pos.y));
      b.style.setProperty("--ta",alphaFor(pos.d).toFixed(3));
      b.style.setProperty("--tk",keepFor(pos.d).toFixed(3));
      b.style.opacity="1";b.style.visibility="visible";
      var wrap=document.createElement("span");
      wrap.className="glyph";
      wrap.style.opacity="1";wrap.style.visibility="visible";
      var made=makeGlyph(app,ai);
      wrap.appendChild(made.svg);
      b.appendChild(wrap);
      if(ai===0){b.classList.add("is-spot","is-picked");}
      var my=ai;
      b.addEventListener("click",function(){selectApp(my);setSpot(my,false);});
      b.addEventListener("focus",function(){setSpot(my,false);selectApp(my);});
      b.addEventListener("keydown",function(ev){
        var t=cells.length, nx=null;
        if(ev.key==="ArrowRight") nx=(my+1)%t;
        else if(ev.key==="ArrowLeft") nx=(my-1+t)%t;
        else if(ev.key==="Home"){ev.preventDefault();setSpot(0,true);selectApp(0);return;}
        else if(ev.key==="End"){ev.preventDefault();setSpot(t-1,true);selectApp(t-1);return;}
        else return;
        ev.preventDefault();setSpot(nx,true);selectApp(nx);
      });
      stage.appendChild(b);
      cells.push(b);
      glyphGroups.push({g:made.group,isInk:!app.color&&app.dark!=="ink"?true:(app.dark==="ink"?false:!app.color)});
      /* Slack keeps its plum in light, follows ink in dark */
      if(app.dark==="ink"){glyphGroups[glyphGroups.length-1].followsInk=true;glyphGroups[glyphGroups.length-1].plum=app.color;glyphGroups[glyphGroups.length-1].isInk=false;}
      ai++;
    })(layout[i]);
  }
  for(var m=0;m<APPS.length;m++){
    (function(app,idx){
      var li=document.createElement("li");
      var sw=document.createElement("span");
      sw.className="sw";
      var col=app.color||ink();
      sw.style.background=col;
      li.appendChild(sw);
      var t=document.createElement("span");
      t.className="m";
      t.textContent=app.name;
      li.appendChild(t);
      miniList.appendChild(li);
      miniDots.push({el:sw,isInk:!app.color});
    })(APPS[m],m);
  }
  if(APPS[0].color){detailDot.style.background=APPS[0].color;}else{detailDot.style.background=ink();}
  recolorInkGlyphs();
  applySlackTheme();
  refreshThemeBtn();
  selectApp(0);
  setSpot(0,false);
}
function applySlackTheme(){
  for(var i=0;i<APPS.length;i++){
    if(APPS[i].dark!=="ink") continue;
    var rec=glyphGroups[i];
    if(!rec||!rec.followsInk) continue;
    if(currentTheme()==="dark"){rec.g.setAttribute("fill",ink());}
    else{rec.g.setAttribute("fill",rec.plum);}
  }
}
themeBtn.addEventListener("click",function(){
  var next=currentTheme()==="dark"?"light":"dark";
  document.documentElement.setAttribute("data-theme",next);
  try{localStorage.setItem("integration-grid-theme",next);}catch(e){}
  refreshThemeBtn();
  recolorInkGlyphs();
  applySlackTheme();
  selectApp(picked);
});
playBtn.addEventListener("click",function(){if(playing){stopTour();}else{startTour();}});
document.getElementById("prevBtn").addEventListener("click",function(){setSpot(spot-1,false);selectApp(spot);});
document.getElementById("nextBtn").addEventListener("click",function(){setSpot(spot+1,false);selectApp(spot);});
document.addEventListener("keydown",function(ev){
  if(ev.key!==" "||ev.target===playBtn||/INPUT|TEXTAREA/.test(ev.target.tagName)) return;
});
buildOnce();
try{
  if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches){stopTour();}
  else{startTour();}
}catch(e){startTour();}
/* Expose tiny hooks for the node harness (no behaviour change). */
window.__ig={cells:function(){return cells;},spot:function(){return spot;},picked:function(){return picked;},tick:tick,select:selectApp,setSpot:setSpot,apps:APPS};
})();
