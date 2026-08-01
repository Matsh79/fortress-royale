/* FORTRESS ROYALE v2 — chests, 5 weapons, 3 slots, Duke-style difficulties. Three.js r160. */
(() => {
'use strict';

const $ = id => document.getElementById(id);
const rand = (a,b) => a + Math.random()*(b-a);
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const isTouch = 'ontouchstart' in window;

// ---------- audio ----------
const AC = window.AudioContext || window.webkitAudioContext;
let ac = null;
function sfxSynth(type){
  if(!ac) return;
  const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
  o.connect(g); g.connect(ac.destination);
  const P = {
    shot:   ()=>{o.type='square';o.frequency.setValueAtTime(220,t);o.frequency.exponentialRampToValueAtTime(60,t+.08);g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.09);o.start(t);o.stop(t+.1);},
    smg:    ()=>{o.type='square';o.frequency.setValueAtTime(300,t);o.frequency.exponentialRampToValueAtTime(90,t+.05);g.gain.setValueAtTime(.09,t);g.gain.exponentialRampToValueAtTime(.001,t+.06);o.start(t);o.stop(t+.07);},
    shotgun:()=>{o.type='sawtooth';o.frequency.setValueAtTime(120,t);o.frequency.exponentialRampToValueAtTime(40,t+.15);g.gain.setValueAtTime(.22,t);g.gain.exponentialRampToValueAtTime(.001,t+.18);o.start(t);o.stop(t+.2);},
    knife:  ()=>{o.type='triangle';o.frequency.setValueAtTime(700,t);o.frequency.exponentialRampToValueAtTime(200,t+.09);g.gain.setValueAtTime(.07,t);g.gain.exponentialRampToValueAtTime(.001,t+.1);o.start(t);o.stop(t+.11);},
    rocket: ()=>{o.type='sawtooth';o.frequency.setValueAtTime(80,t);o.frequency.linearRampToValueAtTime(160,t+.4);g.gain.setValueAtTime(.15,t);g.gain.exponentialRampToValueAtTime(.001,t+.45);o.start(t);o.stop(t+.5);},
    boom:   ()=>{o.type='sawtooth';o.frequency.setValueAtTime(60,t);o.frequency.exponentialRampToValueAtTime(25,t+.5);g.gain.setValueAtTime(.3,t);g.gain.exponentialRampToValueAtTime(.001,t+.6);o.start(t);o.stop(t+.65);},
    hit:    ()=>{o.type='triangle';o.frequency.setValueAtTime(880,t);o.frequency.exponentialRampToValueAtTime(440,t+.05);g.gain.setValueAtTime(.1,t);g.gain.exponentialRampToValueAtTime(.001,t+.07);o.start(t);o.stop(t+.08);},
    kill:   ()=>{o.type='sine';o.frequency.setValueAtTime(523,t);o.frequency.setValueAtTime(784,t+.09);o.frequency.setValueAtTime(1046,t+.18);g.gain.setValueAtTime(.14,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);o.start(t);o.stop(t+.32);},
    hurt:   ()=>{o.type='sawtooth';o.frequency.setValueAtTime(160,t);o.frequency.exponentialRampToValueAtTime(80,t+.12);g.gain.setValueAtTime(.15,t);g.gain.exponentialRampToValueAtTime(.001,t+.15);o.start(t);o.stop(t+.16);},
    reload: ()=>{o.type='square';o.frequency.setValueAtTime(400,t);o.frequency.setValueAtTime(300,t+.1);o.frequency.setValueAtTime(500,t+.2);g.gain.setValueAtTime(.06,t);g.gain.exponentialRampToValueAtTime(.001,t+.28);o.start(t);o.stop(t+.3);},
    pick:   ()=>{o.type='sine';o.frequency.setValueAtTime(660,t);o.frequency.exponentialRampToValueAtTime(990,t+.08);g.gain.setValueAtTime(.1,t);g.gain.exponentialRampToValueAtTime(.001,t+.12);o.start(t);o.stop(t+.13);},
    chest:  ()=>{o.type='sine';o.frequency.setValueAtTime(392,t);o.frequency.setValueAtTime(523,t+.12);o.frequency.setValueAtTime(659,t+.24);o.frequency.setValueAtTime(784,t+.36);g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.5);o.start(t);o.stop(t+.52);},
    build:  ()=>{o.type='square';o.frequency.setValueAtTime(170,t);o.frequency.setValueAtTime(240,t+.07);g.gain.setValueAtTime(.09,t);g.gain.exponentialRampToValueAtTime(.001,t+.15);o.start(t);o.stop(t+.16);},
    sniper: ()=>{o.type='sawtooth';o.frequency.setValueAtTime(190,t);o.frequency.exponentialRampToValueAtTime(28,t+.28);g.gain.setValueAtTime(.26,t);g.gain.exponentialRampToValueAtTime(.001,t+.32);o.start(t);o.stop(t+.34);},
    horn:   ()=>{o.type='sawtooth';o.frequency.setValueAtTime(330,t);o.frequency.linearRampToValueAtTime(392,t+.12);o.frequency.setValueAtTime(330,t+.2);o.frequency.linearRampToValueAtTime(523,t+.34);g.gain.setValueAtTime(.15,t);g.gain.setValueAtTime(.15,t+.4);g.gain.exponentialRampToValueAtTime(.001,t+.55);o.start(t);o.stop(t+.6);},
    thud:   ()=>{o.type='sawtooth';o.frequency.setValueAtTime(95,t);o.frequency.exponentialRampToValueAtTime(30,t+.22);g.gain.setValueAtTime(.3,t);g.gain.exponentialRampToValueAtTime(.001,t+.28);o.start(t);o.stop(t+.3);},
  };
  (P[type]||P.shot)();
}


// ---------- real audio layer (mp3 pack) ----------
const AUD={};
let liveAud=0;
function afile(n,vol){ try{
  if(isTouch && liveAud>=5) return;
  let a=AUD[n]; if(!a){ a=new Audio('/sfx/'+n+'.mp3'); AUD[n]=a; }
  const c=a.cloneNode(); c.volume=vol==null?0.7:vol;
  liveAud++; const done=()=>{ liveAud=Math.max(0,liveAud-1); };
  c.addEventListener('ended',done,{once:true}); c.addEventListener('error',done,{once:true});
  c.play().catch(done);
}catch(e){} }
const SFXMAP={chainsaw:['w_chainsaw',.5],shot:['w_rifle',.4],smg:['w_smg',.35],shotgun:['w_shotgun',.55],knife:['w_knife',.5],rocket:['w_rocket',.6],boom:['x_near',.85],hit:['hit_body',.5],chest:['chest_open',.6],sniper:['w_rifle',.6]};
const KILLLINES=['kill1','kill2','kill3','g80_hasta','g80_cure','g80_divorce'];   // WAVE2: Garrison 80s pack joins the kill-line pool
// WAVE2: announcer guard — only one voice line at a time (skip if one played <1.5s ago)
let lastAnnT=-9999;
function announce(name,vol,delay=0,force=false){
  const t=performance.now();
  if(!force && t-lastAnnT<1500) return false;
  lastAnnT=t+delay;
  if(delay) setTimeout(()=>afile(name,vol),delay); else afile(name,vol);
  return true;
}
function sfx(type){
  if(type==='kill'){ announce(KILLLINES[Math.floor(Math.random()*KILLLINES.length)], .9); return; }
  const m=SFXMAP[type]; if(m){ afile(m[0],m[1]); return; }
  sfxSynth(type);
}
// ---------- crosshair ----------
(function(){ const c = $('cross'), L=9, W=2, G=5;
  [[-L-G,-W/2,L,W],[G,-W/2,L,W],[-W/2,-L-G,W,L],[-W/2,G,W,L]].forEach(r=>{
    const s=document.createElement('span'); s.style.cssText=`left:${r[0]}px;top:${r[1]}px;width:${r[2]}px;height:${r[3]}px;`; c.appendChild(s); });
})();

// ---------- lobby: skins + difficulty ----------
const SKIN_COLORS = ['#ff5e5e','#ffb52e','#7CFC00','#28a7ff','#c26bff','#ff6bd6'];
let skinColor = SKIN_COLORS[3];
SKIN_COLORS.forEach((col,i)=>{
  const d=document.createElement('div'); d.className='skin'+(i===3?' sel':''); d.style.background=col;
  d.onclick=()=>{ skinColor=col; [...$('skins').children].forEach(x=>x.classList.remove('sel')); d.classList.add('sel'); };
  $('skins').appendChild(d);
});
$('pname').value = 'Player'+Math.floor(rand(10,99));

// ---------- player profiles (who's playing) ----------
const CHAR_COLORS = [
  {emoji:'🍌', color:'#ffd21f'}, {emoji:'🥷', color:'#3b3b52'}, {emoji:'🚀', color:'#28a7ff'},
  {emoji:'🤖', color:'#9aa7b5'}, {emoji:'🏴‍☠️', color:'#ff5e5e'}, {emoji:'🧙', color:'#c26bff'},
];
// WAVE3: premade cosmetic slots — a little personalization, visible to friends in multiplayer
const HATS = [
  {emoji:'🚫', name:'None'}, {emoji:'🧢', name:'Cap', color:'#e0442b'}, {emoji:'🎩', name:'Top Hat', color:'#1a1a22'},
  {emoji:'🪖', name:'Helmet', color:'#5a6b4a'}, {emoji:'🎉', name:'Party', color:'#c26bff'},
];
const GLASSES = [
  {emoji:'🚫', name:'None'}, {emoji:'🕶️', name:'Shades', color:'#111318'}, {emoji:'🥽', name:'Goggles', color:'#3fa9ff'},
];
const SHIRTS = [
  {emoji:'⬜', name:'Default'}, {emoji:'🟥', name:'Red', color:'#e0442b'}, {emoji:'🟦', name:'Blue', color:'#2b6ee0'},
  {emoji:'🟩', name:'Green', color:'#3fae4a'}, {emoji:'🟨', name:'Yellow', color:'#ffd21f'}, {emoji:'🟪', name:'Purple', color:'#c26bff'},
];
const PANTS = [
  {emoji:'⬜', name:'Default'}, {emoji:'⬛', name:'Black', color:'#22232b'}, {emoji:'🟦', name:'Navy', color:'#233a66'},
  {emoji:'🟫', name:'Khaki', color:'#8a7a51'}, {emoji:'🟩', name:'Camo', color:'#4a5a3a'},
];
const SOCKS = [
  {emoji:'🚫', name:'None'}, {emoji:'⬜', name:'White', color:'#eef1f5'}, {emoji:'🟥', name:'Red', color:'#e0442b'}, {emoji:'🟨', name:'Yellow', color:'#ffd21f'},
];
function defaultOutfit(){ return {hat:0, glasses:0, shirt:0, pants:0, socks:0}; }
const DEFAULT_PLAYERS = [
  { name:'Mats', age:'', photo:'', char:2, diff:1, outfit:defaultOutfit() },
  { name:'Guy',  age:'', photo:'', char:4, diff:2, outfit:defaultOutfit() },
  { name:'Mika', age:12, photo:'', char:1, diff:1, outfit:defaultOutfit() },
];
let players = [], activeP = 0, editingP = -1, loggedIn = false;
try { players = JSON.parse(localStorage.getItem('fr_players')) || []; } catch(e){ players = []; }
if(!players.length){ players = DEFAULT_PLAYERS; }
// WAVE2: profile migration — per-player passwords, admin flags
players.forEach(p=>{
  if(p.pwd===undefined || p.pwd==='') p.pwd='password';
  const nm=(p.name||'').trim().toLowerCase();
  if(nm==='mika') p.admin=true;
  p.admin=!!p.admin;
  if(!p.outfit) p.outfit=defaultOutfit();   // WAVE3: migrate profiles saved before cosmetics existed
});
activeP = clamp(parseInt(localStorage.getItem('fr_activeP')||'0')||0, 0, players.length-1);
function savePlayers(){ try { localStorage.setItem('fr_players', JSON.stringify(players)); localStorage.setItem('fr_activeP', activeP); } catch(e){} }
let currentOutfit = defaultOutfit();   // WAVE3: active profile's cosmetic picks — read when building your own multiplayer avatar
function applyPlayer(){
  const pl = players[activeP]; if(!pl) return;
  $('pname').value = pl.name;
  skinColor = CHAR_COLORS[pl.char||0].color;
  currentOutfit = pl.outfit || defaultOutfit();
  diffIx = pl.diff!==undefined ? pl.diff : 1;
  [...$('diffs').children].forEach((x,j)=>x.style.borderColor = j===diffIx?'#ffe93b':'rgba(255,255,255,.25)');
}
function renderPlayers(){
  $('players').innerHTML='';
  players.forEach((pl,i)=>{
    if(loggedIn && i!==activeP) return;   // logged in: show only your own profile
    const d=document.createElement('div'); d.className='pcard'+(i===activeP?' sel':'');
    const av = pl.photo ? `style="background-image:url(${pl.photo})"` : '';
    d.innerHTML = `<div class="edit">✎</div><div class="av" ${av}>${pl.photo?'':CHAR_COLORS[pl.char||0].emoji}</div>
      <div class="pn">${pl.admin?'🛡 ':''}${pl.name}</div><div class="pa">${pl.age?('age '+pl.age+' · '):''}${DIFFS[pl.diff!==undefined?pl.diff:1].name.split(' ')[0]}</div>`;
    d.onclick = (ev)=>{
      if(ev.target.classList.contains('edit')){ openEditor(i); return; }
      activeP=i; savePlayers(); applyPlayer(); renderPlayers();
    };
    $('players').appendChild(d);
  });
  if(!loggedIn && players.length<4){
    const add=document.createElement('div'); add.className='pcard';
    add.innerHTML='<div class="av">＋</div><div class="pn">Add</div><div class="pa">new player</div>';
    add.onclick=()=>{ players.push({name:'Player'+(players.length+1), age:'', photo:'', char:0, diff:1, pwd:'password', admin:false, outfit:defaultOutfit()}); activeP=players.length-1; savePlayers(); renderPlayers(); openEditor(activeP); };
    $('players').appendChild(add);
  }
  if(loggedIn){
    const sw=document.createElement('div');
    sw.style.cssText='width:100%; text-align:center; margin-top:4px;';
    sw.innerHTML='<button onclick="logOut()" style="background:none; border:none; color:#9f95d6; font-size:12px; font-weight:700; cursor:pointer; text-decoration:underline; font-family:inherit;">⇄ LOG OUT / SWITCH PLAYER</button>';
    $('players').appendChild(sw);
  }
}
function buildOutfitPicker(containerId, arr, pl, slot){   // WAVE3: reused for hat/glasses/shirt/pants/socks pickers
  const el=$(containerId); el.innerHTML='';
  arr.forEach((o,oi)=>{
    const b=document.createElement('button'); b.textContent=o.emoji; b.title=o.name;
    b.style.cssText='font-size:16px; padding:3px 7px; border-radius:8px; cursor:pointer; background:rgba(255,255,255,.08); border:2px solid '+(oi===(pl.outfit[slot]||0)?'#ffe93b':'transparent');
    b.onclick=(e)=>{ e.preventDefault(); pl.outfit[slot]=oi; [...el.children].forEach((x,xj)=>x.style.borderColor = xj===oi?'#ffe93b':'transparent'); buildPreviewOutfit(pl); };
    el.appendChild(b);
  });
}
// ---------- WAVE3: live 3D mannequin preview while customizing (mirrors makeBot's cosmetic attachment) ----------
let previewRenderer=null, previewScene=null, previewCamera=null, previewGroup=null, previewSpin=0, previewRAF=null;
function ensurePreview(){
  if(previewRenderer) return;
  const canvas=$('peOutfitPreview');
  if(!canvas){ console.warn('[outfit preview] #peOutfitPreview canvas not found in the page — likely an old cached page; hard-refresh (Ctrl/Cmd+Shift+R).'); return; }
  try{
    previewRenderer=new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  } catch(e){ console.warn('[outfit preview] WebGL init failed:', e); return; }
  previewRenderer.setSize(260,260,false);
  previewScene=new THREE.Scene();
  previewCamera=new THREE.PerspectiveCamera(34,1,0.1,20);
  previewCamera.position.set(0,1.5,4.4);
  previewCamera.lookAt(0,1.1,0);
  previewScene.add(new THREE.AmbientLight(0xffffff,0.95));
  const dl=new THREE.DirectionalLight(0xffffff,0.6); dl.position.set(2,4,3); previewScene.add(dl);
}
function buildPreviewOutfit(pl){
  ensurePreview();
  if(!previewRenderer) return;   // canvas missing / WebGL unavailable — fail quietly, rest of the editor still works
  if(previewGroup) previewScene.remove(previewGroup);
  const outfit=pl.outfit||defaultOutfit();
  const g=new THREE.Group();
  const bodyMat=toonMat({color:new THREE.Color(CHAR_COLORS[pl.char||0].color)});
  const torso=new THREE.Mesh(BOTGEO.torso, bodyMat); torso.position.y=1.35;
  const head=new THREE.Mesh(BOTGEO.head, botHeadMats[0]); head.position.y=2.18;
  const limb=(geo,mat,px,py,oy)=>{ const piv=new THREE.Group(); piv.position.set(px,py,0);
    const m=new THREE.Mesh(geo,mat); m.position.y=oy; piv.add(m); g.add(piv); return piv; };
  const pantsMat = outfit.pants ? toonMat({color:new THREE.Color(PANTS[outfit.pants].color)}) : botPantsMat;
  const legL=limb(BOTGEO.leg, pantsMat, -.21, .92, -.45);
  const legR=limb(BOTGEO.leg, pantsMat,  .21, .92, -.45);
  limb(BOTGEO.arm, bodyMat, -.52, 1.8, -.38);
  limb(BOTGEO.arm, bodyMat,  .52, 1.8, -.38);
  g.add(torso,head);
  if(outfit.shirt){ const shirt=new THREE.Mesh(new THREE.BoxGeometry(.86,1.08,.5), toonMat({color:new THREE.Color(SHIRTS[outfit.shirt].color)})); torso.add(shirt); }
  if(outfit.hat){ const hat=new THREE.Mesh(new THREE.BoxGeometry(.5,.28,.5), toonMat({color:new THREE.Color(HATS[outfit.hat].color)})); hat.position.set(0,.42,0); head.add(hat); }
  if(outfit.glasses){ const glasses=new THREE.Mesh(new THREE.BoxGeometry(.48,.14,.06), toonMat({color:new THREE.Color(GLASSES[outfit.glasses].color)})); glasses.position.set(0,-.03,.32); head.add(glasses); }
  if(outfit.socks){ const sockMat=toonMat({color:new THREE.Color(SOCKS[outfit.socks].color)});
    [legL,legR].forEach(piv=>{ const sock=new THREE.Mesh(new THREE.BoxGeometry(.3,.22,.3), sockMat); sock.position.set(0,-.8,0); piv.add(sock); }); }
  previewGroup=g; previewScene.add(g);
  if(!previewRAF) previewTick();
}
function previewTick(){
  if(previewGroup){ previewSpin+=0.012; previewGroup.rotation.y=previewSpin; previewRenderer.render(previewScene, previewCamera); }
  previewRAF=requestAnimationFrame(previewTick);
}
function stopPreview(){ if(previewRAF){ cancelAnimationFrame(previewRAF); previewRAF=null; } }
function openEditor(i){
  editingP=i; const pl=players[i];
  if(!pl.outfit) pl.outfit=defaultOutfit();
  $('pEditor').style.display='flex';
  $('peName').value=pl.name; $('peAge').value=pl.age||''; $('peDiff').value=pl.diff!==undefined?pl.diff:1;
  $('peChars').innerHTML='';
  CHAR_COLORS.forEach((c,ci)=>{
    const b=document.createElement('button'); b.textContent=c.emoji;
    b.style.cssText='font-size:20px; padding:4px 8px; border-radius:8px; cursor:pointer; background:rgba(255,255,255,.08); border:2px solid '+(ci===(pl.char||0)?'#ffe93b':'transparent');
    b.onclick=(e)=>{ e.preventDefault(); pl.char=ci; [...$('peChars').children].forEach((x,xj)=>x.style.borderColor = xj===ci?'#ffe93b':'transparent'); buildPreviewOutfit(pl); };
    $('peChars').appendChild(b);
  });
  buildOutfitPicker('peHat', HATS, pl, 'hat');
  buildOutfitPicker('peGlasses', GLASSES, pl, 'glasses');
  buildOutfitPicker('peShirt', SHIRTS, pl, 'shirt');
  buildOutfitPicker('pePants', PANTS, pl, 'pants');
  buildOutfitPicker('peSocks', SOCKS, pl, 'socks');
  buildPreviewOutfit(pl);
}
$('pePhoto').addEventListener('change', e=>{
  const f=e.target.files[0]; if(!f||editingP<0) return;
  const img=new Image(), rd=new FileReader();
  rd.onload=()=>{ img.onload=()=>{
    const cv=document.createElement('canvas'); cv.width=cv.height=128;
    const cx=cv.getContext('2d');
    const m=Math.min(img.width,img.height);
    cx.drawImage(img,(img.width-m)/2,(img.height-m)/2,m,m,0,0,128,128);
    players[editingP].photo = cv.toDataURL('image/jpeg',.8);
    savePlayers(); renderPlayers();
  }; img.src=rd.result; };
  rd.readAsDataURL(f);
});
$('peSave').onclick=(e)=>{ e.preventDefault();
  if(editingP<0) return;
  players[editingP].name=$('peName').value.trim()||'Player';
  players[editingP].age=$('peAge').value?parseInt($('peAge').value):'';
  players[editingP].diff=parseInt($('peDiff').value);
  if(loggedIn && editingP===activeP) persistLogin();   // keep persisted login in sync with rename
  savePlayers(); $('pEditor').style.display='none'; editingP=-1; stopPreview();
  applyPlayer(); renderPlayers();
};
$('peDel').onclick=(e)=>{ e.preventDefault();
  if(editingP<0||players.length<=1) return;
  const wasSelf = editingP===activeP;
  players.splice(editingP,1); activeP=0; editingP=-1;
  savePlayers(); $('pEditor').style.display='none'; stopPreview(); applyPlayer(); renderPlayers();
  if(loggedIn && wasSelf) logOut();
};

const DIFFS = [   // the real Duke Nukem 3D (1996) skill names
  { name:'PIECE OF CAKE',  bots:8,  acc:0.5, dmg:0.55, cd:1.6, chests:18 },
  { name:"LET'S ROCK",     bots:12, acc:1.0, dmg:1.0,  cd:1.0, chests:14 },
  { name:'COME GET SOME',  bots:16, acc:1.4, dmg:1.35, cd:0.75, chests:12 },
  { name:"DAMN, I'M GOOD", bots:20, acc:1.9, dmg:1.8,  cd:0.55, chests:10 },
];
let diffIx = 1, botCount = 0;   // 0 = use difficulty default
const TIERS={ green:{col:0x41d94d,acc:.7,dmg:.7,cd:1.35}, blue:{col:0x2e8bff,acc:1,dmg:1,cd:1},
  red:{col:0xff4444,acc:1.2,dmg:1.2,cd:.85}, purple:{col:0xb44dff,acc:1.45,dmg:1.4,cd:.7} };
const TIER_MIX=[ ['green'],
  ['green','green','green','blue','blue'],
  ['blue','blue','red','red','purple'],
  ['red','red','red','purple','purple','purple','purple','purple','purple','purple'] ];
function pickTier(){ const m=TIER_MIX[diffIx]||TIER_MIX[1]; return m[Math.floor(rand(0,m.length))]; }
DIFFS.forEach((d,i)=>{
  const b=document.createElement('button'); b.textContent=d.name; b.className='chipD';
  b.style.cssText='padding:7px 12px;border-radius:999px;border:2px solid '+(i===1?'#ffe93b':'rgba(255,255,255,.25)')+';background:rgba(0,0,0,.25);color:#e8e2ff;font-weight:800;font-size:12px;cursor:pointer;';
  b.onclick=()=>{ diffIx=i; [...$('diffs').children].forEach((x,j)=>x.style.borderColor = j===i?'#ffe93b':'rgba(255,255,255,.25)'); };
  $('diffs').appendChild(b);
});
if(!players.some(p=>p.name.toLowerCase()==='mate')) { players.push({name:'Mate', age:'', photo:'', char:5, diff:1, pwd:'password', admin:false, outfit:defaultOutfit()}); }
savePlayers();   // persist WAVE2 migration (pwd/admin) even for stored profiles
try{
  if(!localStorage.getItem('fr_pwreset1')){
    const mk=players.find(p=>p.name.trim().toLowerCase()==='mika');
    if(mk){ mk.pwd='password'; savePlayers(); }
    localStorage.setItem('fr_pwreset1','1');
  }
}catch(e){}
renderPlayers(); applyPlayer();
// ---------- login screen (persists across PLAY AGAIN reloads via localStorage fr_login) ----------
let loginSel = activeP, loginTries = 0;
function persistLogin(){ try{ localStorage.setItem('fr_login', players[activeP].name); }catch(e){} }
function completeLogin(){
  activeP=loginSel; loggedIn=true; persistLogin();
  savePlayers(); applyPlayer(); renderPlayers();
  $('loginOverlay').style.display='none';
  updateAdminBtn();
}
function logOut(){
  loggedIn=false; try{ localStorage.removeItem('fr_login'); }catch(e){}
  loginSel=clamp(activeP,0,players.length-1); loginTries=0;
  $('loginErr').textContent=''; $('loginPw').value='';
  renderLogin(); renderPlayers();
  $('adminOverlay').style.display='none';
  $('loginOverlay').style.display='flex';
  updateAdminBtn();
  $('loginUser').focus();
}
window.logOut=logOut;
function renderLogin(){ $('loginUser').value=''; }
function tryLogin(){
  const uname=$('loginUser').value.trim().toLowerCase();
  const ix=players.findIndex(p=>p.name.trim().toLowerCase()===uname);
  if(ix<0){
    loginTries++;
    $('loginErr').textContent = uname ? `❌ No soldier called “${$('loginUser').value.trim()}” here. Ask Mika for an invite.` : '❌ Type your first name, soldier.';
    const box=$('loginBox'); box.style.animation='none'; void box.offsetWidth; box.style.animation='shake .4s';
    return;
  }
  const pl=players[ix];
  if($('loginPw').value===(pl.pwd||'password')){
    loginSel=ix;
    completeLogin();
  } else {
    loginTries++;
    const msgs=['❌ ACCESS DENIED','❌ Still no. Think lower-case…','❌ It is literally the word everyone tells you not to use','🤦 Ask Guy. Or read the last hint again.'];
    $('loginErr').textContent = msgs[Math.min(loginTries-1,msgs.length-1)];
    const box=$('loginBox'); box.style.animation='none'; void box.offsetWidth; box.style.animation='shake .4s';
    $('loginPw').value=''; $('loginPw').focus();
  }
}
window.tryLogin=tryLogin;
$('loginPw').addEventListener('keydown', e=>{ if(e.key==='Enter') tryLogin(); });
$('loginUser').addEventListener('keydown', e=>{ if(e.key==='Enter') $('loginPw').focus(); });
renderLogin();
// auto-login: skip the overlay when a persisted login is still valid
(function(){
  let saved=null; try{ saved=localStorage.getItem('fr_login'); }catch(e){}
  const ix = saved!=null ? players.findIndex(p=>p.name===saved) : -1;
  if(ix>=0){ loginSel=ix; completeLogin(); }
})();

// ---------- WAVE2: create-profile signup ----------
let suChar=0;
(function(){
  CHAR_COLORS.forEach((c,ci)=>{
    const b=document.createElement('button'); b.textContent=c.emoji;
    b.style.cssText='font-size:20px; padding:4px 8px; border-radius:8px; cursor:pointer; background:rgba(255,255,255,.08); border:2px solid '+(ci===0?'#ffe93b':'transparent');
    b.onclick=(e)=>{ e.preventDefault(); suChar=ci; [...$('suChars').children].forEach((x,xj)=>x.style.borderColor = xj===ci?'#ffe93b':'transparent'); };
    $('suChars').appendChild(b);
  });
  $('createLink').onclick=(e)=>{ e.preventDefault();
    $('loginBox').style.display='none'; $('signupBox').style.display='block';
    $('suForm').style.display='block'; $('suDone').style.display='none'; $('suErr').textContent='';
    $('suName').focus();
  };
  $('suBack').onclick=()=>{ $('signupBox').style.display='none'; $('loginBox').style.display='block'; };
  $('suGo').onclick=()=>{
    const nm=$('suName').value.trim();
    if(!nm){ $('suErr').textContent='❌ You need a name, recruit.'; return; }
    if(players.some(p=>p.name.trim().toLowerCase()===nm.toLowerCase())){ $('suErr').textContent='❌ That soldier already exists. Log in instead.'; return; }
    players.push({ name:nm.slice(0,14), age:$('suAge').value?parseInt($('suAge').value):'', photo:'', char:suChar, diff:1,
      pwd:$('suPw').value||'password', admin:false, outfit:defaultOutfit() });
    savePlayers(); renderPlayers();
    $('suForm').style.display='none'; $('suDone').style.display='block';
  };
})();

// ---------- WAVE2: admin panel + invite links ----------
function isAdmin(){ return loggedIn && players[activeP] && !!players[activeP].admin; }
function updateAdminBtn(){
  $('adminBtn').style.display = isAdmin() ? 'inline-block' : 'none';
}
function inviteURL(p){
  return location.origin + '/#invite=' + btoa(encodeURIComponent(JSON.stringify({n:p.name, p:p.pwd||'password', c:p.char||0})));
}
function showInvite(i){
  const p=players[i]; if(!p) return;
  $('invitePane').style.display='block';
  $('invName').textContent='📩 Invite link for '+p.name+' — send it to them:';
  $('invUrl').value=inviteURL(p);
  $('invMsg').textContent='';
  $('invShare').style.display = navigator.share ? 'inline-block' : 'none';
}
$('invCopy').onclick=()=>{
  const u=$('invUrl').value;
  const done=()=>{ $('invMsg').textContent='✅ Copied — paste it to your recruit!'; };
  if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(done).catch(()=>{ $('invUrl').select(); try{document.execCommand('copy');done();}catch(e){} });
  else { $('invUrl').select(); try{ document.execCommand('copy'); done(); }catch(e){ $('invMsg').textContent='Copy failed — long-press the link instead'; } }
};
$('invShare').onclick=()=>{ try{ navigator.share({title:'FORTRESS ROYALE invite', text:'You are invited to the island! Tap to join:', url:$('invUrl').value}).catch(()=>{}); }catch(e){} };
function renderAdmin(){
  const L=$('adminList'); L.innerHTML='';
  const btn=(label,act,i,col)=>`<button onclick="admAct('${act}',${i})" style="padding:4px 9px; border:none; border-radius:7px; background:${col||'#3a2a75'}; color:#fff; font-weight:800; font-size:11px; cursor:pointer; font-family:inherit;">${label}</button>`;
  players.forEach((p,i)=>{
    const d=document.createElement('div');
    d.style.cssText='display:flex; flex-wrap:wrap; align-items:center; gap:6px; padding:9px 10px; margin:6px 0; background:rgba(255,255,255,.05); border:2px solid rgba(255,255,255,.15); border-radius:12px;';
    d.innerHTML = `<span style="font-size:22px;">${CHAR_COLORS[p.char||0].emoji}</span>
      <b style="min-width:86px;">${p.name}</b>
      <span style="font-size:11px; color:#9f95d6; flex:1;">${p.admin?'🛡 admin ':''}</span>
      ${btn('✏ RENAME','rename',i)}
      ${btn('🔑 SET PW','pwd',i)}
      ${btn(p.admin?'🛡 REVOKE':'🛡 MAKE ADMIN','admin',i)}
      ${i===activeP?'':btn('🗑','del',i,'#a03030')}
      ${btn('📩 INVITE LINK','invite',i,'#8a6a10')}`;
    L.appendChild(d);
  });
}
const LAB_FIELDS={
  dad:[['hp','HP',2000],['speed','Speed',9],['scale','Size',2.6],['dmg','Damage ×',2],['burst','Burst every (s)',6],['rocket','Rocket every (s)',5]],
};
function renderLab(){
  const L=$('labList'); if(!L) return; L.innerHTML='';
  Object.entries(STROYERS).forEach(([key,cfg])=>{
    const d=document.createElement('div');
    d.style.cssText='padding:9px 10px; margin:6px 0; background:rgba(201,91,255,.08); border:2px solid rgba(201,91,255,.35); border-radius:12px;';
    const on = bcfg(key,'off',0)!==1;
    let inner='<b style="color:#e0b3ff;">'+cfg.name+'</b> <label style="font-size:11px; color:'+(on?'#7CFC00':'#ff8a8a')+'; font-weight:800; margin-left:8px; cursor:pointer;"><input type="checkbox" data-boss="'+key+'" data-f="off" '+(on?'checked':'')+' style="accent-color:#7CFC00; vertical-align:middle;"> '+(on?'ACTIVE':'INACTIVE')+'</label><div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:6px;">';
    LAB_FIELDS[key].forEach(([f,label,def])=>{
      const val=bcfg(key,f,def);
      inner+=`<label style="font-size:10.5px; color:#9f95d6;">${label}<br><input data-boss="${key}" data-f="${f}" value="${val}" type="number" step="any" style="width:72px; padding:4px 6px; border-radius:6px; border:1px solid rgba(201,91,255,.5); background:rgba(10,5,35,.7); color:#fff; font-family:inherit;"></label>`;
    });
    inner+='</div>';
    d.innerHTML=inner;
    L.appendChild(d);
  });
}
window.saveLab=()=>{
  if(!isAdmin()) return;
  document.querySelectorAll('#labList input').forEach(inp=>{
    const k=inp.dataset.boss, f=inp.dataset.f;
    bossCfg[k]=bossCfg[k]||{};
    bossCfg[k][f] = inp.type==='checkbox' ? (inp.checked?0:1) : inp.value;
  });
  saveBossCfg();
  cheatToast('🧪 STROYER LAB SAVED — next match uses your settings');
};
window.resetLab=()=>{ if(!isAdmin()) return; bossCfg={}; saveBossCfg(); renderLab(); cheatToast('🧪 STROYER LAB RESET TO FACTORY'); };
window.admAct=(act,i)=>{
  const p=players[i]; if(!p||!isAdmin()) return;
  if(act==='rename'){ const n=prompt('New name for '+p.name+':', p.name); if(n&&n.trim()){ p.name=n.trim().slice(0,14); if(i===activeP) persistLogin(); } }
  else if(act==='pwd'){ const n=prompt('New password for '+p.name+':', p.pwd||'password'); if(n!=null&&n!=='') p.pwd=n; }
  else if(act==='admin'){ p.admin=!p.admin; }
  else if(act==='del'){
    if(i===activeP) return;   // can't delete yourself
    if(!confirm('Delete '+p.name+'? Their profile is gone forever.')) return;
    players.splice(i,1);
    if(activeP>i) activeP--;
    activeP=clamp(activeP,0,players.length-1);
    $('invitePane').style.display='none';
  }
  else if(act==='invite'){ showInvite(i); }
  savePlayers(); renderAdmin(); renderPlayers(); updateAdminBtn();
};
$('adminBtn').onclick=()=>{ if(!isAdmin()) return; $('invitePane').style.display='none'; renderAdmin(); renderLab(); $('adminOverlay').style.display='flex'; };
$('admNew').onclick=()=>{
  if(!isAdmin()) return;
  const n=prompt('Name of the new player:'); if(!n||!n.trim()) return;
  const nm=n.trim().slice(0,14);
  let ix=players.findIndex(p=>p.name.trim().toLowerCase()===nm.toLowerCase());
  if(ix<0){
    players.push({name:nm, age:'', photo:'', char:(Math.random()*CHAR_COLORS.length)|0, diff:1, pwd:'password', admin:false, outfit:defaultOutfit()});
    ix=players.length-1;
    savePlayers(); renderAdmin(); renderPlayers();
  }
  showInvite(ix);
};

// ---------- WAVE2: #invite= links — instant profile, straight into the lobby ----------
(function(){
  const m=(location.hash||'').match(/^#invite=(.+)/); if(!m) return;
  let d=null;
  try{ d=JSON.parse(decodeURIComponent(atob(m[1]))); }catch(e){}
  try{ history.replaceState(null,'',location.pathname+location.search); }catch(e){ location.hash=''; }
  if(!d || !d.n) return;
  const nm=String(d.n).slice(0,14);
  let ix=players.findIndex(p=>p.name.trim().toLowerCase()===nm.trim().toLowerCase());
  if(ix<0){
    players.push({ name:nm, age:'', photo:'', char:clamp(parseInt(d.c)||0,0,CHAR_COLORS.length-1), diff:1,
      pwd:String(d.p||'password'), admin:false, outfit:defaultOutfit() });
    ix=players.length-1;
  }
  savePlayers();
  loginSel=ix; completeLogin();
  setTimeout(()=>cheatToast('🎉 WELCOME TO THE ISLAND, '+nm.toUpperCase()+'!'), 400);   // deferred: cheatToast state initialises later in this file
})();
$('botCountInput').addEventListener('input', ()=>{
  const v=parseInt($('botCountInput').value);
  botCount = v ? clamp(v,1,60) : 0;   // 0 = use difficulty default
});
$('mpCreateBtn').onclick=()=>{
  const code=mpGenRoomCode();
  $('mpCodeInput').value=code;
  mpJoinRoom(code, true);
  $('mpCreateBtn').style.display='none'; $('mpJoinBtn').style.display='none'; $('mpLeaveBtn').style.display='inline-block';
};
$('mpJoinBtn').onclick=()=>{
  const code=$('mpCodeInput').value.trim().toUpperCase();
  if(code.length<3){ $('mpStatus').textContent='❌ Type a room code first'; return; }
  mpJoinRoom(code, false);
  $('mpCreateBtn').style.display='none'; $('mpJoinBtn').style.display='none'; $('mpLeaveBtn').style.display='inline-block';
};
$('mpLeaveBtn').onclick=()=>{
  mpLeaveRoom();
  $('mpCodeInput').value=''; $('mpStatus').textContent='';
  $('mpCreateBtn').style.display='inline-block'; $('mpJoinBtn').style.display='inline-block'; $('mpLeaveBtn').style.display='none';
};

// ---------- three ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87c9ff);
scene.fog = new THREE.Fog(0x87c9ff, 108, 288);
const camera = new THREE.PerspectiveCamera(80, innerWidth/innerHeight, 0.1, 500);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth, innerHeight);
let perfMode = false; try{ perfMode = localStorage.getItem('fr_perf')==='1'; }catch(e){}
renderer.setPixelRatio(Math.min(devicePixelRatio, isTouch?1.5:(perfMode?1.25:2)));
renderer.shadowMap.enabled = true;
renderer.domElement.addEventListener('webglcontextlost', e=>{ e.preventDefault(); location.reload(); });
renderer.shadowMap.type = isTouch ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
$('app').appendChild(renderer.domElement);
addEventListener('resize', ()=>{ camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); if(post) post.resize(); });
const sun = new THREE.DirectionalLight(0xffeccb,1.25);
sun.position.set(60,120,40); sun.castShadow=true; sun.shadow.mapSize.set((isTouch||perfMode)?1024:2048,(isTouch||perfMode)?1024:2048);
sun.shadow.camera.left=-120; sun.shadow.camera.right=120; sun.shadow.camera.top=120; sun.shadow.camera.bottom=-120;
if(sun.shadow.radius!==undefined) sun.shadow.radius=4;
const amb = new THREE.AmbientLight(0xbfd9ff,.72);
const hemi = new THREE.HemisphereLight(0xa8d8ff,0x7cc46a,.55);
scene.add(sun, amb, hemi);

// ---------- toon shading (shared gradient map) ----------
const gradientMap = (()=>{
  const d = new Uint8Array([90,150,210,255]);
  const t = new THREE.DataTexture(d, 4, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true;
  return t;
})();
function toonMat(p){
  const m = new THREE.MeshToonMaterial(p);
  m.gradientMap = gradientMap;
  return m;
}

// ---------- procedural canvas textures ----------
function texCanvas(s){ const c=document.createElement('canvas'); c.width=c.height=s; return c; }
// grass: green base + noise speckle
const grassTex = (()=>{
  const cv=texCanvas(128), cx=cv.getContext('2d');
  cx.fillStyle='#57c142'; cx.fillRect(0,0,128,128);
  const tones=['#48b134','#63d24d','#3fa02c','#71dd58','#4fba3a'];
  for(let i=0;i<1100;i++){
    cx.fillStyle=tones[(Math.random()*tones.length)|0];
    cx.globalAlpha=.25+Math.random()*.5;
    cx.fillRect(Math.random()*128, Math.random()*128, 1+Math.random()*2, 1+Math.random()*2);
  }
  cx.globalAlpha=.35; cx.strokeStyle='#7ce365'; cx.lineWidth=1;
  for(let i=0;i<70;i++){ const x=Math.random()*128, y=Math.random()*128;
    cx.beginPath(); cx.moveTo(x,y); cx.lineTo(x+Math.random()*2-1, y-2-Math.random()*3); cx.stroke(); }
  cx.globalAlpha=1;
  const t=new THREE.CanvasTexture(cv);
  t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(30,30);
  t.anisotropy=Math.min(4, renderer.capabilities.getMaxAnisotropy());
  return t;
})();
// neutral light planks — tinted per-use via material color (walls, ramps, chests)
function drawPlanks(cx,s,seam){
  cx.fillStyle='#e8e2d8'; cx.fillRect(0,0,s,s);
  const rows=4, h=s/rows;
  for(let r=0;r<rows;r++){
    cx.fillStyle=['#e8e2d8','#ded6c8','#e2dbce','#d8d0c0'][r%4];
    cx.fillRect(0,r*h,s,h);
    // grain streaks
    cx.globalAlpha=.12; cx.strokeStyle='#8a7a60'; cx.lineWidth=1;
    for(let g=0;g<6;g++){ const y=r*h+2+Math.random()*(h-4);
      cx.beginPath(); cx.moveTo(0,y);
      for(let x=0;x<=s;x+=16) cx.lineTo(x, y+Math.sin(x*.2+r)*1.5+Math.random());
      cx.stroke(); }
    cx.globalAlpha=1;
    // knots
    if(Math.random()<.8){ cx.globalAlpha=.2; cx.fillStyle='#6a5a40';
      cx.beginPath(); cx.arc(Math.random()*s, r*h+h/2, 2+Math.random()*2, 0, 7); cx.fill(); cx.globalAlpha=1; }
    // seams
    cx.fillStyle=seam; cx.fillRect(0, r*h, s, 2); cx.fillRect(0,(r+1)*h-1, s, 1);
  }
}
const plankTex = (()=>{
  const cv=texCanvas(128), cx=cv.getContext('2d');
  drawPlanks(cx,128,'#9a8a70');
  const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping;
  return t;
})();
// crate: planks + frame + diagonal cross brace (neutral, tinted by palette color)
const crateTex = (()=>{
  const cv=texCanvas(128), cx=cv.getContext('2d');
  drawPlanks(cx,128,'#9a8a70');
  cx.strokeStyle='#b0a288'; cx.lineWidth=11;
  cx.strokeRect(5.5,5.5,117,117);
  cx.beginPath(); cx.moveTo(8,8); cx.lineTo(120,120); cx.moveTo(120,8); cx.lineTo(8,120); cx.stroke();
  cx.strokeStyle='rgba(90,70,45,.45)'; cx.lineWidth=1;
  cx.strokeRect(11,11,106,106);
  cx.beginPath(); cx.moveTo(12,4); cx.lineTo(124,116); cx.moveTo(116,4); cx.lineTo(4,116); cx.stroke();
  const t=new THREE.CanvasTexture(cv); t.wrapS=t.wrapT=THREE.RepeatWrapping;
  return t;
})();

// ---------- drifting low-poly clouds ----------
const clouds=[];
{
  const cGeo = new THREE.IcosahedronGeometry(1,0);
  const cMat = toonMat({color:0xffffff, emissive:0xdfe8f2, emissiveIntensity:.45, fog:false});
  for(let i=0;i<9;i++){
    const g=new THREE.Group();
    const n=3+(Math.random()*3|0);
    for(let k=0;k<n;k++){
      const m=new THREE.Mesh(cGeo,cMat);
      const s=rand(4,8);
      m.scale.set(s, s*.55, s*.8);
      m.position.set(k*rand(3.5,5.5)-n*2, rand(-1,1.5), rand(-2,2));
      g.add(m);
    }
    g.position.set(rand(-240,240), rand(60,90), rand(-220,220));
    scene.add(g);
    clouds.push({g, speed:rand(1.2,3)});
  }
}

// ---------- map ----------
const MAP = 180;
const obstacles = [];
function box(w,h,d,x,y,z,color,rotY=0,tex){
  const p={color}; if(tex) p.map=tex;
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), toonMat(p));
  m.position.set(x,y,z); m.rotation.y=rotY; m.castShadow=m.receiveShadow=true; scene.add(m);
  const b = new THREE.Box3().setFromObject(m);
  obstacles.push({min:b.min,max:b.max,mesh:m});
  return m;
}
const ground = new THREE.Mesh(new THREE.CylinderGeometry(MAP,MAP,2,48), toonMat({color:0xffffff, map:grassTex}));
ground.position.y=-1; ground.receiveShadow=true; scene.add(ground);
const sand = new THREE.Mesh(new THREE.CylinderGeometry(MAP+8,MAP+8,1.6,48), toonMat({color:0xe8d28a}));
sand.position.y=-1.1; scene.add(sand);
const water = new THREE.Mesh(new THREE.CylinderGeometry(420,420,1,32), toonMat({color:0x2e9adf}));
water.position.y=-1.4; scene.add(water);
// foam ring at the water/sand boundary (pulses in the main loop)
const foamMat = new THREE.MeshBasicMaterial({color:0xd8f2ff, transparent:true, opacity:.28, depthWrite:false, side:THREE.DoubleSide});
const foam = new THREE.Mesh(new THREE.RingGeometry(MAP+7.6, MAP+11, 96), foamMat);
foam.rotation.x=-Math.PI/2; foam.position.y=-.88; scene.add(foam);
const palette=[0xd9822b,0xc8b28e,0x9a9a9a,0xb0653a];
for(let i=0;i<26;i++){ const s=rand(2.4,4.2); box(s,s,s, rand(-MAP*.75,MAP*.75), s/2, rand(-MAP*.75,MAP*.75), palette[i%4], rand(0,Math.PI), crateTex); }
for(let i=0;i<10;i++){ box(rand(10,18), rand(3.5,6), 1.6, rand(-MAP*.7,MAP*.7), 2.2, rand(-MAP*.7,MAP*.7), 0xcfcabc, rand(0,Math.PI)); }
const houseWinMat = new THREE.MeshBasicMaterial({color:0x0a0a14});
for(let i=0;i<6;i++){
  const x=rand(-MAP*.6,MAP*.6), z=rand(-MAP*.6,MAP*.6), c=[0xf2a24b,0x8fd3f4,0xf47c7c,0xb69cf4][i%4];
  const W=rand(9,11.5), D=rand(9,11.5), H=rand(5,6.6);
  box(W,H,D,x,H/2,z,c);
  const trim=new THREE.Mesh(new THREE.BoxGeometry(W+.4,.4,D+.4), toonMat({color:0x5a4a3a}));
  trim.position.set(x,.2,z); scene.add(trim);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(W,D)*.82,4,4), toonMat({color:0x8a4b2d}));
  roof.position.set(x,H+2,z); roof.rotation.y=Math.PI/4; roof.castShadow=true; scene.add(roof);
  const door=new THREE.Mesh(new THREE.BoxGeometry(1.8,3.2,.15), toonMat({color:0x4a3520}));
  door.position.set(x, 1.6, z+D/2+.08); scene.add(door);
  const winL=new THREE.Mesh(new THREE.BoxGeometry(.12,1.3,1.3), houseWinMat);
  winL.position.set(x-W/2-.06, H*.55, z+D*.16); scene.add(winL);
  const winR=new THREE.Mesh(new THREE.BoxGeometry(.12,1.3,1.3), houseWinMat);
  winR.position.set(x+W/2+.06, H*.55, z+D*.16); scene.add(winR);
}
// bark: vertical grain over brown, tiled around the trunk
const barkTex = (()=>{
  const cv=texCanvas(32), cx=cv.getContext('2d');
  cx.fillStyle='#8a5a2d'; cx.fillRect(0,0,32,32);
  cx.strokeStyle='rgba(0,0,0,.22)'; cx.lineWidth=1;
  for(let x=0;x<32;x+=3){ cx.beginPath(); cx.moveTo(x+rand(-1,1),0); cx.lineTo(x+rand(-1,1),32); cx.stroke(); }
  cx.strokeStyle='rgba(255,255,255,.12)';
  for(let x=1.5;x<32;x+=3){ cx.beginPath(); cx.moveTo(x,0); cx.lineTo(x,32); cx.stroke(); }
  const t=new THREE.CanvasTexture(cv);
  t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(3,2);
  return t;
})();
const barkMat = toonMat({color:0xffffff, map:barkTex});
const trees=[];
for(let i=0;i<40;i++){
  const x=rand(-MAP*.9,MAP*.9), z=rand(-MAP*.9,MAP*.9);
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.4,.6,rand(3,5),6), barkMat);
  trunk.position.set(x,2,z); trunk.castShadow=true;
  const crown=new THREE.Group();
  const leafHex=i%3?0x3fae4f:0x7CFC00;
  for(let k=0;k<3;k++){
    // k===0 is a centered anchor blob (always overlaps the trunk top); the rest cluster tightly around it
    const r = k===0 ? rand(1.8,2.6) : rand(1.3,2.0);
    const blob=new THREE.Mesh(new THREE.IcosahedronGeometry(r,0), toonMat({color:new THREE.Color(leafHex).offsetHSL(0,0,rand(-.06,.06))}));
    if(k>0) blob.position.set(rand(-.7,.7), rand(-.1,.5), rand(-.7,.7));
    blob.castShadow=true; crown.add(blob);
  }
  crown.position.set(x, trunk.position.y+trunk.geometry.parameters.height/2+.4, z);
  scene.add(trunk,crown);
  trees.push({trunk,crown,x,z,hp:3,alive:true});
}

// ---------- distant mountains (scenery, outside play area) ----------
for(let i=0;i<14;i++){
  const a = i/14*Math.PI*2 + rand(-.1,.1);
  const r = MAP + rand(45,90);
  const h = rand(28,70);
  const mt = new THREE.Mesh(new THREE.ConeGeometry(rand(18,34), h, 5),
    toonMat({color: new THREE.Color().setHSL(.28+rand(-.05,.05), .25, .32+rand(0,.1))}));
  mt.position.set(Math.cos(a)*r, h/2-2, Math.sin(a)*r);
  mt.rotation.y = rand(0,Math.PI); scene.add(mt);
  if(h>50){ const cap = new THREE.Mesh(new THREE.ConeGeometry(rand(6,10), h*.25, 5), toonMat({color:0xf4f7fa}));
    cap.position.set(mt.position.x, h-2-h*.12, mt.position.z); cap.rotation.y=mt.rotation.y; scene.add(cap); }
}
// ---------- rock outcrops (hard cover) ----------
for(let i=0;i<10;i++){
  const x=rand(-MAP*.7,MAP*.7), z=rand(-MAP*.7,MAP*.7);
  for(let k=0;k<3;k++){
    const s2=rand(1.4,3.2);
    const rock=new THREE.Mesh(new THREE.IcosahedronGeometry(s2,0), toonMat({color:0x8d9299}));
    rock.position.set(x+rand(-2.5,2.5), s2*.6, z+rand(-2.5,2.5));
    rock.rotation.set(rand(0,3),rand(0,3),rand(0,3)); rock.castShadow=rock.receiveShadow=true; scene.add(rock);
    const bb=new THREE.Box3().setFromObject(rock);
    obstacles.push({min:bb.min,max:bb.max,mesh:rock});
  }
}
// ---------- enterable forts (walk in the door, ambush from inside) ----------
function fort(x,z,c){
  const W=12, H=4.5, T=.6, DOOR=3;
  box(W,H,T, x, H/2, z-W/2, c);                    // back wall
  box(T,H,W, x-W/2, H/2, z, c);                    // left wall
  box(T,H,W, x+W/2, H/2, z, c);                    // right wall
  const seg=(W-DOOR)/2;                            // front wall with doorway
  box(seg,H,T, x-(DOOR/2+seg/2), H/2, z+W/2, c);
  box(seg,H,T, x+(DOOR/2+seg/2), H/2, z+W/2, c);
  const roof=new THREE.Mesh(new THREE.BoxGeometry(W+1,.5,W+1), toonMat({color:0x6b4a2f}));
  roof.position.set(x,H+.25,z); roof.castShadow=true; scene.add(roof);   // roof: no collision (you're under it)
  const win=new THREE.Mesh(new THREE.BoxGeometry(2.2,1.4,.2), new THREE.MeshBasicMaterial({color:0x0a0a14}));
  win.position.set(x, 2.6, z-W/2-.31); scene.add(win);                    // fake window slot
  return {x,z};
}
const forts=[ fort(-45,30,0x9a6a4a), fort(50,-52,0x7a7d85), fort(-20,-70,0xa8593f) ];

// ---------- WAVE2: multi-storey watchtowers (stairs inside, chest on the roof) ----------
const towerChestSpots=[], towerTorchSpots=[];
const TOWERS=[ {x:-85,z:-78,s:3}, {x:95,z:-8,s:2}, {x:30,z:68,s:2}, {x:-100,z:40,s:4}, {x:60,z:-95,s:5} ];   // clear of spawn + named zones + forts
function tower(x,z,storeys){
  const W=12, T=.5, SH=4.2, WIN=3.0, DOOR=3.0;   // full-size humans: tall storeys, big openings
  const wallMat=toonMat({color:0xb8a082, map:plankTex});
  const floorMat=toonMat({color:0x8a6a45, map:plankTex});
  const stepMat=toonMat({color:0x9a7a50, map:crateTex});
  function tb(w,h,d,px,py,pz,mat,cast){   // tower box: obstacle + raycast-blocking mesh
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat);
    m.position.set(x+px,py,z+pz);
    if(cast) m.castShadow=true;           // castShadow on outer walls only (perf)
    m.receiveShadow=true; scene.add(m);
    const b=new THREE.Box3().setFromObject(m);
    obstacles.push({min:b.min,max:b.max,mesh:m});
    return m;
  }
  const seg=(W-WIN)/2, dseg=(W-DOOR)/2;
  for(let s=0;s<storeys;s++){
    const y0=s*SH, mid=y0+SH/2;
    // floor slab (skip ground floor) — the strip over the flight below stays open (that's the stairwell)
    if(s>0){ const sideBelow=(s-1)%2 ? -1 : 1; tb(W-2.8,.25,W, -1.4*sideBelow, y0-.125, 0, floorMat, false); }
    // front wall (+z): doorway on the ground floor, window above
    if(s===0){
      tb(dseg,SH,T, -(DOOR/2+dseg/2), mid, W/2, wallMat, true);
      tb(dseg,SH,T,  (DOOR/2+dseg/2), mid, W/2, wallMat, true);
      tb(DOOR,SH-3.0,T, 0, 3.0+(SH-3.0)/2, W/2, wallMat, true);           // door lintel
    } else {
      tb(seg,SH,T, -(WIN/2+seg/2), mid, W/2, wallMat, true);
      tb(seg,SH,T,  (WIN/2+seg/2), mid, W/2, wallMat, true);
      tb(WIN,1.0,T, 0, y0+.5, W/2, wallMat, true);                        // sill
      tb(WIN,SH-2.8,T, 0, y0+2.8+(SH-2.8)/2, W/2, wallMat, true);         // lintel
    }
    // back wall (-z): window every storey
    tb(seg,SH,T, -(WIN/2+seg/2), mid, -W/2, wallMat, true);
    tb(seg,SH,T,  (WIN/2+seg/2), mid, -W/2, wallMat, true);
    tb(WIN,1.0,T, 0, y0+.5, -W/2, wallMat, true);
    tb(WIN,SH-2.8,T, 0, y0+2.8+(SH-2.8)/2, -W/2, wallMat, true);
    // solid side walls
    tb(T,SH,W, -W/2, mid, 0, wallMat, true);
    tb(T,SH,W,  W/2, mid, 0, wallMat, true);
    // internal staircase: thin floating treads, alternating east/west wall per storey (no headroom clashes)
    const side=s%2 ? -1 : 1;
    for(let k=0;k<8;k++){
      tb(2.4,.5,1.7, side*4.4, y0+.525*(k+1)-.25, 4.7-k*1.35, stepMat, false);
    }
  }
  // rooftop: slab (top flight's strip stays open — you arrive up the last treads) + parapet walls
  const ry=storeys*SH, sideTop=(storeys-1)%2 ? -1 : 1;
  tb(W-2.8,.25,W, -1.4*sideTop, ry-.125, 0, floorMat, false);
  tb(W,1.15,.35, 0, ry+.575, W/2-.17, wallMat, true);
  tb(W,1.15,.35, 0, ry+.575, -W/2+.17, wallMat, true);
  tb(.35,1.15,W, -W/2+.17, ry+.575, 0, wallMat, true);
  tb(.35,1.15,W, W/2-.17, ry+.575, 0, wallMat, true);
  towerChestSpots.push({x:x-1.4*sideTop, z:z, y:ry});   // rooftop chest (on the solid slab) — worth the climb
  towerChestSpots.push({x:x-2.4, z:z-2.4, y:0});     // ground-floor chest
  towerTorchSpots.push({x:x-2, y:3.2, z:z+W/2+.4}, {x:x+2, y:3.2, z:z+W/2+.4});
  return {x,z,h:ry};
}
const towers=TOWERS.map(t=>tower(t.x,t.z,t.s));

// ---------- storm ----------
let stormR=240, stormTarget=240, stormShrinkRate=0;
const stormMat = new THREE.MeshBasicMaterial({color:0x9b30ff,transparent:true,opacity:.3,side:THREE.DoubleSide,depthWrite:false});
const stormWall = new THREE.Mesh(new THREE.CylinderGeometry(200,200,160,64,1,true), stormMat);
stormWall.position.y=40; scene.add(stormWall);
const stormMat2 = new THREE.MeshBasicMaterial({color:0xff4de3,transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false});
const stormWall2 = new THREE.Mesh(new THREE.CylinderGeometry(199,199,160,64,1,true), stormMat2);
stormWall2.position.y=40; scene.add(stormWall2);
const edgeRing = new THREE.Mesh(new THREE.RingGeometry(0.985,1,96), new THREE.MeshBasicMaterial({color:0xff4de3,transparent:true,opacity:.85,side:THREE.DoubleSide,depthWrite:false}));
edgeRing.rotation.x=-Math.PI/2; edgeRing.position.y=0.15; edgeRing.scale.setScalar(200); scene.add(edgeRing);
const stormPhases=[{wait:75,to:120,rate:1.0},{wait:70,to:60,rate:0.9},{wait:60,to:24,rate:0.8},{wait:50,to:7,rate:0.7}];  // ~5 min match  // outrunnable: max 10u/s vs sprint 14.5
let phaseIx=0, phaseTimer=stormPhases[0].wait, shrinking=false;
// lightning flashes inside the storm wall while it shrinks (thunder throttled to 1 per 10s)
const boltLight=new THREE.PointLight(0xb44dff,0,110);
boltLight.position.set(0,40,0); scene.add(boltLight);
let boltT=0, boltNext=rand(4,8), lastRumble=-999;

// ---------- storm sunset: day → golden hour → blood dusk as the circle shrinks ----------
const MOODS=[
  { sky:new THREE.Color(0x87c9ff), fog:new THREE.Color(0x87c9ff), sunC:new THREE.Color(0xffeccb), sunI:1.25,
    ambC:new THREE.Color(0xbfd9ff), ambI:.72, hemS:new THREE.Color(0xa8d8ff), hemG:new THREE.Color(0x7cc46a), hemI:.55,
    sp:new THREE.Vector3(60,120,40) },
  { sky:new THREE.Color(0xffab5e), fog:new THREE.Color(0xf5a054), sunC:new THREE.Color(0xffa64d), sunI:1.05,
    ambC:new THREE.Color(0xd9ae7e), ambI:.55, hemS:new THREE.Color(0xffc98a), hemG:new THREE.Color(0x9a7340), hemI:.45,
    sp:new THREE.Vector3(105,55,15) },
  { sky:new THREE.Color(0x451437), fog:new THREE.Color(0x64182e), sunC:new THREE.Color(0xff3b2e), sunI:.45,
    ambC:new THREE.Color(0x4a2a66), ambI:.38, hemS:new THREE.Color(0x71204e), hemG:new THREE.Color(0x2a1030), hemI:.3,
    sp:new THREE.Vector3(130,16,5) },
];
const moodSky=new THREE.Color(0x87c9ff), moodFog=new THREE.Color(0x87c9ff);
function updateMood(){
  if(nightMode) return;                          // WAVE2: night ops — already dark, sunset lerp disabled
  const t=clamp((240-stormR)/216,0,1);           // stormR 240 → 24 maps day → dusk
  const a=MOODS[t<.5?0:1], b=MOODS[t<.5?1:2], k=t<.5?t*2:(t-.5)*2;
  moodSky.lerpColors(a.sky,b.sky,k);
  moodFog.lerpColors(a.fog,b.fog,k);
  sun.color.lerpColors(a.sunC,b.sunC,k);   sun.intensity=a.sunI+(b.sunI-a.sunI)*k;
  amb.color.lerpColors(a.ambC,b.ambC,k);   amb.intensity=a.ambI+(b.ambI-a.ambI)*k;
  hemi.color.lerpColors(a.hemS,b.hemS,k);  hemi.groundColor.lerpColors(a.hemG,b.hemG,k);
  hemi.intensity=a.hemI+(b.hemI-a.hemI)*k;
  sun.position.lerpVectors(a.sp,b.sp,k);
  scene.fog.far=288-60*t;
}

// ---------- weapons ----------
const WEAPONS = {
  knife:  { name:'COMBAT KNIFE',   type:'melee',  dmg:35, rate:0.35, range:2.8, sfx:'knife', color:0xb8c4cf },
  chainsaw:{ name:'CHAINSAW',      type:'melee',  dmg:30, rate:0.11, range:3.6, sfx:'chainsaw', auto:true, color:0xd93b1f },
  rifle:  { name:'AK-47', type:'gun',    dmg:30, hs:2.2, rate:0.105, kick:0.028, mag:30, res:90, reload:1100, spread:0.011, auto:true,  sfx:'shot',    pellets:1, range:220, color:0x2f3542 },
  m4:     { name:'M4A4',           type:'gun',    dmg:25, hs:2.2, rate:0.09, kick:0.012, mag:30, res:90, reload:1050, spread:0.007, auto:true,  sfx:'shot',    pellets:1, range:230, color:0x36454f },
  deagle: { name:'DESERT EAGLE',   type:'gun',    dmg:45, hs:2.5, rate:0.42, kick:0.03,  mag:7,  res:35, reload:1200, spread:0.007, auto:false, sfx:'shot',    pellets:1, range:180, color:0x9aa7b5 },
  smg:    { name:'MP5',      type:'gun',    dmg:14, kick:0.01, hs:1.8, rate:0.06,  mag:35, res:140, reload:900, spread:0.03,  auto:true,  sfx:'smg',     pellets:1, range:120, color:0x1e6f5c },
  shotgun:{ name:'NOVA SHOTGUN',   type:'gun',    dmg:11, hs:1.6, rate:0.85,  mag:5,  res:24, reload:1800, spread:0.055, auto:false, sfx:'shotgun', pellets:8, range:40,  color:0x7a3b2e },
  sniper: { name:'AWP', type:'gun',    dmg:110, hs:2.5, rate:1.4, kick:0.035, mag:4, res:12, reload:1600,  spread:0.002, auto:false, sfx:'sniper',  pellets:1, range:9999, color:0x2e5d3a },
  rocket: { name:'ROCKET LAUNCHER',type:'rocket', dmg:95, rate:1.6, mag:1, res:4, reload:2200, blast:7, auto:false, sfx:'rocket', range:200, color:0x4a4458 },
};
const LOOT_GUNS = ['rifle','m4','smg','shotgun','deagle','rifle','m4','smg','deagle','shotgun','chainsaw','sniper','rocket']; // sniper rarer than shotgun, rocket rarest

// ---------- weapon rarity tiers ----------
const RARITIES = [
  { name:'COMMON',    mult:1.0,  color:'#b8c4cf', hex:0xb8c4cf, w:40 },
  { name:'UNCOMMON',  mult:1.15, color:'#41d94d', hex:0x41d94d, w:30 },
  { name:'RARE',      mult:1.3,  color:'#28a7ff', hex:0x28a7ff, w:17 },
  { name:'EPIC',      mult:1.5,  color:'#c26bff', hex:0xc26bff, w:10 },
  { name:'LEGENDARY', mult:1.75, color:'#ffd34d', hex:0xffd34d, w:3  },
];
function rollRarity(){
  let r=Math.random()*100, acc=0;
  for(let i=0;i<RARITIES.length;i++){ acc+=RARITIES[i].w; if(r<acc) return i; }
  return 0;
}

// inventory: 3 slots, slot 0 starts with knife
let inv, activeSlot, reloading=false, lastShot=0, recoil=0;
function W(){ return inv[activeSlot] ? WEAPONS[inv[activeSlot].key] : null; }
function invReset(){ inv=[{key:'knife',ammo:Infinity,rarity:0},null,null,null,null]; activeSlot=0; renderSlots(); }
function ammoUI(){
  const w=W(), it=inv[activeSlot];
  const el=$('ammoN'), rh=$('reloadHint');
  if(!w || w.type==='melee'){ el.style.color='#fff'; rh.style.display='none'; return; }
  if(reloading){ rh.style.display='block'; rh.textContent='⏳ RELOADING…'; el.style.color='#ffb400'; }
  else if(it.ammo<=0){ rh.style.display='block'; rh.textContent='⚠ PRESS R — RELOAD'; el.style.color='#ff4444'; }
  else if(it.ammo<= (WEAPONS[it.key].mag||10)*0.25){ rh.style.display='none'; el.style.color='#ffb400'; }
  else { rh.style.display='none'; el.style.color='#fff'; }
}
function renderSlots(){
  $('slots').innerHTML='';
  inv.forEach((it,i)=>{
    const d=document.createElement('div'); d.className='slot'+(i===activeSlot?' on':'');
    d.textContent = (i+1)+'· '+(it?((it.dual?'2x ':'')+WEAPONS[it.key].name.split(' ')[0]):'—');
    if(it) d.style.color = RARITIES[it.rarity||0].color;
    d.onclick = ()=>switchSlot(i);   // tap-to-switch (touch)
    $('slots').appendChild(d);
  });
  const w=W(), it=inv[activeSlot];
  $('weapon').textContent = w?w.name:'—';
  $('weapon').style.color = it ? RARITIES[it.rarity||0].color : '#ffd34d';
  $('ammoN').textContent = w && w.type!=='melee' ? inv[activeSlot].ammo : '∞';
}
function switchSlot(i){
  if(i===activeSlot || reloading) return;
  activeSlot=i; recoil=0; renderSlots(); buildViewmodel();
}
function giveWeapon(key, rarity){
  const DUALABLE = ['rifle','m4','smg','shotgun','deagle','chainsaw'];
  if(DUALABLE.includes(key)){
    const i = inv.findIndex(it=>it && it.key===key && !it.dual);
    if(i>-1){
      inv[i].dual = true; inv[i].ammo = magSize(WEAPONS[key], inv[i]); inv[i].res = (inv[i].res||0) + resMax(WEAPONS[key]);
      activeSlot=i; renderSlots(); buildViewmodel();
      showMsg('🔥 DUAL '+WEAPONS[key].name+'S!', 1400); sfx('pick'); afile('dual', .9);
      return;
    }
  }
  return giveWeaponBase(key, rarity);
}
function giveWeaponBase(key, rarity){
  if(rarity===undefined) rarity=rollRarity();
  // fill empty slot, else replace active — the replaced weapon drops to the ground
  let slot = inv.findIndex(x=>x===null);
  if(slot===-1){
    slot = activeSlot===0 ? 1 : activeSlot;   // never overwrite knife
    const old=inv[slot];
    if(old) spawnFloorGun(old.key, player.pos.x+rand(-1,1), player.pos.z+rand(-1,1), old.rarity);
  }
  inv[slot] = { key, ammo: Math.round(WEAPONS[key].mag*upg.magMult), res: resMax(WEAPONS[key]), rarity };
  activeSlot = slot;
  renderSlots(); buildViewmodel();
  const R=RARITIES[rarity];
  showMsg(`🔫 <span style="color:${R.color}">${R.name} ${WEAPONS[key].name}</span>`, 1100); sfx('pick');
}
function reload(){
  const w=W(), it=inv[activeSlot];
  if(!w || w.type==='melee' || reloading) return;
  const cap = magSize(w,it);
  if(it.ammo>=cap) return;
  if((it.res|0)<=0){ showMsg('❌ NO RESERVE AMMO — find pickups!',1100); return; }
  reloading=true; sfx('reload');
  const dur = (w.reload||1100)*(it.dual?1.35:1);
  const rw = $('reloadWheel'); rw.style.display='block';
  const t0=performance.now();
  (function spin(){
    const p=Math.min(1,(performance.now()-t0)/dur);
    rw.style.background=`conic-gradient(#ffe93b ${p*360}deg, rgba(0,0,0,.55) 0deg)`;
    if(p<1 && reloading) requestAnimationFrame(spin);
  })();
  setTimeout(()=>{
    const need = cap - it.ammo;
    const take = Math.min(need, it.res|0);
    it.ammo += take; it.res -= take;
    reloading=false; rw.style.display='none';
    renderSlots();
  }, dur);
}


// ---------- viewmodel: procedural weapon models ----------
const gunGroup = new THREE.Group();
camera.add(gunGroup); scene.add(camera);
const muzzle = new THREE.PointLight(0xffc46b,0,6);
// shared unit geometries (scaled per part) + cached toon materials — no per-switch allocation
const G_BOX = new THREE.BoxGeometry(1,1,1);
const G_CYL = new THREE.CylinderGeometry(.5,.5,1,10);
const G_CONE = new THREE.ConeGeometry(.5,1,10);
const gunMatCache = {};
function gmat(color, emissive, ei){
  const k = color+'_'+(emissive||0);
  if(!gunMatCache[k]) gunMatCache[k] = toonMat(emissive!==undefined ? {color,emissive,emissiveIntensity:ei||.5} : {color});
  return gunMatCache[k];
}
// brushed metal: horizontal streak noise, tinted per part via material.color — shared texture, cached per color
const metalTex = (()=>{
  const cv=texCanvas(32), cx=cv.getContext('2d');
  cx.fillStyle='#ffffff'; cx.fillRect(0,0,32,32);
  cx.strokeStyle='rgba(0,0,0,.10)'; cx.lineWidth=1;
  for(let y=0;y<32;y+=1.5){ cx.beginPath(); cx.moveTo(0,y); cx.lineTo(32,y); cx.stroke(); }
  cx.strokeStyle='rgba(255,255,255,.14)';
  for(let y=.75;y<32;y+=1.5){ cx.beginPath(); cx.moveTo(0,y); cx.lineTo(32,y); cx.stroke(); }
  const t=new THREE.CanvasTexture(cv);
  t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(2,1);
  return t;
})();
const gunMetalMatCache = {};
function gmatMetal(color){
  if(!gunMetalMatCache[color]) gunMetalMatCache[color] = toonMat({color, map:metalTex});
  return gunMetalMatCache[color];
}
const GC = { metal:0x3d4453, dark:0x23272f, black:0x16181d, polymer:0x2b2f38, wood:0x9c6435, woodDark:0x74471f,
             steel:0xb8c4cf, silver:0xd7dee6, green:0x3d5c38, greenDark:0x2b4227, olive:0x4a4458 };
// gun-local coords: -Z = muzzle direction, +Y = up
function part(g, geo, mat, sx,sy,sz, x,y,z, rx,ry,rz){
  const m = new THREE.Mesh(geo, mat);
  m.scale.set(sx,sy,sz); m.position.set(x,y,z);
  if(rx) m.rotation.x=rx; if(ry) m.rotation.y=ry; if(rz) m.rotation.z=rz;
  g.add(m); return m;
}
// cylinder along Z: diameter d, length l
function tube(g, mat, d,l, x,y,z){ return part(g, G_CYL, mat, d,l,d, x,y,z, Math.PI/2,0,0); }
function buildGunModel(key, world){
  const g = new THREE.Group();
  const M=gmat, B=G_BOX;
  if(key==='knife'){
    part(g,B,gmatMetal(GC.steel), .022,.09,.40, 0,.02,-.30);               // blade
    part(g,G_CONE,M(GC.steel), .022,.10,.09, 0,.02,-.55, -Math.PI/2);      // tip
    part(g,B,M(GC.dark), .10,.024,.03, 0,.02,-.09);                        // guard
    part(g,B,M(0x3a2c22), .036,.075,.16, 0,0,.01);                         // handle
    if(!world) part(g,B,M(GC.dark), .04,.05,.03, 0,0,.10);                 // pommel
  } else if(key==='chainsaw'){
    part(g,B,M(0xd93b1f), .12,.14,.24, 0,.02,-.02);                        // engine body
    part(g,B,M(GC.dark), .05,.05,.06, .05,.10,-.02);                       // exhaust stub
    part(g,B,gmatMetal(GC.steel), .022,.09,.52, 0,.02,-.40);               // blade bar
    for(let i=0;i<5;i++){                                                  // teeth top+bottom
      part(g,B,M(GC.dark), .026,.02,.045, 0,.075,-.20-i*.09);
      part(g,B,M(GC.dark), .026,.02,.045, 0,-.035,-.20-i*.09);
    }
    part(g,B,M(0x3a2c22), .04,.07,.12, 0,-.09,.09, .3);                    // rear grip
    if(!world){
      part(g,B,M(GC.dark), .16,.03,.03, 0,.09,-.10);                      // top handle bar
      part(g,B,M(0xffd34d), .04,.03,.02, -.05,.06,.10);                    // pull-start
    }
    g.userData.chainsaw=true;
  } else if(key==='deagle'){
    part(g,B,gmatMetal(0x9aa7b5), .055,.075,.30, 0,.075,-.14);              // tall slide
    part(g,B,M(GC.dark), .05,.05,.26, 0,.012,-.12);                        // frame
    tube(g,gmatMetal(GC.dark), .045,.07, 0,.078,-.31);                     // short exposed barrel
    part(g,B,M(GC.polymer), .048,.16,.075, 0,-.08,.02, .28);               // grip
    part(g,B,M(GC.dark), .04,.014,.09, 0,-.035,-.06);                      // trigger guard
    if(!world){
      part(g,B,M(GC.dark), .02,.03,.03, 0,.06,.035);                       // hammer
      part(g,B,M(GC.black), .014,.02,.02, 0,.12,-.27);                     // front sight
      part(g,B,M(GC.black), .03,.018,.02, 0,.12,.0);                       // rear sight
    }
    g.userData.muzzle={y:.078,z:-.37};
  } else if(key==='rifle'){ // AK-47: gunmetal + wood, curved mag
    part(g,B,gmatMetal(0x2f3542), .07,.085,.34, 0,0,-.05);                  // receiver
    part(g,B,M(GC.wood), .075,.06,.18, 0,-.005,-.30);                      // lower handguard
    part(g,B,M(GC.wood), .06,.045,.15, 0,.058,-.29);                       // upper handguard / gas tube
    part(g,B,gmatMetal(GC.metal), .05,.03,.05, 0,.058,-.36);               // gas block
    tube(g,gmatMetal(GC.dark), .035,.28, 0,.012,-.52);                     // barrel
    tube(g,gmatMetal(GC.metal), .046,.07, 0,.012,-.66);                    // muzzle brake
    part(g,B,M(GC.wood), .055,.09,.22, 0,-.03,.22, .12);                   // stock
    part(g,B,M(GC.woodDark), .042,.10,.05, 0,-.09,.06, .35);               // pistol grip
    part(g,B,M(GC.dark), .046,.095,.06, 0,-.10,-.10, .3);                  // curved mag seg 1
    part(g,B,M(GC.dark), .046,.095,.06, 0,-.175,-.135, .6);                // curved mag seg 2
    if(!world){
      part(g,B,M(GC.dark), .046,.08,.06, 0,-.225,-.19, .9);                // curved mag seg 3
      part(g,B,M(GC.black), .018,.06,.02, 0,.075,-.59);                    // front sight post
      part(g,B,M(GC.black), .03,.02,.05, 0,.055,-.16);                     // rear sight
    }
    g.userData.muzzle={y:.012,z:-.70};
  } else if(key==='m4'){ // M4A4: railed, straight-ish mag, buffer-tube stock
    part(g,B,gmatMetal(0x36454f), .065,.08,.30, 0,0,-.02);                  // receiver
    part(g,B,M(GC.black), .05,.024,.28, 0,.055,-.05);                      // top rail
    tube(g,M(GC.polymer), .07,.24, 0,.005,-.31);                           // handguard
    part(g,B,M(GC.black), .025,.03,.05, 0,-.028,-.24);                     // foregrip nub
    tube(g,gmatMetal(GC.dark), .03,.20, 0,.005,-.53);                      // barrel
    tube(g,gmatMetal(GC.black), .04,.07, 0,.005,-.64);                     // flash hider
    tube(g,M(GC.dark), .045,.13, 0,.03,.17);                               // buffer tube
    part(g,B,M(GC.polymer), .055,.095,.13, 0,-.002,.28);                   // stock
    part(g,B,M(GC.polymer), .042,.10,.05, 0,-.085,.08, .35);               // pistol grip
    part(g,B,M(GC.dark), .046,.095,.055, 0,-.095,-.07, .15);               // mag seg 1
    part(g,B,M(GC.dark), .046,.09,.055, 0,-.175,-.095, .35);               // mag seg 2
    if(!world){
      part(g,B,M(GC.black), .018,.055,.02, 0,.06,-.43);                    // front sight
      part(g,B,M(GC.black), .034,.04,.05, 0,.085,.05);                     // rear sight block
    }
    g.userData.muzzle={y:.005,z:-.68};
  } else if(key==='smg'){ // MP5: slim, short, curved mag
    part(g,B,gmatMetal(GC.black), .055,.07,.26, 0,0,-.04);                 // receiver
    part(g,B,M(GC.polymer), .05,.06,.13, 0,-.005,-.22);                    // slim handguard
    tube(g,gmatMetal(GC.dark), .026,.14, 0,.012,-.35);                     // barrel
    tube(g,M(GC.black), .034,.045, 0,.012,-.42);                           // tri-lug muzzle
    part(g,B,M(GC.polymer), .042,.09,.05, 0,-.075,.05, .3);                // grip
    part(g,B,M(GC.dark), .045,.045,.13, 0,.012,.15);                       // stock strut
    part(g,B,M(GC.polymer), .05,.08,.028, 0,0,.23);                        // butt plate
    part(g,B,M(GC.dark), .04,.09,.05, 0,-.09,-.075, .2);                   // curved mag seg 1
    part(g,B,M(GC.dark), .04,.085,.05, 0,-.165,-.10, .5);                  // curved mag seg 2
    if(!world){
      part(g,G_CYL,M(GC.black), .05,.02,.05, 0,.058,-.28, Math.PI/2);      // hooded front sight ring
      part(g,G_CYL,M(GC.black), .035,.03,.035, 0,.055,.02);                // rear drum sight
    }
    g.userData.muzzle={y:.012,z:-.45};
  } else if(key==='shotgun'){ // Nova: long barrel + tube mag + pump
    part(g,B,M(0x4a342a), .06,.08,.28, 0,0,-.03);                          // receiver
    tube(g,gmatMetal(GC.dark), .032,.42, 0,.038,-.38);                     // barrel
    tube(g,gmatMetal(GC.metal), .034,.34, 0,-.022,-.34);                   // mag tube under barrel
    part(g,B,M(0x2a1c14), .015,.05,.10, .045,.01,-.15);                    // shell holder strip
    part(g,B,M(0x7a3b2e), .066,.062,.13, 0,-.02,-.28);                     // pump
    part(g,B,M(0x7a3b2e), .05,.09,.20, 0,-.025,.20, .12);                  // stock
    part(g,B,M(0x63302a), .045,.07,.06, 0,-.065,.09, .4);                  // grip wedge
    if(!world){
      part(g,B,M(GC.silver,0xd7dee6,.5), .014,.016,.016, 0,.065,-.57);     // bead sight
      tube(g,M(GC.black), .04,.03, 0,.038,-.58);                           // muzzle ring
    }
    g.userData.muzzle={y:.038,z:-.61};
  } else if(key==='sniper'){ // AWP: iconic green, big scope, bipod hint
    part(g,B,M(GC.green), .06,.085,.46, 0,-.002,-.09);                     // chassis (long AWP forend)
    part(g,B,M(GC.green), .057,.11,.20, 0,-.02,.26, .1);                   // stock
    part(g,B,M(GC.greenDark), .05,.032,.12, 0,.048,.28);                   // cheek pad
    tube(g,gmatMetal(GC.dark), .035,.40, 0,.02,-.49);                      // long barrel
    tube(g,gmatMetal(GC.black), .048,.07, 0,.02,-.70);                     // muzzle brake
    tube(g,M(GC.black), .045,.24, 0,.10,-.02);                             // scope tube
    tube(g,M(GC.black), .066,.07, 0,.10,-.16);                             // objective bell
    tube(g,M(GC.black), .056,.05, 0,.10,.11);                              // ocular
    part(g,B,M(GC.greenDark), .046,.062,.09, 0,-.065,-.08);                // magazine
    part(g,B,M(GC.greenDark), .042,.09,.05, 0,-.085,.10, .3);              // grip
    if(!world){
      tube(g,M(0x123a44,0x38b6d8,.45), .038,.012, 0,.10,.137);             // ocular lens (glint)
      part(g,B,M(GC.black), .016,.045,.03, 0,.055,-.06);                   // scope mount F
      part(g,B,M(GC.black), .016,.045,.03, 0,.055,.05);                    // scope mount R
      part(g,B,M(GC.steel), .05,.018,.018, .05,.005,.05, 0,0,-.5);         // bolt handle
      part(g,G_CYL,gmatMetal(GC.metal), .012,.15,.012, -.028,-.045,-.38, Math.PI/2-.3); // bipod leg L (folded)
      part(g,G_CYL,gmatMetal(GC.metal), .012,.15,.012, .028,-.045,-.38, Math.PI/2-.3);  // bipod leg R (folded)
    }
    g.userData.muzzle={y:.02,z:-.74};
  } else if(key==='rocket'){ // fat tube + visible cone warhead
    tube(g,gmatMetal(GC.olive), .13,.66, 0,.02,-.04);                      // main tube
    part(g,G_CONE,M(GC.olive), .17,.14,.17, 0,.02,.34, -Math.PI/2);        // rear exhaust bell (flares rearward)
    tube(g,gmatMetal(GC.dark), .15,.04, 0,.02,-.37);                       // front ring
    part(g,B,M(GC.dark), .02,.02,.30, 0,.075,-.10);                        // top carry rail
    part(g,G_CONE,M(GC.greenDark), .11,.17,.11, 0,.02,-.47, -Math.PI/2);   // warhead cone
    part(g,B,M(0xff5522,0xff5522,.6), .026,.026,.026, 0,.02,-.56);         // warhead tip
    part(g,B,M(GC.polymer), .042,.10,.05, 0,-.08,.08, .3);                 // grip
    part(g,B,M(GC.polymer), .042,.09,.05, 0,-.08,-.14, .15);               // front grip
    if(!world){
      part(g,B,M(GC.black), .03,.05,.08, 0,.11,-.08);                      // sight box
      part(g,B,M(GC.olive), .06,.05,.13, 0,-.055,.24);                     // shoulder rest
    }
    g.userData.muzzle={y:.02,z:-.60};
  }
  return g;
}
// muzzle flash: shared additive materials, cone + core per gun (viewmodel only)
const flashConeMat = new THREE.MeshBasicMaterial({color:0xffca6e, transparent:true, opacity:.85, blending:THREE.AdditiveBlending, depthWrite:false});
const flashBallMat = new THREE.MeshBasicMaterial({color:0xfff3c4, transparent:true, opacity:.95, blending:THREE.AdditiveBlending, depthWrite:false});
function makeFlash(){
  const f=new THREE.Group();
  const cone=new THREE.Mesh(G_CONE, flashConeMat);
  cone.scale.set(.09,.15,.09); cone.rotation.x=Math.PI/2; cone.position.z=-.075; // apex at muzzle, opens forward
  const ball=new THREE.Mesh(G_CONE, flashBallMat);
  ball.scale.set(.06,.06,.06); ball.rotation.x=-Math.PI/2; ball.position.z=-.01;
  f.add(cone,ball); f.visible=false;
  return f;
}
const vmFlashes=[];
let vmKick=0, vmSwing=0, vmBobT=0, vmSwayX=0, vmSwayY=0, vmReloadK=0, vmPrevYaw=0, vmPrevPitch=0, flashTO=0, flashSide=0;
function flashOn(){
  muzzle.intensity=nightMode?8.5:4.5;   // WAVE2: muzzle flashes pop at night
  if(vmFlashes.length>1){                       // dual wield: alternate barrels
    const f=vmFlashes[flashSide]; flashSide=1-flashSide;
    f.visible=true; f.rotation.z=Math.random()*6.28; f.scale.setScalar(.75+Math.random()*.6);
    muzzle.position.x=f.position.x;
  } else for(const f of vmFlashes){
    f.visible=true; f.rotation.z=Math.random()*6.28;
    f.scale.setScalar(.75+Math.random()*.6);
  }
  clearTimeout(flashTO);
  flashTO=setTimeout(()=>{ muzzle.intensity=0; for(const f of vmFlashes) f.visible=false; },45);
}
// WAVE2: first-person arms — blocky toon arms holding the viewmodel (shared geo + mats, ≤6 meshes)
const armSkinMat=toonMat({color:0xffe0bd});
const armSleeveMat=toonMat({color:0x3b4a6b});
const TWOHAND=['rifle','m4','smg','shotgun','sniper','rocket'];
function addArms(g,key,single){
  const M=armSkinMat, S=armSleeveMat, B=G_BOX;
  const hy = key==='knife' ? -.035 : -.085, hz = key==='knife' ? .03 : .06;
  part(g,B,M, .075,.07,.10, 0,hy,hz);                        // right hand on the grip
  part(g,B,M, .065,.065,.34, .04,hy-.075,hz+.22, .3);        // right forearm
  part(g,B,S, .095,.095,.14, .05,hy-.14,hz+.38, .3);         // right sleeve cuff
  if(!single && TWOHAND.includes(key)){
    part(g,B,M, .075,.07,.10, -.005,-.05,-.22);              // left hand on the foregrip
    part(g,B,M, .065,.065,.30, -.14,-.135,-.06, .35,-.5,0);  // left forearm
    part(g,B,S, .095,.095,.13, -.25,-.20,.08, .35,-.5,0);    // left sleeve cuff
  }
}
function buildViewmodel(){
  while(gunGroup.children.length) gunGroup.remove(gunGroup.children[0]);
  vmFlashes.length=0;
  const w=W(); if(!w) return;
  const it=inv[activeSlot];
  const dual = it.dual && w.type!=='melee';
  const right=buildGunModel(it.key, false);
  addArms(right, it.key, dual);   // dual: one hand per gun — the clone below carries its own arm
  gunGroup.add(right);
  const mz0=right.userData.muzzle;
  if(mz0){ const f=makeFlash(); f.position.set(0, mz0.y, mz0.z); gunGroup.add(f); vmFlashes.push(f); }
  if(dual){
    // second gun: clone of the same group (shared geometries + materials), offset to the left hand
    const left=right.clone();
    left.position.x=-.56;
    gunGroup.add(left);
    if(mz0){ const f=makeFlash(); f.position.set(-.56, mz0.y, mz0.z); gunGroup.add(f); vmFlashes.push(f); }
  }
  flashSide=0;
  muzzle.position.set(dual?-.28:0, mz0?mz0.y:0, mz0?mz0.z:-.6);
  gunGroup.add(muzzle);
  gunGroup.position.set(.28,-.26,-.55);
  gunGroup.rotation.set(0,0,0);
}

// ---------- WAVE2: NIGHT OPS — stars, moon, campfires, torches, cool moonlight ----------
let nightMode=false; try{ nightMode=localStorage.getItem('fr_night')==='1'; }catch(e){}
const nightGroup=new THREE.Group(); nightGroup.visible=false; scene.add(nightGroup);
{ // star field: single Points cloud
  const N=isTouch?260:400, pos=new Float32Array(N*3);
  for(let i=0;i<N;i++){
    const a=rand(0,Math.PI*2), el=rand(.06,1.45), r=390;
    pos[i*3]=Math.cos(a)*Math.cos(el)*r; pos[i*3+1]=Math.sin(el)*r; pos[i*3+2]=Math.sin(a)*Math.cos(el)*r;
  }
  const g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos,3));
  nightGroup.add(new THREE.Points(g, new THREE.PointsMaterial({color:0xd8e2ff, size:1.7, sizeAttenuation:false, fog:false, transparent:true, opacity:.9})));
}
{ // moon sprite
  const cv=texCanvas(128), cx=cv.getContext('2d');
  const g=cx.createRadialGradient(64,64,20,64,64,62);
  g.addColorStop(0,'rgba(235,240,255,1)'); g.addColorStop(.55,'rgba(215,225,255,.95)'); g.addColorStop(.8,'rgba(180,200,255,.25)'); g.addColorStop(1,'rgba(180,200,255,0)');
  cx.fillStyle=g; cx.fillRect(0,0,128,128);
  cx.globalAlpha=.18; cx.fillStyle='#9aa8cc';
  cx.beginPath(); cx.arc(50,52,9,0,7); cx.fill();
  cx.beginPath(); cx.arc(76,70,6,0,7); cx.fill();
  cx.beginPath(); cx.arc(62,84,4,0,7); cx.fill();
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv), transparent:true, fog:false, depthWrite:false}));
  sp.position.set(-150,150,-190); sp.scale.set(42,42,1);
  nightGroup.add(sp);
}
const flameSpriteMat=(()=>{   // shared flame billboard material
  const cv=texCanvas(64), cx=cv.getContext('2d');
  const g=cx.createRadialGradient(32,44,3,32,40,30);
  g.addColorStop(0,'rgba(255,240,180,1)'); g.addColorStop(.35,'rgba(255,160,50,.9)'); g.addColorStop(.75,'rgba(255,80,20,.35)'); g.addColorStop(1,'rgba(255,60,10,0)');
  cx.fillStyle=g; cx.fillRect(0,0,64,64);
  return new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv), transparent:true, depthWrite:false, blending:THREE.AdditiveBlending});
})();
const campfires=[], torches=[];
{
  const logMat=toonMat({color:0x6a4a28});
  const logGeo=new THREE.BoxGeometry(1.5,.28,.3);
  const mkFire=(x,z,withLight)=>{
    const g=new THREE.Group();
    const l1=new THREE.Mesh(logGeo, logMat); l1.rotation.y=.5; l1.position.y=.14;
    const l2=new THREE.Mesh(logGeo, logMat); l2.rotation.y=-.6; l2.position.y=.22;
    const fl=new THREE.Sprite(flameSpriteMat); fl.position.y=.9; fl.scale.set(1.7,2.3,1);
    g.add(l1,l2,fl);
    let li=null;
    if(withLight){ li=new THREE.PointLight(0xff8c3a,1.4,16); li.position.y=1.2; g.add(li); }
    g.position.set(x,0,z); nightGroup.add(g);
    campfires.push({fl,li,ph:rand(0,6)});
  };
  mkFire(6,6,true); mkFire(-45,22,true);                       // touch keeps 2 real lights…
  mkFire(52,-44,!isTouch); mkFire(-20,-62,!isTouch);           // …desktop gets all 4
  const torchMat=toonMat({color:0x5a3a1a, emissive:0xff8c3a, emissiveIntensity:.3});
  const torchGeo=new THREE.BoxGeometry(.09,.7,.09);
  const mkTorch=(x,y,z)=>{
    const g=new THREE.Group();
    g.add(new THREE.Mesh(torchGeo, torchMat));
    const fl=new THREE.Sprite(flameSpriteMat); fl.position.y=.55; fl.scale.set(.6,1,1);
    g.add(fl); g.position.set(x,y,z); nightGroup.add(g);
    torches.push({fl,ph:rand(0,6)});
  };
  for(const f of forts){ mkTorch(f.x-2.4, 3.0, f.z+6.35); mkTorch(f.x+2.4, 3.0, f.z+6.35); }   // fort doorways
  for(const s of towerTorchSpots) mkTorch(s.x, s.y, s.z);                                       // tower doors
}
function applyNight(on){
  nightMode=on; try{ localStorage.setItem('fr_night', on?'1':'0'); }catch(e){}
  nightGroup.visible=on;
  if(on){
    moodSky.setHex(0x0b1233); moodFog.setHex(0x101a3d);
    sun.color.setHex(0x9db8ff); sun.intensity=.4; sun.position.set(-70,110,-50);   // moonlight (shadows stay on)
    amb.color.setHex(0x2a3a66); amb.intensity=.4;
    hemi.color.setHex(0x24365e); hemi.groundColor.setHex(0x141c2e); hemi.intensity=.3;
    scene.fog.far=252;
  } else {
    const M=MOODS[0];
    moodSky.copy(M.sky); moodFog.copy(M.fog);
    sun.color.copy(M.sunC); sun.intensity=M.sunI; sun.position.copy(M.sp);
    amb.color.copy(M.ambC); amb.intensity=M.ambI;
    hemi.color.copy(M.hemS); hemi.groundColor.copy(M.hemG); hemi.intensity=M.hemI;
    scene.fog.far=288;
  }
  scene.background.copy(moodSky); scene.fog.color.copy(moodFog);
}
function updateNightFx(now){
  if(!nightMode) return;
  for(const c of campfires){
    const f=.8+.28*Math.sin(now/95+c.ph)+.12*Math.sin(now/39+c.ph*2.2);
    c.fl.scale.set(1.55*f,2.15*f,1);
    if(c.li) c.li.intensity=1.25*f;
  }
  for(const t of torches){
    const f=.75+.3*Math.sin(now/72+t.ph);
    t.fl.scale.set(.6*f,1.05*f,1);
  }
}
if(nightMode) applyNight(true);

// ---------- WAVE2: CRT overlay + mutators (persisted lobby toggles) ----------
let crtMode=false; try{ crtMode=localStorage.getItem('fr_crt')==='1'; }catch(e){}
function applyCrt(on){ crtMode=on; try{ localStorage.setItem('fr_crt', on?'1':'0'); }catch(e){} $('crt').style.display=on?'block':'none'; }
applyCrt(crtMode);
let mutator='';
function lootGunKey(){ return mutator==='wild' ? 'deagle' : LOOT_GUNS[Math.floor(rand(0,LOOT_GUNS.length))]; }
(function(){
  const paint=()=>{
    tgl($('nightTgl'),nightMode); tgl($('crtTgl'),crtMode); tgl($('perfTgl'),perfMode);
  };
  const tgl=(b,on)=>{ b.style.borderColor=on?'#7CFC00':'rgba(255,255,255,.25)'; b.style.color=on?'#7CFC00':'#e8e2ff'; };
  $('nightTgl').onclick=()=>{ applyNight(!nightMode); paint(); };
  $('crtTgl').onclick=()=>{ applyCrt(!crtMode); paint(); };
  $('perfTgl').onclick=()=>{ perfMode=!perfMode; try{ localStorage.setItem('fr_perf',perfMode?'1':'0'); }catch(e){} paint();
    showMsg(perfMode?'⚡ PERFORMANCE MODE ON — reloading…':'✨ FULL GRAPHICS — reloading…',900); setTimeout(()=>location.reload(),700); };
  paint();
})();

// ---------- chests + floor loot ----------
const chests=[], floorLoot=[], pickups=[];
function spawnChest(x,z,y=0){
  const grp=new THREE.Group();
  const base=new THREE.Mesh(new THREE.BoxGeometry(1.5,1,1), toonMat({color:0xc9962e, map:plankTex, emissive:0x7a5a10, emissiveIntensity:.5}));
  base.position.y=.5; base.castShadow=true;
  const lid=new THREE.Mesh(new THREE.BoxGeometry(1.5,.45,1), toonMat({color:0xe0b13c, map:plankTex, emissive:0x8a6a12, emissiveIntensity:.5}));
  lid.position.y=1.15;
  const glow=new THREE.PointLight(0xffd34d,.9,6); glow.position.y=1.4;
  grp.add(base,lid,glow); grp.position.set(x,y,z); scene.add(grp);
  chests.push({grp,lid,glow,open:false,x,z,y});
}
const rarityGlowMats = RARITIES.map(r=>toonMat({color:r.hex, emissive:r.hex, emissiveIntensity:.7, transparent:true, opacity:.8}));
function spawnFloorGun(key,x,z,rarity){
  if(rarity===undefined) rarity=rollRarity();
  const m=buildGunModel(key, true);   // simplified silhouette (world detail level)
  m.scale.setScalar(1.35);
  const halo=new THREE.Mesh(G_CYL, rarityGlowMats[rarity]);
  halo.scale.set(.8,.05,.8); halo.position.y=-.42;
  m.add(halo);
  m.position.set(x,1.1,z); m.rotation.z=.18; scene.add(m);
  floorLoot.push({key,rarity,mesh:m});
}
function spawnPickup(kind,x,z,y=1.4){
  const col = kind==='med'?0x41d94d : kind==='shield'?0x28a7ff : kind==='ammopack'?0xff8c1a : kind==='mag'?0xff5ee0 : kind==='chip'?0xffe93b : kind==='wood'?0x8a5a2d : kind.startsWith('it_')?0xc95bff : 0xffd34d;
  const m=new THREE.Mesh(new THREE.OctahedronGeometry(.7,0), toonMat({color:col,emissive:col,emissiveIntensity:.35}));
  m.position.set(x,y,z); scene.add(m);
  pickups.push({kind,mesh:m,baseY:y});
}
function openChest(c){
  if(c.open) return;
  c.open=true; sfx('chest'); stats.chests++;
  c.lid.rotation.x=-1.1; c.lid.position.z=-.35; c.glow.intensity=.15;
  const cy=(c.y||0)+1.4;
  if(mutator!=='knives') giveWeapon(mutator==='wild' ? 'deagle' : LOOT_GUNS[Math.floor(rand(0,LOOT_GUNS.length))]);   // WAVE2 mutators
  spawnPickup(Math.random()<.5?'shield':'med', c.x+rand(-1.5,1.5), c.z+rand(-1.5,1.5), cy);
  if(Math.random()<.6) spawnPickup('shield', c.x+rand(-2.2,2.2), c.z+rand(-2.2,2.2), cy);
  if(Math.random()<.25) spawnPickup(Math.random()<.5?'ammopack':'mag', c.x+rand(-2,2), c.z+rand(-2,2), cy);
  if(!upg.homing && Math.random()<.15) spawnPickup('chip', c.x+rand(-2,2), c.z+rand(-2,2), cy);
  if(Math.random()<.22) spawnPickup('it_'+['bandana','cloak','adren'][Math.floor(rand(0,3))], c.x+rand(-2,2), c.z+rand(-2,2), cy);
  if(Math.random()<.4) spawnPickup('wood', c.x+rand(-2,2), c.z+rand(-2,2), cy);
  spawnPickup('ammo', c.x+rand(-1.5,1.5), c.z+rand(-1.5,1.5), cy);
}

// ---------- building (Q = wall, F = ramp) ----------
const structures=[];   // {meshes:[], obs:[]} — FIFO, max 30
const MAX_STRUCTS=30;
function placeStructure(kind){
  if(!running||gameOver||spectating||inKart||!player.alive||paused) return;
  const cost = kind==='wall'?10:15;
  if(woodCount<cost){ showMsg('🪵 Need '+cost+' wood — chop a tree with your knife!',1300); return; }
  const f=new THREE.Vector3(-Math.sin(player.yaw),0,-Math.cos(player.yaw));
  const bx=player.pos.x+f.x*2.5, bz=player.pos.z+f.z*2.5;
  if(Math.hypot(bx,bz)>MAP) return;                        // don't build in the sea
  const meshes=[], obs=[];
  const wood=0xb07d4c;
  const mk=(w,h,d,x,y,z)=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d), toonMat({color:wood, map:plankTex}));
    m.position.set(x,y,z); m.rotation.y=player.yaw; m.castShadow=m.receiveShadow=true; scene.add(m);
    const b=new THREE.Box3().setFromObject(m);
    const entry={min:b.min,max:b.max,mesh:m};
    obstacles.push(entry); meshes.push(m); obs.push(entry);
  };
  woodCount-=cost; updateWood();
  if(kind==='wall'){
    mk(3,3,0.3, bx, 1.5, bz);
  } else {
    // ramp: 3 rising steps away from the player — walkable with step-up collision
    for(let i=0;i<3;i++){
      const h=.55*(i+1), d=2.0+i*1.0;
      mk(3, h, 1, player.pos.x+f.x*d, h/2, player.pos.z+f.z*d);
    }
  }
  structures.push({meshes,obs});
  if(structures.length>MAX_STRUCTS){
    const s=structures.shift();
    for(const m of s.meshes) scene.remove(m);
    for(const e of s.obs){ const ix=obstacles.indexOf(e); if(ix>=0) obstacles.splice(ix,1); }
  }
  sfx('build');
}

// ---------- supply drops ----------
const drops=[];
let dropTimer=45;
function spawnDrop(){
  const a=rand(0,Math.PI*2), rr=Math.sqrt(Math.random())*Math.max(6, Math.min(stormR-2, MAP*.85));
  const x=Math.cos(a)*rr, z=Math.sin(a)*rr;
  const grp=new THREE.Group();
  const crate=new THREE.Mesh(new THREE.BoxGeometry(1.4,1.4,1.4), toonMat({color:0x2a6fd4, map:crateTex, emissive:0x123a7a, emissiveIntensity:.6}));
  crate.position.y=.7; crate.castShadow=true;
  const strap=new THREE.Mesh(new THREE.BoxGeometry(1.5,.25,1.5), toonMat({color:0xffd34d}));
  strap.position.y=.7;
  const chute=new THREE.Mesh(new THREE.ConeGeometry(2.3,1.8,10,1,true), toonMat({color:0xff8844, side:THREE.DoubleSide}));
  chute.position.y=3.4;
  grp.add(crate,strap,chute);
  grp.position.set(x,80,z); scene.add(grp);
  drops.push({grp,chute,glow:null,x,z,landed:false,opened:false});
  feed('🎁 Supply drop incoming!');
}
function openDrop(dp){
  if(dp.opened) return;
  dp.opened=true; sfx('chest'); stats.chests++;
  showMsg('🎁 Supply drop: full ammo + shield!',1400);
  if(mutator!=='knives') giveWeapon(mutator==='wild' ? 'deagle' : (Math.random()<.5?'rocket':'rifle'), Math.max(rollRarity(),2));   // drops roll RARE minimum (WAVE2: mutators respected)
  inv.forEach(it=>{ if(it&&WEAPONS[it.key].mag) it.ammo=WEAPONS[it.key].mag; });
  player.shield=100; updateBars(); renderSlots();
  if(dp.glow) dp.glow.intensity=.1;
}

// ---------- golf karts ----------
const karts=[];
let inKart=false, curKart=null;
function makeKart(x,z){
  let px=x, pz=z, tries=0;
  while(collides(new THREE.Vector3(px,0,pz),1.6,0)&&tries<25){ px=rand(-MAP*.6,MAP*.6); pz=rand(-MAP*.6,MAP*.6); tries++; }
  const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.BoxGeometry(2,.7,3.2), toonMat({color:new THREE.Color(skinColor)}));
  body.position.y=.85; body.castShadow=true;
  const seat=new THREE.Mesh(new THREE.BoxGeometry(1.6,.5,.9), toonMat({color:0x2b2b38}));
  seat.position.set(0,1.4,.5);
  const bar=new THREE.Mesh(new THREE.BoxGeometry(.12,.9,.12), toonMat({color:0x8d9299}));
  bar.position.set(.5,1.6,-.9);
  g.add(body,seat,bar);
  for(const [wx,wz] of [[-.95,-1.1],[.95,-1.1],[-.95,1.1],[.95,1.1]]){
    const wl=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.3,10), toonMat({color:0x14141c}));
    wl.rotation.z=Math.PI/2; wl.position.set(wx,.42,wz); wl.castShadow=true; g.add(wl);
  }
  g.position.set(px,0,pz); scene.add(g);
  karts.push({mesh:g, yaw:0, speed:0});
}
function enterKart(k){
  inKart=true; curKart=k; k.speed=0;
  gunGroup.visible=false; adsHeld=false;
  showMsg('🛺 GOLF KART — WASD drive · E to exit',1500); sfx('pick');
}
function exitKart(){
  if(!inKart) return;
  const k=curKart; inKart=false; curKart=null;
  gunGroup.visible=true;
  player.yaw=k.yaw;
  const f=new THREE.Vector3(-Math.sin(k.yaw),0,-Math.cos(k.yaw));
  const r=new THREE.Vector3(-f.z,0,f.x);
  for(const off of [r.clone().multiplyScalar(2.2), r.clone().multiplyScalar(-2.2), f.clone().multiplyScalar(-3), f.clone().multiplyScalar(3)]){
    const cand=k.mesh.position.clone().add(off); cand.y=EYE;
    if(!collides(cand,.5,0)){ player.pos.copy(cand); break; }
  }
  player.pos.y=EYE; player.vel.set(0,0,0);
}
function driveKart(dt){
  const k=curKart, nowS=performance.now()/1000;
  let acc=0, steer=0;
  if(keys['KeyW']) acc+=1;  if(keys['KeyS']) acc-=1;
  if(keys['KeyA']) steer+=1; if(keys['KeyD']) steer-=1;
  if(isTouch){ acc+=-joyY; steer+=-joyX; }
  acc=clamp(acc,-1,1); steer=clamp(steer,-1,1);
  if(acc) k.speed += acc*(acc>0?16:20)*dt;
  else k.speed -= Math.sign(k.speed)*Math.min(Math.abs(k.speed), 8*dt);   // friction
  k.speed = clamp(k.speed, -8, 22);
  if(Math.abs(k.speed)>.5) k.yaw += steer*1.6*dt*Math.sign(k.speed)*clamp(Math.abs(k.speed)/8,.3,1);
  const f=new THREE.Vector3(-Math.sin(k.yaw),0,-Math.cos(k.yaw));
  const np=k.mesh.position.clone().addScaledVector(f, k.speed*dt);
  if(collides(np,1.1,0)){ if(Math.abs(k.speed)>10) sfx('thud'); k.speed=0; }   // stop, no bounce physics
  else k.mesh.position.copy(np);
  k.mesh.rotation.y=k.yaw;
  // run over bots
  if(Math.abs(k.speed)>6){
    for(const b of bots){
      if(!b.alive) continue;
      if(grace<=0 && (!b.kartCd || nowS-b.kartCd>1) && b.mesh.position.distanceTo(k.mesh.position)<2.4){
        b.kartCd=nowS; b.hp-=60; sfx('thud'); stats.hits++; stats.dmg+=60; hitmark(false);
        if(b.hp<=0) killBot(b,false);
      }
    }
  }
  // player rides along (storm damage etc. works as normal)
  player.pos.set(k.mesh.position.x, EYE, k.mesh.position.z);
  // chase camera
  const camPos=k.mesh.position.clone().addScaledVector(f,-6.5); camPos.y=3.4;
  camera.position.lerp(camPos, Math.min(1,dt*6));
  camera.lookAt(k.mesh.position.x, 1.6, k.mesh.position.z);
}

// ---------- named locations ----------
const ZONES=[
  { name:'SALTY SANDS',  x:0,   z:112, r:45 },
  { name:'FORT YEET',    x:-45, z:30,  r:26 },
  { name:'CHEST COVE',   x:50,  z:-52, r:26 },
  { name:'STORM PEAK',   x:-92, z:-40, r:36 },
  { name:'BANANA FLATS', x:0,   z:0,   r:30 },
  { name:'WOBBLY WOODS', x:85,  z:48,  r:38 },
];
let curZone=null, zoneTO=null;
function checkZone(){
  if(!player.alive) return;
  let z=null;
  for(const zn of ZONES){ if(Math.hypot(player.pos.x-zn.x, player.pos.z-zn.z)<zn.r){ z=zn; break; } }
  if(z && z!==curZone){
    $('zoneToast').textContent='📍 '+z.name;
    $('zoneToast').style.opacity=1;
    clearTimeout(zoneTO); zoneTO=setTimeout(()=>$('zoneToast').style.opacity=0,1800);
  }
  curZone=z;
}

// ---------- emotes (V = dance) ----------
const confGeom=new THREE.PlaneGeometry(.16,.16);
let danceT=0;
function confetti(center){
  const items=[];
  for(let i=0;i<40;i++){
    const m=new THREE.Mesh(confGeom, new THREE.MeshBasicMaterial({color:new THREE.Color().setHSL(Math.random(),.9,.62), side:THREE.DoubleSide}));
    m.position.set(center.x+rand(-.6,.6), center.y+rand(-.2,.6), center.z+rand(-.6,.6));
    m.rotation.set(rand(0,3),rand(0,3),rand(0,3));
    scene.add(m);
    items.push({m, vx:rand(-2,2), vy:rand(2,5.5), vz:rand(-2,2), rs:rand(-6,6)});
  }
  let tPrev=performance.now();
  (function tick(){
    const tn=performance.now(), d=Math.min((tn-tPrev)/1000,.05); tPrev=tn;
    let any=false;
    for(const it of items){
      it.vy-=7*d;
      it.m.position.x+=it.vx*d; it.m.position.y+=it.vy*d; it.m.position.z+=it.vz*d;
      it.m.rotation.x+=it.rs*d; it.m.rotation.y+=it.rs*.7*d;
      if(it.m.position.y>-.5) any=true; else if(it.m.parent) scene.remove(it.m);
    }
    if(any) requestAnimationFrame(tick);
    else items.forEach(it=>{ if(it.m.parent) scene.remove(it.m); });
  })();
}
function dance(){
  if(!running||gameOver||spectating||inKart||!player.alive||danceT>0) return;
  danceT=1.5; sfx('horn');
  feed(`💃 <b>${player.name}</b> is dancing!`);
  confetti(player.pos);
}

// ---------- player ----------
const player = { pos:new THREE.Vector3(0,1.7,MAP*.65), vel:new THREE.Vector3(), yaw:0, pitch:0,
  hp:100, maxHp:100, shield:50, kills:0, alive:true, onGround:true, name:'You', cloakT:0, adrT:0, slowT:0, slimeT:0 };
let woodCount=20; let items=[];
const ITEMS={ bandana:{icon:'🧣',name:'MAGIC BANDANA',desc:'Max HP doubles to 200 + full heal. Permanent this match.'},
  cloak:{icon:'👻',name:'GHOST CLOAK',desc:'Bots can\'t see you for 12 seconds.'},
  adren:{icon:'⚡',name:'ADRENALINE SHOT',desc:'+50% run speed for 10 seconds.'} };
function updateWood(){ $('woodHud').textContent='🪵 '+woodCount; }
const stats = { shots:0, hits:0, headshots:0, dmg:0, chests:0, bonus:0, streakBest:0 };
const upg = { resMult:1, magMult:1, homing:false };
let lockCand=null, lockT=0, lockLost=0, lockedOn=null, lockBeepT=0;
const LOCK_DIR=new THREE.Vector3(), LOCK_POS=new THREE.Vector3(), LOCK_TMP=new THREE.Vector3();
function lockBeep(final){ try{ if(!ac) return; const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();
  o.connect(g); g.connect(ac.destination); o.type='square';
  o.frequency.setValueAtTime(final?1400:880,t); g.gain.setValueAtTime(final?.09:.05,t);
  g.gain.exponentialRampToValueAtTime(.001,t+(final?.22:.07)); o.start(t); o.stop(t+(final?.25:.08));
  if(final){ const o2=ac.createOscillator(),g2=ac.createGain(); o2.connect(g2); g2.connect(ac.destination);
    o2.type='square'; o2.frequency.setValueAtTime(1400,t+.12); g2.gain.setValueAtTime(.09,t+.12);
    g2.gain.exponentialRampToValueAtTime(.001,t+.3); o2.start(t+.12); o2.stop(t+.32); } }catch(e){} }
function magSize(w,it){ return Math.round(w.mag*upg.magMult)*(it&&it.dual?2:1); }
function resMax(w){ return Math.round((w.res||60)*upg.resMult); }
let streakN=0, streakT=0;
const EYE=1.7, SPEED=10, SPRINT=14.5, GRAV=28, JUMP=9.5;

// ---------- bots ----------
const BOT_NAMES=['Iron Mate','The Incredible Sulk','Spider-Lad','Captain Cyprus','Bat-Dad','Wonder Wanda','Thorbjörn','Black Widower','Doctor Weird','Aqua-Fella','Hawk-Eyed Harry','Green Lantern Jim','Silver Sofer','Ant-Uncle','Star-Lawd','Groot Jr','Rocket Racoondog','Miss Marvellous','Deadpond','Wolverleen'];
const bots=[];
// shared bot part geometries (built once, reused by every bot)
// ---------- clothing fabric: neutral woven texture, tinted per-tier via material.color ----------
const fabricTex = (()=>{
  const cv=texCanvas(64), cx=cv.getContext('2d');
  cx.fillStyle='#d7d7d7'; cx.fillRect(0,0,64,64);
  cx.strokeStyle='rgba(0,0,0,.08)'; cx.lineWidth=1;
  for(let i=-64;i<128;i+=4){ cx.beginPath(); cx.moveTo(i,0); cx.lineTo(i-64,64); cx.stroke(); }
  cx.strokeStyle='rgba(255,255,255,.10)';
  for(let i=-62;i<128;i+=4){ cx.beginPath(); cx.moveTo(i,0); cx.lineTo(i-64,64); cx.stroke(); }
  cx.fillStyle='rgba(0,0,0,.06)';
  for(let i=0;i<300;i++) cx.fillRect(Math.random()*64,Math.random()*64,1,1);
  const t=new THREE.CanvasTexture(cv);
  t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(2,2);
  return t;
})();
const BOTGEO = {
  torso: new THREE.BoxGeometry(.8,1.05,.45),
  head:  new THREE.BoxGeometry(.55,.55,.55),
  arm:   new THREE.BoxGeometry(.2,.85,.2),
  leg:   new THREE.BoxGeometry(.26,.9,.26),
  hit:   new THREE.BoxGeometry(.95,1.8,.6),
};
const SKIN_HEX = 0xffe0bd;
const botSkinMat = toonMat({color:SKIN_HEX});
const botPantsMat = toonMat({color:0x33334a, map:fabricTex});
const botHitMat = new THREE.MeshBasicMaterial({visible:false});   // raycastable, never drawn
// 3 face variants drawn once on canvas (eyes + mouth on skin tone)
const botFaceMats = [0,1,2].map(v=>{
  const cv=document.createElement('canvas'); cv.width=cv.height=64;
  const cx=cv.getContext('2d');
  cx.fillStyle='#ffe0bd'; cx.fillRect(0,0,64,64);
  cx.fillStyle='#221a14';
  cx.fillRect(14,22,9,v===1?11:9); cx.fillRect(41,22,9,v===1?11:9);        // eyes
  cx.fillStyle='#fff'; cx.fillRect(16,24,3,3); cx.fillRect(43,24,3,3);      // eye glints
  cx.fillStyle='#a3552f';
  if(v===0){ cx.fillRect(22,45,20,4); }                                     // flat mouth
  else if(v===1){ cx.beginPath(); cx.arc(32,44,9,0,Math.PI); cx.fill(); }   // grin
  else { cx.fillRect(24,46,16,3); cx.fillRect(20,43,6,3); }                 // smirk
  const t=new THREE.CanvasTexture(cv);
  return toonMat({color:0xffffff, map:t});
});
// head material arrays: skin on 5 sides, face on +Z (bots lookAt the player, so faces point at you)
const botHeadMats = botFaceMats.map(f=>[botSkinMat,botSkinMat,botSkinMat,botSkinMat,f,botSkinMat]);
function makeBot(name, outfit){
  const g=new THREE.Group();
  const tier=TIERS[pickTier()];
  const col=new THREE.Color(tier.col); col.offsetHSL(rand(-.02,.02),0,rand(-.07,.07));
  const bodyMat=toonMat({color:col, map:fabricTex});
  // torso (visual) + invisible full-body hitbox (b.body raycast target, matches old capsule coverage)
  const torso=new THREE.Mesh(BOTGEO.torso, bodyMat); torso.position.y=1.35; torso.castShadow=true;
  const hitbox=new THREE.Mesh(BOTGEO.hit, botHitMat); hitbox.position.y=.97;
  const head=new THREE.Mesh(BOTGEO.head, botHeadMats[(Math.random()*3)|0]);
  head.position.y=2.18; head.castShadow=true;
  if(cheats.bighead) head.scale.setScalar(2.2);   // BIGHEAD applies to future bots too
  // limbs: pivot groups at shoulder/hip so rotation.x swings them
  const limb=(geo,mat,px,py,oy)=>{
    const piv=new THREE.Group(); piv.position.set(px,py,0);
    const m=new THREE.Mesh(geo,mat); m.position.y=oy; m.castShadow=true;
    piv.add(m); g.add(piv); return piv;
  };
  const pantsMat = (outfit && outfit.pants) ? toonMat({color:new THREE.Color(PANTS[outfit.pants].color)}) : botPantsMat;
  const armL=limb(BOTGEO.arm, bodyMat, -.52, 1.8, -.38);
  const armR=limb(BOTGEO.arm, bodyMat,  .52, 1.8, -.38);
  const legL=limb(BOTGEO.leg, pantsMat, -.21, .92, -.45);
  const legR=limb(BOTGEO.leg, pantsMat,  .21, .92, -.45);
  g.add(torso,hitbox,head);
  // WAVE3: premade cosmetics — only real players carry an `outfit`; AI bots keep their tier look
  if(outfit){
    if(outfit.shirt){
      const shirt=new THREE.Mesh(new THREE.BoxGeometry(.86,1.08,.5), toonMat({color:new THREE.Color(SHIRTS[outfit.shirt].color)}));
      torso.add(shirt);
    }
    if(outfit.hat){
      const hat=new THREE.Mesh(new THREE.BoxGeometry(.5,.28,.5), toonMat({color:new THREE.Color(HATS[outfit.hat].color)}));
      hat.position.set(0,.42,0); hat.castShadow=true; head.add(hat);
    }
    if(outfit.glasses){
      const glasses=new THREE.Mesh(new THREE.BoxGeometry(.48,.14,.06), toonMat({color:new THREE.Color(GLASSES[outfit.glasses].color)}));
      glasses.position.set(0,-.03,.32); head.add(glasses);
    }
    if(outfit.socks){
      const sockMat=toonMat({color:new THREE.Color(SOCKS[outfit.socks].color)});
      [legL,legR].forEach(piv=>{
        const sock=new THREE.Mesh(new THREE.BoxGeometry(.3,.22,.3), sockMat);
        sock.position.set(0,-.8,0); piv.add(sock);
      });
    }
  }
  const tagCv=document.createElement('canvas'); tagCv.width=128; tagCv.height=36;
  const tagTex=new THREE.CanvasTexture(tagCv);
  const tag=new THREE.Sprite(new THREE.SpriteMaterial({map:tagTex,transparent:true}));
  tag.position.y=3.15; tag.scale.set(2.5,.7,1); g.add(tag);
  const a=rand(0,Math.PI*2), r=rand(MAP*.3,MAP*.8);
  const fs=findFreeSpot(Math.cos(a)*r, Math.sin(a)*r, .8);
  g.position.set(fs.x,0,fs.z);
  scene.add(g);
  return {name,mesh:g,head,body:hitbox,tag,tagCv,tagTex,hpShown:-1,tier,col:col.getHex(),armL,armR,legL,legR,phase:rand(0,6),swing:0,moving:false,
    hp:100,alive:true,cd:rand(.5,2.2),strafeT:0,strafeDir:1,
    target:new THREE.Vector3(rand(-60,60),0,rand(-60,60)),retargetT:rand(2,5),speed:rand(6.5,8.5)};
}

function drawTag(b){
  const cx=b.tagCv.getContext('2d'), hp=Math.max(0,Math.ceil(b.hp));
  const pct=clamp(hp/(b.maxHp||100),0,1);
  if(b.boss){
    cx.clearRect(0,0,256,48);
    cx.fillStyle='rgba(0,0,0,.72)'; cx.fillRect(0,0,256,48);
    cx.font='bold 19px Arial'; cx.textAlign='center'; cx.fillStyle='#ff9df0';
    cx.fillText('☠ '+b.name+' ☠', 128, 20);
    cx.fillStyle='#31103a'; cx.fillRect(8,27,240,15);
    cx.fillStyle = pct>.5?'#c26bff':pct>.25?'#ffb400':'#ff4444';
    cx.fillRect(8,27,240*pct,15);
  } else {
    cx.clearRect(0,0,128,36);
    cx.fillStyle='rgba(0,0,0,.55)'; cx.fillRect(2,1,124,15);
    cx.font='bold 11px Arial'; cx.textAlign='center'; cx.fillStyle='#fff';
    cx.fillText(b.name, 64, 12);
    cx.fillStyle='rgba(0,0,0,.55)'; cx.fillRect(4,19,120,15);
    cx.fillStyle = pct>.5?'#41d94d':pct>.25?'#ffb400':'#ff4444';
    cx.fillRect(6,21,116*pct,11);
    cx.font='bold 11px Arial'; cx.fillStyle='#fff';
    cx.fillText(hp, 64, 30);
  }
  b.tagTex.needsUpdate=true; b.hpShown=b.hp;
}
// ---------- input ----------
const keys={}; let locked=false, mouseDown=false, adsHeld=false, adsOn=false;
let crouchK=0, touchCrouch=false;
let joyX=0, joyY=0, touchFire=false;   // virtual stick + fire button (touch)
addEventListener('keydown', e=>{
  if(hsOpen){ hsKey(e); return; }                     // arcade initials panel captures input
  if(spectating){ if(performance.now()-specStart>3000) showEnd(deathTitle,deathStats); return; }
  keys[e.code]=true;
  if(e.code==='Digit1') switchSlot(0);
  if(e.code==='Digit2') switchSlot(1);
  if(e.code==='Digit3') switchSlot(2);
  if(e.code==='Digit4') switchSlot(3);
  if(e.code==='Digit5') switchSlot(4);
  if(e.code==='KeyR') reload();
  if(e.code==='KeyE'){ if(inKart) exitKart(); else tryInteract(); }
  if(e.code==='KeyQ') placeStructure('wall');
  if(e.code==='KeyF') placeStructure('ramp');
  if(e.code==='KeyG') fireGrapple();
  if(e.code==='KeyV') dance();
  if(e.code==='Tab'){ e.preventDefault(); if(running&&!gameOver&&player.alive&&!spectating) toggleInvOverlay(); }
});
function toggleInvOverlay(){
  paused=!paused;
  $('invOverlay').style.display=paused?'flex':'none';
  if(paused){ document.exitPointerLock&&document.exitPointerLock(); renderInvOverlay(); }
  else if(!isTouch) lockPtr();
}
function renderInvOverlay(){
  const weps = inv.map((it,i)=>{
    if(!it) return `<div class="invW" style="opacity:.35">slot ${i+1} — empty</div>`;
    const w=WEAPONS[it.key];
    return `<div class="invW">${i===activeSlot?'▶ ':''}<b>${it.dual?'🔫🔫 DUAL ':''}${w.name}</b>${w.mag?` · ${it.ammo}/${magSize(w,it)} (+${it.res|0})`:''}</div>`;
  }).join('');
  const its = items.length ? items.map((k,i)=>{
    const d=ITEMS[k];
    return `<div class="invIt"><span style="font-size:26px">${d.icon}</span> <div style="flex:1"><b>${d.name}</b><br><small>${d.desc}</small></div><button onclick="useItem(${i})">USE</button></div>`;
  }).join('') : '<div style="opacity:.5">No special items — find them in chests 📦</div>';
  $('invBody').innerHTML = `<div style="margin-bottom:8px">🪵 <b>${woodCount}</b> wood · chop trees with the knife · wall 10 / ramp 15</div><hr style="opacity:.2">${weps}<hr style="opacity:.2">${its}`;
}
function useItem(i){
  const k=items[i]; if(!k) return;
  items.splice(i,1);
  if(k==='bandana'){ player.maxHp=200; player.hp=200; showMsg('🧣 MAGIC BANDANA! Max HP doubled + full heal'); }
  if(k==='cloak'){ player.cloakT=12; showMsg('👻 GHOST CLOAK — invisible for 12s'); }
  if(k==='adren'){ player.adrT=10; showMsg('⚡ ADRENALINE — 1.5× speed for 10s'); }
  updateBars(); renderInvOverlay();
}
window.useItem=useItem; window.toggleInvOverlay=toggleInvOverlay;
addEventListener('keyup', e=>keys[e.code]=false);
addEventListener('mousedown', e=>{
  if(hsOpen) return;                                  // let the initials panel buttons take clicks
  if(spectating){ if(performance.now()-specStart>3000) showEnd(deathTitle,deathStats); return; }
  if(e.button===2) adsHeld=true; else mouseDown=true;
});
addEventListener('mouseup', e=>{ if(e.button===2) adsHeld=false; else mouseDown=false; });
addEventListener('contextmenu', e=>e.preventDefault());
addEventListener('mousemove', e=>{
  if(!locked) return;
  const sens=.0021*(camera.fov/80);   // slower while scoped
  player.yaw -= e.movementX*sens;
  player.pitch -= e.movementY*sens;
  player.pitch = clamp(player.pitch,-1.45,1.45);
});
addEventListener('wheel', e=>{
  if(!locked) return;   // WAVE2: weapon switching allowed during grace
  const dir = e.deltaY>0?1:-1;
  for(let step=1; step<=4; step++){
    const j = ((activeSlot+dir*step)%5+5)%5;
    if(inv[j]){ switchSlot(j); break; }
  }
}, {passive:true});
document.addEventListener('pointerlockchange', ()=>{ locked = document.pointerLockElement===renderer.domElement; });
function lockPtr(){ try{ const r=renderer.domElement.requestPointerLock(); if(r&&r.catch) r.catch(()=>{}); }catch(e){} }

function nearestInteractable(){
  for(const c of chests){ if(!c.open && Math.hypot(c.x-player.pos.x, c.z-player.pos.z)<2.6 && Math.abs((c.y||0)-(player.pos.y-EYE))<2.2) return {t:'chest',o:c}; }
  for(const f of floorLoot){ if(f.mesh.position.distanceTo(player.pos)<2.4) return {t:'gun',o:f}; }
  for(const dp of drops){ if(dp.landed&&!dp.opened&&Math.hypot(dp.x-player.pos.x,dp.z-player.pos.z)<2.8) return {t:'drop',o:dp}; }
  for(const k of karts){ if(k.mesh.position.distanceTo(player.pos)<3.4) return {t:'kart',o:k}; }
  return null;
}
function tryInteract(){
  if(!player.alive) return;
  const n=nearestInteractable();
  if(!n) return;
  if(n.t==='chest') openChest(n.o);
  else if(n.t==='gun'){ giveWeapon(n.o.key, n.o.rarity); scene.remove(n.o.mesh); floorLoot.splice(floorLoot.indexOf(n.o),1); }
  else if(n.t==='drop') openDrop(n.o);
  else if(n.t==='kart') enterKart(n.o);
}

// ---------- floating damage numbers ----------
function dmgNumber(pos, amount, head){
  const cv=document.createElement('canvas'); cv.width=128; cv.height=64;
  const cx=cv.getContext('2d');
  cx.font='bold '+(head?44:32)+'px Arial'; cx.textAlign='center';
  cx.fillStyle=head?'#ff5555':'#ffe27a'; cx.strokeStyle='#000'; cx.lineWidth=6;
  cx.strokeText(Math.round(amount), 64, 44); cx.fillText(Math.round(amount), 64, 44);
  const tex=new THREE.CanvasTexture(cv);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex, transparent:true, depthTest:false}));
  sp.position.copy(pos); sp.position.y+=0.3;
  const dsc=clamp(pos.distanceTo(camera.position)/35, 1, 7);   // long-range hits stay readable
  sp.scale.set((head?1.6:1.1)*dsc,(head?0.8:0.55)*dsc,1);
  scene.add(sp);
  const t0=performance.now();
  (function fl(){ const t=(performance.now()-t0)/800;
    sp.position.y+=0.012; sp.material.opacity=1-t;
    if(t<1) requestAnimationFrame(fl); else { scene.remove(sp); tex.dispose(); } })();
}

// ---------- shooting ----------
const ray = new THREE.Raycaster();
const tracerMat = new THREE.LineBasicMaterial({color:0xfff3b0,transparent:true,opacity:.9});
function tracer(from,to){
  const g=new THREE.BufferGeometry().setFromPoints([from,to]);
  const l=new THREE.Line(g,tracerMat.clone()); scene.add(l);
  let life=.06;
  (function tick(){ life-=.016; l.material.opacity=life/.06*.9; if(life<=0){scene.remove(l); g.dispose();} else requestAnimationFrame(tick); })();
}
const rockets=[];
function explode(pos, mult=1, by){
  const pd0=player.pos.distanceTo(pos); afile(pd0<28?'x_near':'x_far', pd0<28?.85:.55);
  const flash=new THREE.PointLight(0xff8844,10,34); flash.position.copy(pos); scene.add(flash);
  const ball=new THREE.Mesh(new THREE.SphereGeometry(1,12,12), new THREE.MeshBasicMaterial({color:0xffaa33,transparent:true,opacity:.9}));
  ball.position.copy(pos); scene.add(ball);
  const ring=new THREE.Mesh(new THREE.RingGeometry(.8,1,24), new THREE.MeshBasicMaterial({color:0xffcc66,transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false}));
  ring.rotation.x=-Math.PI/2; ring.position.set(pos.x,.25,pos.z); scene.add(ring);
  let s=1, rs=1;
  (function grow(){ s+=1.5; rs+=2.6; ball.scale.setScalar(s); ball.material.opacity-=.09;
    ring.scale.setScalar(rs); ring.material.opacity-=.07;
    if(ball.material.opacity>0) requestAnimationFrame(grow);
    else { scene.remove(ball,flash,ring); ring.geometry.dispose(); ring.material.dispose(); } })();
  const shakeD=player.pos.distanceTo(pos);
  if(shakeD<30){ const k=1-shakeD/30; player.pitch+=rand(-.02,.02)*k*3; player.yaw+=rand(-.02,.02)*k*3; }
  const R = WEAPONS.rocket.blast;
  for(const b of bots){ if(!b.alive||grace>0||b.dropping) continue;   // WAVE2: no bot damage during grace; parachuting bosses immune
    const d=b.mesh.position.clone().setY(1.2).distanceTo(pos);
    if(d<R){ const rd = WEAPONS.rocket.dmg*mult*(1-d/R*.6); b.hp -= rd; stats.dmg += Math.round(rd); stats.hits++; dmgNumber(b.mesh.position.clone().setY(1.8), rd, false); if(b.hp<=0) killBot(b,false); }
  }
  const pd=player.pos.distanceTo(pos);
  if(pd<R) damagePlayer(60*(1-pd/R), by||'your own rocket', pos);
}
let graceHintT=0;   // WAVE2: grace period no longer blocks shooting — bots just can't be hurt yet
function graceHint(){
  const t=performance.now();
  if(t-graceHintT<3000) return;
  graceHintT=t;
  showMsg('🕊 grace period — weapons hot in '+Math.max(1,Math.ceil(grace))+'s',1300);
}
function shoot(now){
  const it=inv[activeSlot], w=W();
  const dual = it && it.dual;
  if(!w || reloading || now-lastShot < (dual? w.rate*0.55 : w.rate)) return;
  const mult = it ? RARITIES[it.rarity||0].mult : 1;   // rarity damage multiplier
  if(w.type==='melee'){
    lastShot=now; sfx(w.sfx); stats.shots++;
    vmSwing=1;   // knife chop (animated in main loop)
    const dir=new THREE.Vector3(); camera.getWorldDirection(dir);
    ray.set(camera.getWorldPosition(new THREE.Vector3()),dir); ray.far=w.range;
    if(grace<=0){   // WAVE2: during grace the knife still swings + chops trees, but can't hurt bots
      let best=null,bestD=Infinity;
      for(const b of bots){ if(!b.alive||b.dropping) continue;
        for(const part of [b.head,b.body]){
          const hits=ray.intersectObject(part,false);
          if(hits.length && hits[0].distance<bestD){ best=b; bestD=hits[0].distance; } } }
      if(best){ const md=w.dmg*mult; best.hp-=md; stats.hits++; stats.dmg+=Math.round(md); hitmark(false); if(best.hp<=0) killBot(best,false); return; }
    }
    // no bot hit — try chopping a tree
    ray.far=4.5;
    for(const t of trees){
      if(!t.alive || Math.hypot(t.x-player.pos.x,t.z-player.pos.z)>4.5) continue;
      const th=ray.intersectObject(t.trunk,false);
      if(th.length){
        t.hp--; woodCount+=10; updateWood(); sfx('thud');
        voxelBurst(th[0].point, 0x8a5a2d, 0xb07d4c);                       // wood-chip burst
        dropLeaves(t.crown.position.x, t.crown.position.y, t.crown.position.z);
        t.crown.rotation.z+=rand(-.12,.12); t.crown.position.x=t.x+rand(-.15,.15);
        if(t.hp<=0){ t.alive=false; voxelBurst(t.crown.position, 0x3fae4f); scene.remove(t.trunk,t.crown); showMsg('🌲 TIMBER! +10 wood',900); }
        else showMsg('🪵 +10 wood',600);
        break;
      }
    }
    return;
  }
  if(it.ammo<=0){ reload(); return; }
  lastShot=now; it.ammo--; renderSlots();
  stats.shots++; let pulledHit=false;
  sfx(w.sfx);
  flashOn();
  recoil=Math.min(recoil+(w.kick||0.018),.11);
  vmKick=1;   // visual kick (animated in main loop)
  const dir0=new THREE.Vector3(); camera.getWorldDirection(dir0);
  if(w.type==='rocket'){
    const m=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.5,8), toonMat({color:0x333,emissive:0xff5522,emissiveIntensity:.6}));
    m.position.copy(camera.getWorldPosition(new THREE.Vector3())).add(dir0.clone().multiplyScalar(1.2));
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir0);
    scene.add(m);
    rockets.push({mesh:m, dir:dir0.clone(), life:5, mult, target:(upg.homing&&lockedOn&&lockedOn.alive)?lockedOn:null});
    if(upg.homing&&lockedOn) { lockedOn=null; lockCand=null; lockT=0; }
    setTimeout(reload, 250);
    return;
  }
  ejectShell();                                       // brass out the side (guns only — knife/rocket returned above)
  const scoped = adsOn && it.key==='sniper';          // scoped AWP: laser-accurate, no spread/recoil
  const sprd = scoped ? 0 : w.spread, rcl = scoped ? 0 : recoil;
  for(let p=0;p<w.pellets;p++){
    const dir=dir0.clone();
    dir.x+=rand(-sprd,sprd)+(p?rand(-.03,.03):0);
    dir.y+=rand(-sprd,sprd)+rcl*.5+(p?rand(-.03,.03):0);
    dir.z+=rand(-sprd,sprd);
    dir.normalize();
    ray.set(camera.getWorldPosition(new THREE.Vector3()),dir); ray.far=w.range;
    let best=null,bestD=Infinity,isHead=false;
    for(const b of bots){ if(!b.alive||b.dropping) continue;
      const hH=ray.intersectObject(b.head,false), hB=ray.intersectObject(b.body,false);
      if(hH.length&&hH[0].distance<bestD){best=b;bestD=hH[0].distance;isHead=true;}
      if(hB.length&&hB[0].distance<bestD){best=b;bestD=hB[0].distance;isHead=false;} }
    let wallD=Infinity,wallPt=null;
    const wallHits=ray.intersectObjects(obstacles.map(o=>o.mesh),false);
    if(wallHits.length){wallD=wallHits[0].distance;wallPt=wallHits[0].point;}
    const from=camera.getWorldPosition(new THREE.Vector3()).add(dir.clone().multiplyScalar(1.2)).add(new THREE.Vector3(0,-.12,0));
    if(best&&bestD<wallD&&grace>0){   // WAVE2: guns fire during grace, but hits are blanks
      tracer(from, ray.ray.at(bestD,new THREE.Vector3()));
      graceHint();
    } else if(best&&bestD<wallD){
      const d0 = w.dmg*(isHead?w.hs:1)*mult;
      if(it.key==='sniper' && isHead && !best.boss) best.hp = 0;   // AWP headshot = instant kill (boss takes normal dmg)
      else best.hp -= d0;
      stats.dmg += Math.round(d0);
      if(!pulledHit){ stats.hits++; pulledHit=true; }
      if(isHead) stats.headshots++;
      dmgNumber(ray.ray.at(bestD,new THREE.Vector3()), d0, isHead);
      tracer(from, ray.ray.at(bestD,new THREE.Vector3()));
      hitmark(isHead);
      if(best.hp<=0) killBot(best,isHead);
    } else tracer(from, wallPt||ray.ray.at(w.range,new THREE.Vector3()));
  }
}
function hitmark(head){ const h=$('hitmark'); h.style.color=head?'#ffd34d':'#fff'; h.style.opacity=1; sfx('hit'); setTimeout(()=>h.style.opacity=0,90); }

// ---------- WAVE2: grappling hook (G / 🪝) ----------
let grapCd=0, grapPull=null, grapRopeT=0, grapHudTxt='';
const grapTarget=new THREE.Vector3();
const grapRope=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,1,6), toonMat({color:0x8a6a3a}));
grapRope.visible=false; grapRope.castShadow=false; scene.add(grapRope);
const _grV1=new THREE.Vector3(), _grV2=new THREE.Vector3(), _grQ=new THREE.Quaternion(), _grUP=new THREE.Vector3(0,1,0);
function fireGrapple(){
  if(!running||gameOver||spectating||inKart||!player.alive||paused||grapPull||grapCd>0) return;
  const dir=new THREE.Vector3(); camera.getWorldDirection(dir);
  ray.set(camera.getWorldPosition(new THREE.Vector3()),dir); ray.far=45;
  const hits=ray.intersectObjects(obstacles.map(o=>o.mesh),false);
  if(!hits.length || hits[0].point.y<=player.pos.y+.3){ showMsg('🪝 No anchor — aim at a wall above you',900); return; }
  const pt=hits[0].point;
  grapCd=3;
  grapPull={t:0, dur:.6, from:player.pos.clone(), to:pt.clone().add(new THREE.Vector3(0,EYE+.25,0))};
  grapTarget.copy(pt);
  grapRopeT=.8; grapRope.visible=true;
  afile('x_far',.2);                       // whoosh
  reloading=false;                         // hands off the mag — you're flying
}
function updateGrappleFx(dt){
  if(grapCd>0) grapCd=Math.max(0,grapCd-dt);
  if(grapRopeT>0){
    grapRopeT-=dt;
    if(grapRopeT<=0) grapRope.visible=false;
    else {
      camera.getWorldPosition(_grV1); camera.getWorldQuaternion(_grQ);
      _grV2.set(.25,-.22,-.35).applyQuaternion(_grQ); _grV1.add(_grV2);   // from the viewmodel area
      const len=Math.max(.1,_grV1.distanceTo(grapTarget));
      grapRope.position.copy(_grV1).add(grapTarget).multiplyScalar(.5);
      _grV2.copy(grapTarget).sub(_grV1).normalize();
      grapRope.quaternion.setFromUnitVectors(_grUP,_grV2);
      grapRope.scale.set(.05,len,.05);
    }
  }
  const txt = grapCd>0 ? '🪝 '+grapCd.toFixed(1)+'s' : (isTouch?'🪝 READY':'🪝 READY (G)');
  if(txt!==grapHudTxt){ grapHudTxt=txt; const el=$('grapHud'); el.textContent=txt; el.style.opacity=grapCd>0?.55:1; }
}
// ---------- voxel death burst (max 3 concurrent, updated in main loop) ----------
const bursts=[];
const voxGeo=new THREE.BoxGeometry(.24,.24,.24);
function voxelBurst(pos,colHex,colB){
  if(bursts.length>=3){ const old=bursts.shift();
    for(const c of old.cubes) scene.remove(c.m);
    old.matA.dispose(); old.matB.dispose(); }
  const matA=toonMat({color:colHex, transparent:true});
  const matB=toonMat({color:colB||SKIN_HEX, transparent:true});
  const cubes=[];
  for(let i=0;i<6;i++){
    const m=new THREE.Mesh(voxGeo, i%3===2?matB:matA);
    m.position.set(pos.x+rand(-.35,.35), rand(.3,2.1), pos.z+rand(-.35,.35));
    m.rotation.set(rand(0,3),rand(0,3),rand(0,3));
    scene.add(m);
    cubes.push({m, vx:rand(-4.5,4.5), vy:rand(2,7.5), vz:rand(-4.5,4.5), rx:rand(-8,8), ry:rand(-8,8)});
  }
  bursts.push({cubes,matA,matB,t:0});
}
function updateBursts(dt){
  for(let i=bursts.length-1;i>=0;i--){
    const bu=bursts[i]; bu.t+=dt;
    const k=bu.t/1.2;
    if(k>=1){ for(const c of bu.cubes) scene.remove(c.m);
      bu.matA.dispose(); bu.matB.dispose(); bursts.splice(i,1); continue; }
    bu.matA.opacity=1-k; bu.matB.opacity=1-k;
    for(const c of bu.cubes){
      c.vy-=14*dt;
      c.m.position.x+=c.vx*dt; c.m.position.y+=c.vy*dt; c.m.position.z+=c.vz*dt;
      if(c.m.position.y<.12){ c.m.position.y=.12; c.vy*=-.4; c.vx*=.75; c.vz*=.75; }
      c.m.rotation.x+=c.rx*dt; c.m.rotation.y+=c.ry*dt;
    }
  }
}

// ---------- juice: shell casings, falling leaves, rocket smoke (all pooled) ----------
const _jV1=new THREE.Vector3(), _jV2=new THREE.Vector3(), _jQ=new THREE.Quaternion();
const shellPool=[]; let shellIx=0;
{ const geo=new THREE.BoxGeometry(.026,.026,.06);
  for(let i=0;i<24;i++){ const m=new THREE.Mesh(geo, new THREE.MeshBasicMaterial({color:0xe8c24a, transparent:true}));
    m.visible=false; scene.add(m);
    shellPool.push({m, life:0, vel:new THREE.Vector3(), rx:0, ry:0}); } }
function ejectShell(){
  const s=shellPool[shellIx]; shellIx=(shellIx+1)%shellPool.length;
  camera.getWorldPosition(_jV1); camera.getWorldQuaternion(_jQ);
  _jV2.set(1,0,0).applyQuaternion(_jQ);                       // camera right
  s.m.position.copy(_jV1).addScaledVector(_jV2,.3);
  s.vel.copy(_jV2).multiplyScalar(rand(1.4,2.4));             // fling right…
  _jV2.set(0,0,-1).applyQuaternion(_jQ);
  s.m.position.addScaledVector(_jV2,.55); s.m.position.y-=.18; // …from the viewmodel area
  s.vel.y+=rand(1.2,2.2); s.vel.addScaledVector(_jV2,rand(-.4,.2));
  s.m.rotation.set(rand(0,3),rand(0,3),rand(0,3));
  s.rx=rand(-16,16); s.ry=rand(-16,16);
  s.life=.8; s.m.material.opacity=1; s.m.visible=true;
}
function updateShells(dt){
  for(const s of shellPool){
    if(s.life<=0) continue;
    s.life-=dt;
    if(s.life<=0){ s.m.visible=false; continue; }
    s.vel.y-=14*dt;
    s.m.position.addScaledVector(s.vel,dt);
    s.m.rotation.x+=s.rx*dt; s.m.rotation.y+=s.ry*dt;
    if(s.life<.25) s.m.material.opacity=s.life/.25;
  }
}
const leafPool=[]; let leafIx=0;
{ const geo=new THREE.PlaneGeometry(.34,.34);
  for(let i=0;i<9;i++){ const m=new THREE.Mesh(geo, new THREE.MeshBasicMaterial({color:i%2?0x3fae4f:0x6ede56, side:THREE.DoubleSide, transparent:true}));
    m.visible=false; scene.add(m);
    leafPool.push({m, life:0, max:1, vx:0, vz:0, ph:0}); } }
function dropLeaves(x,y,z){
  for(let k=0;k<3;k++){
    const L=leafPool[leafIx]; leafIx=(leafIx+1)%leafPool.length;
    L.m.position.set(x+rand(-.9,.9), y+rand(-.3,.7), z+rand(-.9,.9));
    L.max=L.life=rand(1.5,2.1); L.vx=rand(-.35,.35); L.vz=rand(-.35,.35); L.ph=rand(0,6);
    L.m.material.opacity=1; L.m.visible=true;
  }
}
function updateLeaves(dt){
  for(const L of leafPool){
    if(L.life<=0) continue;
    L.life-=dt;
    if(L.life<=0 || L.m.position.y<.1){ L.life=0; L.m.visible=false; continue; }
    L.ph+=dt*5;
    L.m.position.x+=(L.vx+Math.sin(L.ph)*.7)*dt;
    L.m.position.z+=L.vz*dt;
    L.m.position.y-=1.15*dt;
    L.m.rotation.set(Math.sin(L.ph)*.9, L.ph*.5, Math.cos(L.ph*.8)*.6);
    if(L.life<.4) L.m.material.opacity=L.life/.4;
  }
}
const smokePool=[]; let smokeIx=0;
{ const cv=texCanvas(64), cx=cv.getContext('2d');
  const g=cx.createRadialGradient(32,32,2,32,32,30);
  g.addColorStop(0,'rgba(255,255,255,.9)'); g.addColorStop(1,'rgba(255,255,255,0)');
  cx.fillStyle=g; cx.fillRect(0,0,64,64);
  const tex=new THREE.CanvasTexture(cv);
  for(let i=0;i<30;i++){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex, color:0x9a9a9a, transparent:true, depthWrite:false}));
    sp.visible=false; scene.add(sp);
    smokePool.push({sp, life:0}); } }
function puffSmoke(p){
  const s=smokePool[smokeIx]; smokeIx=(smokeIx+1)%smokePool.length;
  s.sp.position.copy(p); s.sp.position.y+=rand(-.05,.05);
  s.life=.7; s.sp.scale.setScalar(.5); s.sp.material.opacity=.5; s.sp.visible=true;
}
function updateSmoke(dt){
  for(const s of smokePool){
    if(s.life<=0) continue;
    s.life-=dt;
    if(s.life<=0){ s.sp.visible=false; continue; }
    s.sp.scale.setScalar(.5+(0.7-s.life)*1.7);
    s.sp.material.opacity=.5*s.life/.7;
    s.sp.position.y+=dt*.4;
  }
}
function botDeathFx(b){   // WAVE2: shared death juice — used for player kills AND bot-vs-bot kills
  voxelBurst(b.mesh.position, b.col);
  scene.remove(b.mesh);
  spawnPickup(['med','shield','shield','ammo'][Math.floor(rand(0,4))], b.mesh.position.x, b.mesh.position.z);
  if(mutator!=='knives' && Math.random()<.4) spawnFloorGun(lootGunKey(), b.mesh.position.x+rand(-1,1), b.mesh.position.z+rand(-1,1));
}
function botKillBot(victim,killer){   // WAVE2: bot-vs-bot kill — no player credit, no streaks, no score
  victim.alive=false;
  feed(`🤖 <b>${killer.name}</b> eliminated <b>${victim.name}</b>`);
  botDeathFx(victim);
  updateAlive();
}
function killBot(b,head){
  b.alive=false; player.kills++; sfxSynth('kill');
  const nowS=performance.now()/1000;
  streakN = (nowS-streakT<4) ? streakN+1 : 1; streakT=nowS;
  if(streakN>stats.streakBest) stats.streakBest=streakN;
  // one announcer line per kill event: multikill > boss > headshot > kill quip (guarded, no stacking)
  if(streakN===2){ stats.bonus+=2; showMsg('🔥 DOUBLE KILL! +2'); announce('doublekill',.95,900,true); }
  else if(streakN===3){ stats.bonus+=4; showMsg('🔥🔥 TRIPLE KILL! +4'); announce('rampage',.95,900,true); }
  else if(streakN>=4){ stats.bonus+=6; showMsg('💀 RAMPAGE! +6'); announce('rampage',.95,900,true); }
  else if(b.boss){ /* g80_daddy handled below */ }
  else if(head) announce('headshot',.9,600);
  else announce(KILLLINES[Math.floor(Math.random()*KILLLINES.length)],.9);
  $('killsN').textContent=player.kills;
  feed(`${player.name} ${head?'🎯 headshot':'eliminated'} <b>${b.name}</b>`);
  botDeathFx(b);
  if(b.boss){
    const cfg=STROYERS[b.stroyer]||STROYERS.dad;
    stats.bonus+=cfg.bonus;
    showMsg('☠ BOSS DOWN — '+cfg.name+' DEFEATED!<br><small>+'+cfg.bonus+' BONUS · loot shower</small>',2800);
    feed('🏆 <b>'+cfg.name+'</b> was destroyed! +'+cfg.bonus+' bonus');
    if(b.stroyer==='dad') announce('g80_daddy',.95,500,true); else announce('kill3',.9,500,true);
    const bp=b.mesh.position;
    voxelBurst({x:bp.x+1.6,z:bp.z+1.6}, cfg.col, cfg.torso);
    voxelBurst({x:bp.x-1.6,z:bp.z-1.6}, cfg.col, cfg.torso);
    const nGuns = b.stroyer==='dad'?5 : b.stroyer==='mum'?3 : 2;
    const gs=['rifle','sniper','rocket','deagle','m4'];
    for(let i=0;i<nGuns;i++){ const ga=i/nGuns*Math.PI*2; spawnFloorGun(gs[i], bp.x+Math.cos(ga)*3.2, bp.z+Math.sin(ga)*3.2, 4); }
    if(b.stroyer==='dad'||b.stroyer==='mum'){ spawnPickup('it_bandana', bp.x+3.6, bp.z); spawnPickup('it_adren', bp.x-3.6, bp.z); }
    if(b.stroyer==='dad') spawnPickup('it_cloak', bp.x+3.6, bp.z+3.6);
    for(let i=0;i<(b.stroyer==='dad'?4:2);i++) spawnPickup('wood', bp.x+rand(-4.5,4.5), bp.z+rand(-4.5,4.5));
  }
  updateAlive();
}
function feed(html){
  const d=document.createElement('div'); d.className='feedItem'; d.innerHTML=html;
  $('feed').prepend(d);
  while($('feed').children.length>5) $('feed').lastChild.remove();
  setTimeout(()=>d.remove(),6000);
}
function updateAlive(){
  const n=1+bots.filter(b=>b.alive).length;
  $('aliveN').textContent=n;
  if(bots.length && bots.every(b=>!b.alive)) win();
}

// ---------- bot AI ----------
let D = DIFFS[1];
const UP_Y = new THREE.Vector3(0,1,0);
// Destruction Demon: smashes through any obstacle blocking its path instead of colliding with it
function bossSmash(b){
  const r=1.6;
  for(let i=obstacles.length-1;i>=0;i--){
    const o=obstacles[i];
    if(b.mesh.position.x>o.min.x-r && b.mesh.position.x<o.max.x+r && b.mesh.position.z>o.min.z-r && b.mesh.position.z<o.max.z+r){
      voxelBurst({x:(o.min.x+o.max.x)/2, z:(o.min.z+o.max.z)/2}, 0x9a9a9a, 0x6a6a6a);
      scene.remove(o.mesh);
      obstacles.splice(i,1);
    }
  }
}
function botThink(b,dt,now){
  if(!b.alive) return;
  if(b.dropping){   // boss parachute descent
    b.mesh.position.y=Math.max(0,b.mesh.position.y-9*dt);
    b.mesh.rotation.y+=dt*.4;
    if(b.mesh.position.y<=0){ b.dropping=false; if(b.chute){ b.mesh.remove(b.chute); b.chute=null; } }
    return;
  }
  const toPlayer=player.pos.clone().sub(b.mesh.position); toPlayer.y=0;
  const dist=toPlayer.length();
  const centerDist=Math.hypot(b.mesh.position.x,b.mesh.position.z);
  let moveTarget=b.target;
  const stormPanic = centerDist>stormR-15;
  if(stormPanic){
    if(!b.safeSpot || Math.hypot(b.safeSpot.x,b.safeSpot.z)>stormR*.6){
      const a=Math.atan2(b.mesh.position.z,b.mesh.position.x)+rand(-.7,.7);
      const r=Math.max(0,stormR*.45);
      b.safeSpot=new THREE.Vector3(Math.cos(a)*r,0,Math.sin(a)*r);
    }
    moveTarget=b.safeSpot;
  }
  else {
    b.retargetT-=dt;
    if(b.retargetT<=0){
      b.retargetT=rand(2.5,6);
      b.target = Math.random()<.55
        ? player.pos.clone().add(new THREE.Vector3(rand(-18,18),0,rand(-18,18)))
        : new THREE.Vector3(rand(-1,1),0,rand(-1,1)).normalize().multiplyScalar(rand(0,Math.max(10,stormR*.8)));
    }
    moveTarget=b.target;
  }
  if(mutator==='knives' && player.alive && dist<25 && centerDist<=stormR-6) moveTarget=player.pos;   // WAVE2: knives-only bots lunge in
  if((b.stroyer==='kiara'||b.stroyer==='alfie') && player.alive && !stormPanic) moveTarget=player.pos;   // stroyers hunt YOU
  const dir=moveTarget.clone().sub(b.mesh.position); dir.y=0;
  b.moving=false;
  if(dir.length()>1.5){
    dir.normalize();
    if(dist<40 && !stormPanic){ b.strafeT-=dt; if(b.strafeT<=0){b.strafeT=rand(.5,1.3); b.strafeDir*=-1;}
      const perp=new THREE.Vector3(-dir.z,0,dir.x).multiplyScalar(.5*b.strafeDir); dir.add(perp).normalize(); }
    const spd=b.speed*(stormPanic?1.35:1);
    const np=b.mesh.position.clone().add(dir.clone().multiplyScalar(spd*dt));
    if(b.stroyer==='dad' && Math.hypot(np.x,np.z)<=MAP+4){
      bossSmash(b); b.mesh.position.copy(np); b.moving=true;
    } else if(!collides(np,.6)){ b.mesh.position.copy(np); b.moving=true; }
    else {
      // wall-slide: try ±55° so bots don't pile up dead against towers
      for(const ang of [0.96,-0.96]){
        const d2=dir.clone().applyAxisAngle(UP_Y, ang);
        const np2=b.mesh.position.clone().add(d2.multiplyScalar(spd*dt));
        if(!collides(np2,.6)){ b.mesh.position.copy(np2); b.moving=true; break; }
      }
      if(!b.moving && stormPanic) b.safeSpot=null;   // fully cornered → pick a new safe spot next tick
    }
    // face the direction actually being walked (not the player) — smoothed turn, purely cosmetic (botFire aims independently)
    const tYaw=Math.atan2(dir.x,dir.z), cy=b.mesh.rotation.y;
    b.mesh.rotation.y = cy + Math.atan2(Math.sin(tYaw-cy), Math.cos(tYaw-cy))*Math.min(1,dt*10);
  }
  // limb swing: advance phase while walking, ease out when stopped (arms/legs opposite phase)
  if(b.moving){ b.phase+=dt*b.speed*1.35; b.swing=Math.min(1,b.swing+dt*6); }
  else b.swing=Math.max(0,b.swing-dt*6);
  const sw=Math.sin(b.phase)*.62*b.swing;
  b.legL.rotation.x=sw;      b.legR.rotation.x=-sw;
  b.armL.rotation.x=-sw*.85; b.armR.rotation.x=sw*.85;
  // STROYER behaviours: enrage for all; Dad bursts+rockets; Mum heals + The Look
  if(b.boss && grace<=0 && player.alive){
    if(!b.enraged && b.hp<b.maxHp*.25){
      b.enraged=true; b.speed*=1.8;
      showMsg('☠ '+b.name+' IS FURIOUS',2200); sfx('horn');
      for(const ch of b.mesh.children){ if(ch.isMesh && ch.geometry===BOTGEO.torso){ ch.material.emissive.setHex(0xff1a1a); ch.material.emissiveIntensity=.55; break; } }
    }
    const rr=b.enraged?3:1;   // 200% more aggressive when furious
    if(b.stroyer==='dad'){
      b.burstT-=dt*rr; b.rocketT-=dt*rr;
      if(b.burstT<=0){ b.burstT=bcfg('dad','burst',6)*D.cd;
        for(let i=0;i<3;i++) setTimeout(()=>{ if(b.alive&&player.alive&&!gameOver&&!paused) botFire(b,null); }, i*190);
      }
      if(b.rocketT<=0){ b.rocketT=bcfg('dad','rocket',5)*D.cd; bossRocket(b); }
    }
    if(b.stroyer==='alfie'){
      b.slimeT=(b.slimeT===undefined?2:b.slimeT)-dt;
      if(b.slimeT<=0 && dist<60){ b.slimeT=bcfg('alfie','slime',2)*D.cd; throwSlime(b); }
      if(dist<3.2){ b.dummyT=(b.dummyT||0)-dt;
        if(b.dummyT<=0){ b.dummyT=.3; sfx('thud'); damagePlayer(rand(12,16)*D.dmg, b.name, b.mesh.position);
          if(b.blanket){ b.blanket.rotation.z=b.blanket.rotation.z===.4?-2.2:.4; } } }   // blanket whip flourish
      b.blanketT=(b.blanketT===undefined?8:b.blanketT)-dt;
      if(b.blanketT<=0 && dist<45 && dist>6){ b.blanketT=bcfg('alfie','blanket',8)*D.cd; throwBlanket(b); }
    }
    if(b.stroyer==='mum'){
      b.lookT=(b.lookT||9)-dt; b.healT=(b.healT||4)-dt;
      if(b.lookT<=0 && dist<45){ b.lookT=bcfg('mum','look',9); player.slowT=1.6;
        showMsg('👁 MUMSTROYER GAVE YOU THE LOOK — legs like jelly',1500); }
      if(b.healT<=0){ b.healT=bcfg('mum','heal',4);
        let healed=0;
        for(const o of bots){ if(o!==b&&o.alive&&!o.boss&&o.hp<100&&o.mesh.position.distanceTo(b.mesh.position)<28){ o.hp=Math.min(100,o.hp+20); healed++; } }
        if(healed) feed('💗 <b>MUMSTROYER</b> kissed '+healed+' bots better'); }
    }
  }
  b.cd-=dt;
  if(b.stroyer==='kiara' && grace<=0 && b.cd<=0 && player.alive){
    if(dist<3.4){ b.cd=.55; sfx('knife'); damagePlayer(rand(14,20)*D.dmg, b.name, b.mesh.position); }
    else b.cd=.15;
    return;
  }
  if(grace<=0 && b.cd<=0){
    // WAVE2: pick a target — player-priority (~70%) else nearest other living bot with LOS
    const canPlayer = player.alive && dist<(b.stroyer==='alfie'?75:55) && player.cloakT<=0;
    if(b.stroyer==='alfie' && canPlayer){ b.cd=rand(.7,1.8)*D.cd*b.tier.cd*(b.enraged?.33:1); botFire(b,null); return; }
    let vt=null, target='none';
    if(canPlayer && Math.random()<.7) target='player';
    else {
      let bd=55;
      for(const o of bots){ if(o===b||!o.alive||o.dropping) continue;
        const d2=o.mesh.position.distanceTo(b.mesh.position); if(d2<bd){ bd=d2; vt=o; } }
      if(vt) target='bot'; else if(canPlayer) target='player';
    }
    if(target!=='none'){
      b.cd=rand(.7,1.8)*D.cd*b.tier.cd*(b.enraged?.33:1);
      if(mutator==='knives'){   // 🔪 melee lunge: 15dmg swipe within 3u instead of shooting
        if(target==='player'){ if(dist<3){ sfx('knife'); damagePlayer(15,b.name,b.mesh.position); } else b.cd=Math.min(b.cd,.35); }
        else if(!vt.dropping){ const d2=vt.mesh.position.distanceTo(b.mesh.position);
          if(d2<3){ sfx('knife'); vt.hp-=15; if(vt.hp<=0) botKillBot(vt,b); } else b.cd=Math.min(b.cd,.5); }
      } else botFire(b, target==='bot'?vt:null);
    }
  }
}
// WAVE2: one bot fires one shot — at the player (vt=null) or at another bot
function botFire(b,vt){
  if(vt&&vt.dropping) return;
  const eye=b.mesh.position.clone().setY(2);
  const tp = vt ? vt.mesh.position.clone().setY(1.5) : player.pos.clone().setY(player.pos.y-crouchK*.78);
  const d = eye.distanceTo(tp);
  const pDir=tp.clone().sub(eye).normalize();
  ray.set(eye,pDir); ray.far=d+2;
  const wallHits=ray.intersectObjects(obstacles.map(o=>o.mesh),false);
  if(wallHits.length && wallHits[0].distance<d-1) return;
  const hitChance=clamp((0.55-d*.007)*D.acc*b.tier.acc, .05, .8);
  tracer(eye.clone().add(pDir.clone().multiplyScalar(1)), tp.clone().add(new THREE.Vector3(rand(-1,1),rand(-.5,.8),rand(-1,1))));
  sfx('shot');
  if(Math.random()<hitChance){
    if(vt){ vt.hp-=rand(7,16)*D.dmg*b.tier.dmg*.6; if(vt.hp<=0) botKillBot(vt,b); }
    else damagePlayer(rand(7,16)*D.dmg*b.tier.dmg, b.name, b.mesh.position);
  }
}
// WAVE2: boss rocket — slow, arcing, telegraphed with a red target ring (dodgeable)
const bossRockets=[];
function bossRocket(b){
  const from=b.mesh.position.clone().setY(4.6);
  const to=player.pos.clone(); to.y=0;
  const ring=new THREE.Mesh(new THREE.RingGeometry(WEAPONS.rocket.blast*.82, WEAPONS.rocket.blast, 32),
    new THREE.MeshBasicMaterial({color:0xff2222, transparent:true, opacity:.7, side:THREE.DoubleSide, depthWrite:false}));
  ring.rotation.x=-Math.PI/2; ring.position.set(to.x,.15,to.z); scene.add(ring);
  const m=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,1,8), toonMat({color:0x2a1035, emissive:0xff2266, emissiveIntensity:.8}));
  m.position.copy(from); scene.add(m);
  bossRockets.push({m,ring,from,to,t:0,dur:1.8});
  sfx('rocket');
  feed('☄ <b>DESTRUCTION DEMON</b> fired a rocket — DODGE!');
}
function updateBossRockets(dt,now){
  for(let i=bossRockets.length-1;i>=0;i--){
    const r=bossRockets[i]; r.t+=dt;
    const k=r.t/r.dur;
    r.ring.material.opacity=.35+.35*(.5+.5*Math.sin(now/80));
    if(k>=1){
      explode(r.to.clone().setY(.5), 1, 'DESTRUCTION DEMON');
      scene.remove(r.m); scene.remove(r.ring);
      r.ring.geometry.dispose(); r.ring.material.dispose();
      bossRockets.splice(i,1); continue;
    }
    r.m.position.lerpVectors(r.from,r.to,k);
    r.m.position.y += Math.sin(k*Math.PI)*13;
    r.m.rotation.x += dt*6;
    if(Math.random()<.5) puffSmoke(r.m.position);
  }
}
// ---------- THE STROYER DYNASTY: Destruction Demon ----------
let bossSpawned=false, bossRef=null;
const STROYERS={
  dad:  { name:'DESTRUCTION DEMON', title:'☠ DESTRUCTION DEMON', scale:2.6, hp:2000, speed:9,
          tier:{col:0x2a1035, acc:1.15, dmg:2, cd:.6}, col:0x6b21a8, torso:0x2a1035, chute:0x9b30ff, bonus:40, dad:true },
};
const stroyerState={};
let bossCfg={}; try{ bossCfg=JSON.parse(localStorage.getItem('fr_bosscfg'))||{}; }catch(e){}
function bcfg(key,field,def){ const o=bossCfg[key]; const v=o&&o[field]; return (v===undefined||v===null||v==='')?def:Number(v); }
function saveBossCfg(){ try{ localStorage.setItem('fr_bosscfg', JSON.stringify(bossCfg)); }catch(e){} }
function spawnStroyer(key){
  const cfg=STROYERS[key];
  const b=makeBot(cfg.name);
  b.boss=true; b.stroyer=key; bossRef=b;
  if(key==='dad') bossSpawned=true;
  b.mesh.scale.setScalar(bcfg(key,'scale',cfg.scale));
  const a=rand(0,Math.PI*2), rr=rand(4,Math.min(24,stormR*.3));
  b.mesh.position.set(Math.cos(a)*rr, 62, Math.sin(a)*rr);
  b.hp=b.maxHp=Math.round(bcfg(key,'hp',cfg.hp)*D.dmg);
  b.speed=bcfg(key,'speed',cfg.speed);
  b.burstT=6; b.rocketT=5; b.enraged=false;
  b.tier={...cfg.tier}; b.tier.dmg=bcfg(key,'dmg',cfg.tier.dmg);
  b.col=cfg.col;
  for(const ch of b.mesh.children){
    if(ch.isMesh && ch.geometry===BOTGEO.torso){ ch.material.color.setHex(cfg.torso); break; }
  }
  b.tagCv=document.createElement('canvas'); b.tagCv.width=256; b.tagCv.height=48;
  b.tagTex=new THREE.CanvasTexture(b.tagCv);
  b.tag.material=new THREE.SpriteMaterial({map:b.tagTex, transparent:true});
  b.tag.scale.set(4,.75,1); b.tag.position.y=3.35; b.hpShown=-1;
  if(key==='dad'){
    let headMesh=null, torsoMesh=null;
    for(const ch of b.mesh.children){
      if(ch.isMesh && ch.geometry===BOTGEO.head) headMesh=ch;
      if(ch.isMesh && ch.geometry===BOTGEO.torso) torsoMesh=ch;
    }
    const eyeMat=toonMat({color:0xff2020, emissive:0xff2020, emissiveIntensity:1});
    const eyeGeo=new THREE.BoxGeometry(.09,.09,.05);
    const eyeL=new THREE.Mesh(eyeGeo,eyeMat); eyeL.position.set(-.13,.02,.29); headMesh.add(eyeL);
    const eyeR=new THREE.Mesh(eyeGeo,eyeMat); eyeR.position.set(.13,.02,.29); headMesh.add(eyeR);
    const hornMat=toonMat({color:0x1a0a12});
    const hornGeo=new THREE.ConeGeometry(.09,.32,6);
    const hornL=new THREE.Mesh(hornGeo,hornMat); hornL.position.set(-.18,.32,-.05); hornL.rotation.z=.35; headMesh.add(hornL);
    const hornR=new THREE.Mesh(hornGeo,hornMat); hornR.position.set(.18,.32,-.05); hornR.rotation.z=-.35; headMesh.add(hornR);
    const spikeMat=toonMat({color:0x2a1035});
    const spikeGeo=new THREE.ConeGeometry(.14,.5,6);
    const spikeL=new THREE.Mesh(spikeGeo,spikeMat); spikeL.position.set(-.55,.5,0); spikeL.rotation.z=.5; b.mesh.add(spikeL);
    const spikeR=new THREE.Mesh(spikeGeo,spikeMat); spikeR.position.set(.55,.5,0); spikeR.rotation.z=-.5; b.mesh.add(spikeR);
    const cape=new THREE.Mesh(new THREE.PlaneGeometry(1.3,1.6,3,4), toonMat({color:0x1a0a12, side:THREE.DoubleSide}));
    cape.position.set(0,1.3,-.28); cape.rotation.x=-.15; b.mesh.add(cape);
    if(torsoMesh){ torsoMesh.material.emissive.setHex(0x4a0a5a); torsoMesh.material.emissiveIntensity=.35; }
  }
  const chute=new THREE.Mesh(new THREE.ConeGeometry(2.4,1.8,10,1,true), toonMat({color:cfg.chute, side:THREE.DoubleSide}));
  chute.position.y=3.6; b.mesh.add(chute); b.chute=chute; b.dropping=true;
  bots.push(b); updateAlive();
  showMsg(cfg.title+'<br><small>INBOUND — LOOK UP</small>',2600); sfx('horn');
  announce('g80_bossin',.95,600,true);
  feed('☠ <b>'+cfg.name+'</b> is dropping in!');
  return b;
}
const slimes=[];
function throwSlime(b){
  const m=new THREE.Mesh(new THREE.SphereGeometry(.55,10,10), toonMat({color:0x7CFC00, emissive:0x39FF14, emissiveIntensity:.4}));
  const from=b.mesh.position.clone().setY(2.2);
  m.position.copy(from); scene.add(m);
  slimes.push({m, from, to:player.pos.clone().setY(.4), t:0, dur:.9});
}
function updateSlimes(dt){
  for(let i=slimes.length-1;i>=0;i--){
    const sl=slimes[i]; sl.t+=dt;
    const k=Math.min(1,sl.t/sl.dur);
    sl.m.position.lerpVectors(sl.from,sl.to,k);
    sl.m.position.y+=Math.sin(k*Math.PI)*6;
    sl.m.rotation.x+=dt*5;
    if(k>=1){
      if(player.alive && player.pos.distanceTo(sl.to)<4){
        player.slimeT=2.5;
        showMsg('🟢 SLIMED! Wading through baby goo…',1400);
        $('dmgVign').style.boxShadow='inset 0 0 120px rgba(80,255,20,.45)';
        setTimeout(()=>$('dmgVign').style.boxShadow='inset 0 0 120px rgba(255,0,0,0)',700);
      }
      voxelBurst({x:sl.to.x, z:sl.to.z}, 0x7CFC00, 0x39FF14);
      scene.remove(sl.m); slimes.splice(i,1);
    }
  }
}
const blankets=[];
function throwBlanket(b){
  const m=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.8,4,3), toonMat({color:0x7cd7ff, side:THREE.DoubleSide}));
  const from=b.mesh.position.clone().setY(2.6);
  m.position.copy(from); scene.add(m);
  blankets.push({m, from, to:player.pos.clone().setY(.6), t:0, dur:1.0});
  feed('🛏 <b>'+b.name+'</b> hurled the BLANKET OF DOOM — run!');
}
function updateBlankets(dt){
  for(let i=blankets.length-1;i>=0;i--){
    const bl=blankets[i]; bl.t+=dt;
    const k=Math.min(1,bl.t/bl.dur);
    bl.m.position.lerpVectors(bl.from,bl.to,k);
    bl.m.position.y+=Math.sin(k*Math.PI)*8;
    bl.m.rotation.x+=dt*4; bl.m.rotation.y+=dt*6;
    if(k>=1){
      explode(bl.to.clone().setY(.6), 1, 'ALFIESTROYER');
      scene.remove(bl.m); blankets.splice(i,1);
    }
  }
}
function spawnBoss(){ spawnStroyer('dad'); }
// director: Dad drops at phase-2 (storm trigger)
function stroyerDirector(dt){
  if(!running||gameOver) return;
  if(player.slowT>0) player.slowT-=dt;
  if(player.slimeT>0) player.slimeT-=dt;
  updateSlimes(dt);
  updateBlankets(dt);
}
// WAVE2: boss HUD health strip (top of screen while he lives)
function updateBossBar(){
  if(!bossRef){
    // pre-arrival countdown: time until phase-2 shrink begins
    if(running && !gameOver){
      let eta=0, label='';
      if(!bossSpawned && bcfg('dad','off',0)!==1){
        label='☠ DESTRUCTION DEMON';
        if(phaseIx===0) eta = (shrinking ? (stormR-100)/(stormPhases[0].rate*10) : phaseTimer + (stormR-100)/(stormPhases[0].rate*10) + stormPhases[1].wait)
                          + (shrinking ? stormPhases[1].wait : 0);
        else if(phaseIx===1 && !shrinking) eta = phaseTimer;
      }
      eta = Math.max(0, Math.ceil(eta));
      const el=$('bossEta');
      if(eta>0){
        el.style.display='block';
        el.textContent=label+': '+Math.floor(eta/60)+':'+String(eta%60).padStart(2,'0');
        el.style.color = eta<=10 ? '#ff5a5a' : '#e0b3ff';
      } else el.style.display='none';
    }
    return;
  }
  $('bossEta').style.display='none';
  const w=$('bossBarWrap');
  if(bossRef.alive){
    if(w.style.display!=='block') w.style.display='block';
    $('bossBarFill').style.width=clamp(bossRef.hp/bossRef.maxHp*100,0,100)+'%';
    if(bossRef.enraged && !w.__rage){ w.__rage=true; $('bossBarFill').style.background='linear-gradient(90deg,#ff4444,#ff9d00)'; }
  } else { w.style.display='none'; bossRef=bots.find(o=>o.boss&&o.alive)||null; }
}

const hitPool=[];
function hitDirIndicator(srcPos){
  const dx=srcPos.x-player.pos.x, dz=srcPos.z-player.pos.z;
  const rel=Math.atan2(dx,dz)-player.yaw-Math.PI;
  const deg=-rel*180/Math.PI;
  let el=hitPool.find(e=>!e.busy);
  if(!el){
    const d=document.createElement('div');
    d.style.cssText='position:fixed;left:50%;top:50%;width:0;height:0;pointer-events:none;z-index:38;';
    d.innerHTML='<div style="position:absolute;left:-45px;top:-150px;width:90px;height:26px;border-radius:50% 50% 0 0/100% 100% 0 0;background:radial-gradient(ellipse at 50% 100%, rgba(255,30,30,.95), rgba(255,30,30,0) 72%);"></div>';
    document.body.appendChild(d);
    el={div:d,busy:false,t:null}; hitPool.push(el);
  }
  el.busy=true; clearTimeout(el.t);
  el.div.style.transform='rotate('+deg+'deg)';
  el.div.style.transition='none'; el.div.style.opacity='1'; el.div.style.display='block';
  requestAnimationFrame(()=>{ el.div.style.transition='opacity .8s'; el.div.style.opacity='0'; });
  el.t=setTimeout(()=>{ el.busy=false; el.div.style.display='none'; },850);
}
function damagePlayer(d,from,srcPos){
  if(!player.alive) return;
  if(cheats.god) return;   // IDDQD
  if(grace>0 && from!=='the Storm') return;
  player.lastHitT=performance.now();
  sfx('hurt');
  if(srcPos) hitDirIndicator(srcPos);
  if(player.shield>0){
    const absorbed=Math.min(player.shield,d);
    player.shield-=absorbed; d-=absorbed;
    if(player.shield<=0){ player.shield=0; showMsg('🛡 SHIELD DOWN!',900); }
  }
  if(d>0) player.hp-=d;
  $('dmgVign').style.boxShadow='inset 0 0 70px rgba(255,0,0,.28)';
  setTimeout(()=>$('dmgVign').style.boxShadow='inset 0 0 120px rgba(255,0,0,0)',160);
  updateBars();
  if(player.hp<=0){ player.hp=0; lose(from); }
}
function updateBars(){
  const mh=player.maxHp||100;
  $('healthFill').style.width=clamp(player.hp/mh*100,0,100)+'%';
  $('shieldFill').style.width=clamp(player.shield,0,100)+'%';
  $('hpNum').textContent=Math.ceil(clamp(player.hp,0,mh))+'/'+mh;
  $('shNum').textContent=Math.ceil(clamp(player.shield,0,100));
}
function collides(p,r,feet=0){
  if(Math.hypot(p.x,p.z)>MAP+4) return true;
  for(const o of obstacles){
    // WAVE2: min.y check — obstacles fully above head height (upper tower floors) don't block you
    if(p.x>o.min.x-r&&p.x<o.max.x+r&&p.z>o.min.z-r&&p.z<o.max.z+r&&o.max.y>feet+.68&&o.min.y<feet+1.9) return true;
  }
  return false;
}
// find open ground near (x,z): spiral out until nothing collides (spawn safety)
function findFreeSpot(x,z,r=1.2){
  const P=new THREE.Vector3(x,EYE,z);
  if(!collides(P,r,0)) return {x,z};
  for(let rad=2; rad<=26; rad+=2){
    for(let a=0; a<Math.PI*2; a+=Math.PI/6){
      P.set(x+Math.cos(a)*rad, EYE, z+Math.sin(a)*rad);
      if(Math.hypot(P.x,P.z)<MAP-4 && !collides(P,r,0)) return {x:P.x, z:P.z};
    }
  }
  return {x:0,z:0};
}
// highest obstacle top the player can stand on (enables walkable ramps)
function supportH(p,r){
  let h=0; const feet=p.y-EYE;
  for(const o of obstacles){
    if(p.x>o.min.x-r&&p.x<o.max.x+r&&p.z>o.min.z-r&&p.z<o.max.z+r&&o.max.y<=feet+.68&&o.max.y>h) h=o.max.y;
  }
  return h;
}

// ---------- leaderboard (Supabase REST, public anon) ----------
const SB_URL = 'https://plgevbegebmujewmqoab.supabase.co', SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsZ2V2YmVnZWJtdWpld21xb2FiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NTgwOTQsImV4cCI6MjA5MjMzNDA5NH0.4qMc1o2XJiVmO4XzF8De82MqQ1h4fMGkHBC77WruzzA';
async function submitScore(win, tag){
  if(cheated) return;   // 🏴‍☠️ cheater runs never touch the leaderboard
  try { await fetch(SB_URL+'/rest/v1/fr_scores', { method:'POST',
    headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Content-Type':'application/json','Prefer':'return=minimal'},
    body: JSON.stringify({name:player.name, kills:player.kills, win, diff:D.name, bots:bots.length,
      shots:stats.shots, hits:stats.hits, headshots:stats.headshots, dmg:stats.dmg, chests:stats.chests,
      time_s: Math.round((performance.now()-startedAt)/1000), bonus:stats.bonus, streak_best:stats.streakBest,
      tag: tag||null}) }); } catch(e) {}
}
async function fetchTop(n=10){
  try {
    const r = await fetch(SB_URL+'/rest/v1/fr_scores?select=name,tag,kills,win,diff,shots,hits,headshots,dmg,chests,time_s,bonus,streak_best,created_at&order=created_at.desc&limit=400',
      { headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY} });
    return await r.json();
  } catch(e) { return []; }
}
function diffMult(d){ d=(d||'').toUpperCase(); if(d.startsWith('PIECE'))return 1; if(d.startsWith("LET"))return 1.5; if(d.startsWith('COME'))return 2; if(d.startsWith('DAMN'))return 3; return 1; }
function gscore(r){ const m=diffMult(r.diff); return Math.round((r.kills||0)*m + (r.win?10*m:0) + (r.bonus||0)); }
function diffBadge(d){ d=(d||'').toUpperCase(); if(d.startsWith('PIECE'))return '🍰'; if(d.startsWith("LET"))return '🎸'; if(d.startsWith('COME'))return '💀'; if(d.startsWith('DAMN'))return '☠️'; return '·'; }

// ---------- WAVE3: real multiplayer via Supabase Realtime (2-4 friends; host stays authoritative for bots/boss/storm) ----------
let mpChannel=null, mpIsHost=true, mpRoomCode=null, mpPlayerId=null, mpLastSend=0, mpLastHostSend=0;
const netPlayers={};   // id -> networked friend avatar (built from makeBot, driven by broadcasts instead of AI)
function mpGenRoomCode(){ const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s=''; for(let i=0;i<5;i++) s+=A[Math.floor(Math.random()*A.length)]; return s; }
function mpUpdatePlayBtn(){   // WAVE3: only the party leader may start the match
  const waiting = !!mpChannel && !mpIsHost;
  $('playBtn').style.display = waiting ? 'none' : 'block';
  $('mpWaitMsg').style.display = waiting ? 'block' : 'none';
}
function mpLeaveRoom(){
  if(mpChannel){ try{ mpChannel.unsubscribe(); }catch(e){} mpChannel=null; }
  for(const id in netPlayers){ scene.remove(netPlayers[id].mesh); delete netPlayers[id]; }
  mpRoomCode=null; mpIsHost=true; mpPlayerId=null;
  mpUpdatePlayBtn();
}
function mpJoinRoom(code, asHost){
  if(!window.supabase){ showMsg('❌ Multiplayer unavailable — could not load networking library',1800); return; }
  mpLeaveRoom();
  mpRoomCode=code; mpIsHost=asHost; mpPlayerId=Math.random().toString(36).slice(2,10);
  const sb=window.supabase.createClient(SB_URL, SB_KEY);
  const ch=sb.channel('fr-room-'+code, {config:{presence:{key:mpPlayerId}}});
  ch.on('presence',{event:'sync'},()=>mpSyncPresence(ch));
  ch.on('broadcast',{event:'state'},({payload})=>{ if(payload.id!==mpPlayerId) mpApplyPlayerState(payload); });
  ch.on('broadcast',{event:'host'},({payload})=>{ if(!mpIsHost) mpApplyHostState(payload); });
  ch.on('broadcast',{event:'start'},({payload})=>{ if(!mpIsHost) beginMatch(payload); });
  ch.subscribe(async (status)=>{
    if(status==='SUBSCRIBED'){
      await ch.track({name:(players[activeP]&&players[activeP].name)||'Player', host:mpIsHost, outfit:currentOutfit});
      $('mpStatus').textContent = asHost ? '🌐 Room '+code+' — waiting for friends…' : '🌐 Joined room '+code;
      showMsg(asHost ? '🌐 ROOM '+code+' CREATED — share the code!' : '🌐 JOINED ROOM '+code, 2200);
      mpUpdatePlayBtn();
    } else if(status==='CHANNEL_ERROR' || status==='TIMED_OUT'){
      $('mpStatus').textContent='❌ Connection failed — try again';
    }
  });
  mpChannel=ch;
}
function mpSyncPresence(ch){
  const state=ch.presenceState();
  const seen=new Set();
  let n=0;
  for(const key in state){
    n++;
    if(key===mpPlayerId) continue;
    seen.add(key);
    if(!netPlayers[key]){
      const meta=state[key][0]||{};
      netPlayers[key]=mpMakeNetPlayer(key, meta.name||'Friend', meta.outfit);
    }
  }
  for(const id in netPlayers){ if(!seen.has(id)) mpRemoveNetPlayer(id); }
  const st=$('mpStatus'); if(st) st.textContent = '🌐 Room '+mpRoomCode+' — '+n+' player'+(n===1?'':'s')+' connected';
}
function mpMakeNetPlayer(id,name,outfit){
  const b=makeBot(name,outfit);
  const np={id,name,mesh:b.mesh,head:b.head,body:b.body,tag:b.tag,tagCv:b.tagCv,tagTex:b.tagTex,hpShown:-1,col:b.col,
    tx:b.mesh.position.x,ty:0,tz:b.mesh.position.z,tyaw:0,alive:true,swing:0,phase:rand(0,6),
    legL:b.legL,legR:b.legR,armL:b.armL,armR:b.armR,moving:false,hp:100,maxHp:100,boss:false};
  drawTag(np);   // WAVE3: friends never had their nametag sprite drawn at all — render it once up front
  return np;
}
function mpRemoveNetPlayer(id){
  if(netPlayers[id]){ scene.remove(netPlayers[id].mesh); delete netPlayers[id]; }
}
function mpApplyPlayerState(p){
  const np=netPlayers[p.id]; if(!np) return;
  np.tx=p.x; np.ty=p.y; np.tz=p.z; np.tyaw=p.yaw; np.alive=p.alive; np.moving=p.moving;
}
function mpUpdateNetPlayers(dt){
  for(const id in netPlayers){
    const np=netPlayers[id];
    np.mesh.position.x+=(np.tx-np.mesh.position.x)*Math.min(1,dt*12);
    np.mesh.position.y+=(np.ty-np.mesh.position.y)*Math.min(1,dt*12);
    np.mesh.position.z+=(np.tz-np.mesh.position.z)*Math.min(1,dt*12);
    const cy=np.mesh.rotation.y;
    np.mesh.rotation.y = cy + Math.atan2(Math.sin(np.tyaw-cy), Math.cos(np.tyaw-cy))*Math.min(1,dt*12);
    np.mesh.visible = np.alive;
    if(np.moving){ np.phase+=dt*8*1.35; np.swing=Math.min(1,np.swing+dt*6); } else np.swing=Math.max(0,np.swing-dt*6);
    const sw=Math.sin(np.phase)*.62*np.swing;
    np.legL.rotation.x=sw; np.legR.rotation.x=-sw; np.armL.rotation.x=-sw*.85; np.armR.rotation.x=sw*.85;
  }
}
let mpFacingYaw=0;   // WAVE3: friends should see you turn to face where you're walking, not where you're aiming
function mpBroadcastState(now){
  if(!mpChannel || now-mpLastSend<80) return;   // ~12Hz
  mpLastSend=now;
  const moveSpd=Math.hypot(player.vel.x,player.vel.z);
  if(moveSpd>.3) mpFacingYaw=Math.atan2(player.vel.x,player.vel.z);
  mpChannel.send({type:'broadcast', event:'state', payload:{
    id:mpPlayerId, x:player.pos.x, y:player.pos.y-EYE, z:player.pos.z, yaw:mpFacingYaw, alive:player.alive,
    moving: moveSpd>.3 }});
}
function mpBroadcastHostState(now){
  if(!mpChannel || !mpIsHost || now-mpLastHostSend<130) return;   // ~7-8Hz
  mpLastHostSend=now;
  mpChannel.send({type:'broadcast', event:'host', payload:{
    bots: bots.map(b=>({name:b.name, x:b.mesh.position.x, z:b.mesh.position.z, ry:b.mesh.rotation.y,
      hp:b.hp, maxHp:b.maxHp||100, alive:b.alive, boss:!!b.boss, scale:b.mesh.scale.x, moving:!!b.moving})),
    storm:{stormR,stormTarget,stormShrinkRate,phaseIx,phaseTimer,shrinking,bossSpawned} }});
}
function mpApplyHostState(msg){
  if(msg.storm){
    stormR=msg.storm.stormR; stormTarget=msg.storm.stormTarget; stormShrinkRate=msg.storm.stormShrinkRate;
    phaseIx=msg.storm.phaseIx; phaseTimer=msg.storm.phaseTimer; shrinking=msg.storm.shrinking; bossSpawned=msg.storm.bossSpawned;
  }
  if(msg.bots){
    for(let i=0;i<msg.bots.length;i++){
      const rec=msg.bots[i];
      let b=bots[i];
      if(!b){ b=makeBot(rec.name); b.mesh.scale.setScalar(rec.scale||1); if(rec.boss){ b.boss=true; bossRef=b; } bots[i]=b; }
      b.mesh.position.set(rec.x,0,rec.z); b.mesh.rotation.y=rec.ry; b.maxHp=rec.maxHp; b.moving=rec.moving;
      if(b.alive && !rec.alive && b.mesh.parent){ feed(`💀 <b>${b.name}</b> was eliminated`); voxelBurst(b.mesh.position, b.col); scene.remove(b.mesh); }
      b.hp=rec.hp; b.alive=rec.alive;
    }
    updateAlive();
  }
}
function lbHtml(rows){
  if(!rows.length) return 'No champions yet — be the first!';
  // career cards for local player profiles
  const names = players.map(p=>p.name.toLowerCase());
  const career = {};
  rows.forEach(r=>{ const k=(r.name||'').toLowerCase(); if(!names.includes(k)) return;
    const c = career[k] = career[k]||{name:r.name,games:0,kills:0,wins:0,shots:0,hits:0,hs:0,dmg:0,score:0};
    c.games++; c.kills+=r.kills||0; c.wins+=r.win?1:0; c.shots+=r.shots||0; c.hits+=r.hits||0; c.hs+=r.headshots||0; c.dmg+=r.dmg||0; c.score+=gscore(r); });
  let html = '<div style="font-weight:900; color:#ffe27a; font-size:13px; margin-bottom:6px;">👑 CAREER TOTALS — all games combined</div>';
  html += '<div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:12px;">';
  Object.values(career).sort((a,b)=>b.score-a.score).forEach(c=>{
    const acc = c.shots?Math.round(100*c.hits/c.shots):0;
    html += `<div style="flex:1; min-width:120px; background:rgba(255,233,59,.08); border:2px solid rgba(255,233,59,.4); border-radius:12px; padding:10px 12px;">
      <div style="font-weight:900; color:#ffe27a; font-size:15px;">${c.name}</div>
      <div style="font-size:11.5px; line-height:1.7; color:#e8e2ff;">🏆 <b>${c.score}</b> career pts<br>💀 ${c.kills} elims · 👑 ${c.wins} wins<br>🎯 ${acc}% acc · ${c.hs} hs<br>🎮 ${c.games} games</div></div>`;
  });
  html += '</div>';
  // scrollable top-30 individual games by weighted score
  html += '<div style="font-weight:900; color:#6fd4ff; font-size:13px; margin:8px 0 4px;">🎯 BEST SINGLE GAMES — one row = one game</div>';
  const medals=['🥇','🥈','🥉'];
  const top = rows.slice().sort((a,b)=>gscore(b)-gscore(a)).slice(0,30);
  html += '<div style="max-height:260px; overflow-y:auto; padding-right:6px;">' + top.map((r,i)=>{
    const acc = r.shots ? Math.round(100*r.hits/r.shots) : 0;
    const tg = r.tag ? `<span style="color:#ffd34d; font-family:monospace;">[${(''+r.tag).slice(0,3)}]</span> ` : '';
    return `${medals[i]||('&nbsp;'+(i+1)+'.')} ${tg}<b>${(r.name||'?').slice(0,14)}</b> — <b style="color:#ffe27a">${gscore(r)} pts</b> ${diffBadge(r.diff)} ${(r.diff||'').split(' ')[0]} <small style="color:#9f95d6">${r.kills} elims ${r.win?'👑':''} ${r.bonus?('+'+r.bonus+' streak'):''} · ${acc}% acc · ${r.headshots||0} hs</small>`;
  }).join('<br>') + '</div>';
  return html;
}
function playerDossier(rows, q){
  q=q.trim().toLowerCase(); if(!q) return '';
  const mine = rows.filter(r=>(r.name||'').toLowerCase().includes(q));
  if(!mine.length) return `<div style="color:#ff8a8a">No player matching “${q}”.</div>`;
  const byName = {};
  mine.forEach(r=>{ (byName[(r.name||'?')]=byName[(r.name||'?')]||[]).push(r); });
  return Object.entries(byName).map(([nm,rs])=>{
    const t={g:rs.length,k:0,w:0,sh:0,hi:0,hs:0,dm:0,ch:0,ti:0,bs:0,best:0,bo:0};
    const perDiff={};
    let first=rs[rs.length-1].created_at;
    rs.forEach(r=>{ t.k+=r.kills||0; t.w+=r.win?1:0; t.sh+=r.shots||0; t.hi+=r.hits||0; t.hs+=r.headshots||0;
      t.dm+=r.dmg||0; t.ch+=r.chests||0; t.ti+=r.time_s||0; t.bo+=r.bonus||0;
      t.bs=Math.max(t.bs,r.streak_best||0); t.best=Math.max(t.best,gscore(r));
      const dk=diffBadge(r.diff); perDiff[dk]=(perDiff[dk]||0)+1;
      if(r.created_at<first) first=r.created_at; });
    const acc=t.sh?Math.round(100*t.hi/t.sh):0;
    return `<div style="background:rgba(40,167,255,.1); border:2px solid rgba(40,167,255,.5); border-radius:12px; padding:12px 16px; margin-bottom:10px;">
      <div style="font-weight:900; color:#6fd4ff; font-size:17px;">🔎 ${nm} — career dossier</div>
      <div style="font-size:12.5px; line-height:1.9; color:#e8e2ff;">
      🎮 ${t.g} games since ${new Date(first).toLocaleDateString()} · ⏱ ${Math.round(t.ti/60)} min in the arena<br>
      💀 ${t.k} elims · 👑 ${t.w} wins · 🏆 best game ${t.best} pts · 🔥 best streak ${t.bs}<br>
      🎯 ${acc}% career accuracy (${t.hi}/${t.sh}) · ${t.hs} headshots · 💥 ${t.dm} damage<br>
      📦 ${t.ch} chests · ➕ ${t.bo} streak bonus pts<br>
      Modes: ${Object.entries(perDiff).map(([b,n])=>b+'×'+n).join(' · ')}</div></div>`;
  }).join('');
}
let lbRows=[];
$('lbSearch').addEventListener('input', ()=>{ $('lbDossier').innerHTML = playerDossier(lbRows, $('lbSearch').value); });
$('lbBtn').onclick = async ()=>{ $('lbOverlay').style.display='flex'; $('lbList').innerHTML='loading…'; lbRows = await fetchTop(400); $('lbList').innerHTML = lbHtml(lbRows); $('lbDossier').innerHTML=''; $('lbSearch').value=''; };

// ---------- cheat codes ----------
let cheated=false, cheatBuf='';
let gravMult=1, jumpMult=1;
const cheats={god:false, bighead:false, moon:false};
const cheatNames=[];
const pendingCheats=[];   // IDKFA/HANSOLO typed in lobby apply after invReset at match start
function cheatJingle(){ try{
  ac = ac||new AC();
  const t=ac.currentTime;
  [[392,0],[523,.09],[784,.18]].forEach(([f,d])=>{
    const o=ac.createOscillator(), g=ac.createGain();
    o.type='square'; o.frequency.value=f; o.connect(g); g.connect(ac.destination);
    g.gain.setValueAtTime(.1,t+d); g.gain.exponentialRampToValueAtTime(.001,t+d+.22);
    o.start(t+d); o.stop(t+d+.24);
  });
}catch(e){} }
function victoryJingle(){ try{
  ac = ac||new AC();
  const t=ac.currentTime;
  [[523,0],[659,.12],[784,.24],[1047,.36],[784,.52],[1047,.64]].forEach(([f,d])=>{
    const o=ac.createOscillator(), g=ac.createGain();
    o.type='triangle'; o.frequency.value=f; o.connect(g); g.connect(ac.destination);
    g.gain.setValueAtTime(.13,t+d); g.gain.exponentialRampToValueAtTime(.001,t+d+.3);
    o.start(t+d); o.stop(t+d+.32);
  });
}catch(e){} }
let cheatToastTO=0;
function cheatToast(txt){
  const d=$('cheatToast');
  d.textContent=txt; d.style.display='block';
  d.style.animation='none'; void d.offsetWidth; d.style.animation='cheatPop 2.4s forwards';
  clearTimeout(cheatToastTO); cheatToastTO=setTimeout(()=>{ d.style.display='none'; },2400);
}
function markCheat(nm){ if(!cheatNames.includes(nm)) cheatNames.push(nm); }
function applyArsenal(){
  const mk=k=>({key:k, ammo:magSize(WEAPONS[k]), res:resMax(WEAPONS[k])*2, rarity:4});
  inv=[mk('rifle'), mk('sniper'), mk('rocket'), null, null];
  activeSlot=0; woodCount=999; updateWood(); renderSlots(); buildViewmodel();
}
function applyHanSolo(){ giveWeapon('deagle',4); giveWeapon('deagle',4); }
function activateCheat(code){
  if(code==='IDDQD'){ if(cheats.god) return; cheats.god=true; cheated=true; markCheat('GOD'); cheatToast('★ CHEAT ACTIVATED: GOD MODE ★'); }
  else if(code==='IDKFA'){ cheated=true; markCheat('ARSENAL'); if(running) applyArsenal(); else if(!pendingCheats.includes(applyArsenal)) pendingCheats.push(applyArsenal); cheatToast('★ CHEAT ACTIVATED: FULL ARSENAL ★'); }
  else if(code==='BIGHEAD'){ if(cheats.bighead) return; cheats.bighead=true; markCheat('BIGHEAD'); for(const b of bots) b.head.scale.setScalar(2.2); cheatToast('★ CHEAT ACTIVATED: BIG HEAD MODE ★'); }
  else if(code==='MOONMAN'){ if(cheats.moon) return; cheats.moon=true; cheated=true; markCheat('MOON'); gravMult=.5; jumpMult=1.5; cheatToast('★ CHEAT ACTIVATED: MOON GRAVITY ★'); }
  else if(code==='HANSOLO'){ cheated=true; markCheat('HANSOLO'); if(running) applyHanSolo(); else if(!pendingCheats.includes(applyHanSolo)) pendingCheats.push(applyHanSolo); cheatToast('★ CHEAT ACTIVATED: GOLDEN DEAGLES ★'); }
  else return;
  cheatJingle();
}
addEventListener('keydown', e=>{
  const tg=e.target;
  if(tg && (tg.tagName==='INPUT'||tg.tagName==='TEXTAREA'||tg.tagName==='SELECT'||tg.isContentEditable)) return;
  if(hsOpen) return;                            // don't fire cheats while typing initials
  if(!/^[a-zA-Z]$/.test(e.key)) return;
  cheatBuf=(cheatBuf+e.key.toUpperCase()).slice(-10);
  for(const c of ['IDDQD','IDKFA','BIGHEAD','MOONMAN','HANSOLO'])
    if(cheatBuf.endsWith(c)){ activateCheat(c); cheatBuf=''; break; }
});
// KONAMI code on the login screen: ↑↑↓↓←→←→BA bypasses the password
const KONAMI=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konIx=0;
addEventListener('keydown', e=>{
  if($('loginOverlay').style.display==='none') return;
  const k=e.key.length===1 ? e.key.toLowerCase() : e.key;
  if(k===KONAMI[konIx]){
    konIx++;
    if(konIx>=KONAMI.length){
      konIx=0;
      // bypass: log in the last-logged-in profile, or the first one if none remembered
      let saved=null; try{ saved=localStorage.getItem('fr_login'); }catch(e){}
      const ix = saved!=null ? players.findIndex(p=>p.name===saved) : -1;
      loginSel = ix>=0 ? ix : 0;
      completeLogin();
      cheatToast('⭐ 30 LIVES!'); cheatJingle();
    }
  } else konIx = (k===KONAMI[0]) ? 1 : 0;
});

// ---------- arcade high-score initials ----------
let hsOpen=false, hsResolve=null, hsIx=0;
const hsVals=['A','A','A'];
function hsRender(){
  for(let i=0;i<3;i++){ const el=$('hsL'+i); el.textContent=hsVals[i]; el.classList.toggle('hsCur', i===hsIx); }
}
function hsSet(ch){ hsVals[hsIx]=ch; hsIx=Math.min(2,hsIx+1); hsRender(); }
function hsCycle(d){ hsVals[hsIx]=String.fromCharCode(65+((hsVals[hsIx].charCodeAt(0)-65+d+26)%26)); hsRender(); }
function hsClose(tag){
  if(!hsOpen) return;
  hsOpen=false; $('hsPanel').style.display='none';
  const r=hsResolve; hsResolve=null; if(r) r(tag);
}
function hsKey(e){
  if(e.key==='ArrowLeft'){ hsIx=(hsIx+2)%3; hsRender(); }
  else if(e.key==='ArrowRight'){ hsIx=(hsIx+1)%3; hsRender(); }
  else if(e.key==='ArrowUp') hsCycle(1);
  else if(e.key==='ArrowDown') hsCycle(-1);
  else if(/^[a-zA-Z]$/.test(e.key)) hsSet(e.key.toUpperCase());
  else if(e.key==='Backspace'){ hsIx=(hsIx+2)%3; hsRender(); }
  else if(e.key==='Enter') hsClose(hsVals.join(''));
  else if(e.key==='Escape') hsClose(null);
  e.preventDefault();
}
function promptInitials(score){
  return new Promise(res=>{
    hsResolve=res; hsOpen=true; hsIx=0;
    const nm=(player.name||'AAA').toUpperCase().replace(/[^A-Z]/g,'');
    for(let i=0;i<3;i++) hsVals[i]=nm[i]||'A';
    $('hsScore').textContent='SCORE '+score+' — TOP 30 ALL-TIME!';
    hsRender(); $('hsPanel').style.display='flex';
    victoryJingle();
  });
}
{ // build the on-screen A-Z pad + wire slot arrows (touch friendly)
  const grid=$('hsLetters');
  for(let i=0;i<26;i++){
    const b=document.createElement('button'); b.textContent=String.fromCharCode(65+i);
    b.onclick=()=>hsSet(b.textContent);
    grid.appendChild(b);
  }
  $('hsDone').onclick=()=>hsClose(hsVals.join(''));
  $('hsSkip').onclick=()=>hsClose(null);
  for(let i=0;i<3;i++){
    const ii=i;
    $('hsUp'+i).onclick=()=>{ hsIx=ii; hsCycle(1); };
    $('hsDn'+i).onclick=()=>{ hsIx=ii; hsCycle(-1); };
    $('hsL'+i).onclick=()=>{ hsIx=ii; hsRender(); };
  }
}
function runScore(winFlag){ const m=diffMult(D.name); return Math.round(player.kills*m + (winFlag?10*m:0) + (stats.bonus||0)); }
const lastRun={name:'', score:0, tag:null, submitted:false};
async function finishRun(winFlag){
  if(cheated) return;                       // no submit, no initials — cheater banner shown on end screen
  let tag=null;
  const my=runScore(winFlag);
  try{
    const rows=await fetchTop(400);
    const top=rows.map(gscore).sort((a,b)=>b-a);
    if(my>0 && (top.length<30 || my>top[29])) tag=await promptInitials(my);
  }catch(e){}
  lastRun.name=player.name; lastRun.score=my; lastRun.tag=tag;
  await submitScore(winFlag, tag);
  lastRun.submitted=true;
}
// end-screen leaderboard: top 100, auto-scroll + arcade-blink your own row
function endLbRender(rows){
  if(!rows.length){ $('endLb').innerHTML='<b style="color:#ffe27a">🏆 HALL OF FAME</b><br>No champions yet — be the first!'; return; }
  const sorted=rows.slice().sort((a,b)=>gscore(b)-gscore(a));
  let mineIx=-1;
  if(lastRun.submitted){
    let newest=null;
    for(const r of rows){
      if((r.name||'')===lastRun.name && gscore(r)===lastRun.score && (!newest || (r.created_at||'')>(newest.created_at||''))) newest=r;
    }
    if(newest) mineIx=sorted.indexOf(newest);
  }
  const medals=['🥇','🥈','🥉'];
  const row=(r,i)=>{
    const me = i===mineIx;
    const tg = r.tag ? `<span style="color:#ffd34d; font-family:monospace;">[${(''+r.tag).slice(0,3)}]</span> ` : '';
    return `<div${me?' id="myScoreRow" class="meRow"':''} style="padding:1px 8px;">${medals[i]||((i+1)+'.')} ${tg}<b>${(r.name||'?').slice(0,14)}</b> — <b style="color:#ffe27a">${gscore(r)} pts</b> ${diffBadge(r.diff)} <small style="color:#9f95d6">${r.kills||0} elims ${r.win?'👑':''} ${r.headshots||0} hs</small></div>`;
  };
  let html=sorted.slice(0,100).map(row).join('');
  if(mineIx>=100) html+='<div style="text-align:center; color:#9f95d6;">···</div>'+row(sorted[mineIx], mineIx);
  $('endLb').innerHTML=`<b style="color:#ffe27a">🏆 HALL OF FAME — TOP 100</b><div id="endLbScroll" style="position:relative; max-height:36vh; overflow-y:auto; margin-top:6px; padding-right:8px;">${html}</div>`;
  const sc=$('endLbScroll'), my=$('myScoreRow');
  if(sc&&my) setTimeout(()=>{ sc.scrollTop = my.offsetTop - sc.clientHeight/2 + my.offsetHeight/2; },60);
}

// ---------- game state ----------
let running=false, gameOver=false, startedAt=0, grace=0, paused=false;
// spectate mode (on death while bots remain)
let spectating=false, specStart=0, specAngle=0, deathTitle='', deathStats='', submitP=null;
function showMsg(txt,ms=2200){ const m=$('msg'); m.innerHTML=txt; m.style.opacity=1; setTimeout(()=>m.style.opacity=0,ms); }
function startSpectate(){
  spectating=true; inKart=false; curKart=null;
  adsHeld=false; $('scope').style.display='none';
  gunGroup.visible=false;
  $('interact').style.opacity=0;
  if(isTouch) $('btnE').style.display='none';
  specStart=performance.now();
  specAngle=Math.atan2(player.pos.z||1, player.pos.x||1);
  $('specBanner').style.display='block';
  document.exitPointerLock();
}
// ---------- WAVE2: kill-cam — 2.5s frozen-world orbit of your killer before the end flow ----------
let killcam=null;
const _kcV=new THREE.Vector3();
function startKillcam(killer){
  killcam={ t:2.5, bot:killer, from:player.pos.clone(),
    a:Math.atan2(player.pos.x-killer.mesh.position.x, player.pos.z-killer.mesh.position.z) };
  $('kcTint').style.display='block';
  $('kcText').innerHTML='KILLED BY<br>'+killer.name.toUpperCase();
  $('kcText').style.display='block';
  gunGroup.visible=false; adsHeld=false; $('scope').style.display='none';
  camera.fov=80; camera.updateProjectionMatrix();
  if(document.exitPointerLock) document.exitPointerLock();
}
function killcamTick(dt){
  const kc=killcam; kc.t-=dt;
  const p=1-Math.max(0,kc.t)/2.5;
  const bp=kc.bot.mesh.position;
  kc.a+=dt*.55;                                   // slow orbit around the killer
  const r=(kc.bot.boss?15:11)-5*Math.min(1,p*1.4);
  _kcV.set(bp.x+Math.sin(kc.a)*r, (kc.bot.boss?7.5:3.2)+Math.sin(p*3)*.4, bp.z+Math.cos(kc.a)*r);
  camera.position.lerpVectors(kc.from,_kcV,Math.min(1,p*2.2));   // arc out from the death spot
  camera.lookAt(bp.x, bp.y+(kc.bot.boss?3.6:1.6), bp.z);
  updateBursts(dt*.35);                           // slow-mo particles
  if(kc.t<=0){
    killcam=null;
    $('kcTint').style.display='none'; $('kcText').style.display='none';
    if(bots.some(b=>b.alive)) startSpectate(); else showEnd(deathTitle,deathStats);
  }
}
function showEnd(title,statsTxt){
  if(gameOver) return; gameOver=true; spectating=false;
  $('specBanner').style.display='none';
  document.exitPointerLock();
  $('endTitle').textContent=title;
  $('endStats').textContent=statsTxt;
  if(cheated) $('endStats').innerHTML += '<br><span style="color:#ff7b7b">🏴‍☠️ CHEATER RUN — score not submitted</span>';
  $('end').style.display='flex';
  (submitP||Promise.resolve()).then(async()=>{ endLbRender(await fetchTop(400)); });
}
function win(){
  if(gameOver) return;
  if(!player.alive){ showEnd(deathTitle,deathStats); return; }   // match ended while spectating
  gameOver=true;
  setTimeout(()=>{ document.exitPointerLock();
    $('endTitle').textContent='#1 VICTORY ROYALE';
    const acc = stats.shots?Math.round(100*stats.hits/stats.shots):0;
    $('endStats').textContent=`${player.kills} elims · ${acc}% accuracy (${stats.hits}/${stats.shots}) · ${stats.headshots} headshots · ${stats.dmg} damage · ${stats.chests} chests · ${Math.round((performance.now()-startedAt)/1000)}s · ${D.name}`;
    if(cheated) $('endStats').innerHTML += '<br><span style="color:#ff7b7b">🏴‍☠️ CHEATER RUN — score not submitted</span>';
    $('end').style.display='flex';
    (submitP=finishRun(true)).then(async()=>{ endLbRender(await fetchTop(400)); }); },900);
}
function lose(by){
  if(gameOver||!player.alive) return;
  player.alive=false;
  announce(Math.random()<.6?'g80_gameover':'lose',.95,300,true);   // WAVE2: "GAME OVER MAN" alternates with the classic lose line
  const place=1+bots.filter(b=>b.alive).length+1;
  const acc2 = stats.shots?Math.round(100*stats.hits/stats.shots):0;
  deathTitle=`ELIMINATED — #${place}`;
  deathStats=`Taken down by ${by} · ${player.kills} elims · ${acc2}% accuracy · ${stats.headshots} headshots · ${stats.dmg} damage · ${stats.chests} chests · ${D.name}`;
  submitP=finishRun(false);   // score (+ optional arcade initials) submitted at death
  const killer=bots.find(b=>b.alive && b.name===by);   // WAVE2: known killer → kill-cam (storm/rocket deaths skip)
  if(killer){ startKillcam(killer); return; }
  if(bots.some(b=>b.alive)) startSpectate();
  else showEnd(deathTitle,deathStats);
}
$('again').onclick=()=>location.reload();

// ---------- start ----------
function mulberry32(seed){   // WAVE3: tiny seeded PRNG so host+joiners roll identical loot layouts
  let a=seed>>>0;
  return function(){
    a=a+0x6D2B79F5|0;
    let t=Math.imul(a^a>>>15,1|a);
    t=t+Math.imul(t^t>>>7,61|t)^t;
    return ((t^t>>>14)>>>0)/4294967296;
  };
}
function beginMatch(mp){
  if(mp){ diffIx=mp.diffIx; botCount=mp.botCount; mutator=mp.mutator; }
  const rnd = (mp && mp.seed!=null) ? mulberry32(mp.seed) : Math.random;
  const mrand=(a,b)=>a+rnd()*(b-a);
  ac = ac||new AC();
  D = DIFFS[diffIx];
  player.name=$('pname').value.trim()||'Player';
  $('lobby').style.display='none';
  $('hud').style.display='block';
  if(!isTouch) lockPtr();
  { const fs=findFreeSpot(player.pos.x, player.pos.z); player.pos.x=fs.x; player.pos.z=fs.z; }
  running=true; startedAt=performance.now(); grace=30; $('graceT').style.display='block';
  // spawn world loot + bots per difficulty
  for(let i=0;i<D.chests;i++) spawnChest(mrand(-MAP*.75,MAP*.75), mrand(-MAP*.75,MAP*.75));
  spawnChest(player.pos.x+mrand(-8,8), player.pos.z-10);      // one near spawn
  for(const f of forts) spawnChest(f.x+mrand(-2,2), f.z+mrand(-2,2));   // loot inside forts — worth the ambush risk
  for(const s of towerChestSpots) spawnChest(s.x, s.z, s.y);          // WAVE2: tower loot — rooftop + ground floor
  if(mutator!=='knives') for(let i=0;i<8;i++) spawnFloorGun(lootGunKey(), mrand(-MAP*.7,MAP*.7), mrand(-MAP*.7,MAP*.7));   // WAVE2 mutators
  for(let i=0;i<18;i++) spawnPickup(['shield','med','shield','ammo'][i%4], mrand(-MAP*.7,MAP*.7), mrand(-MAP*.7,MAP*.7));
  if(mpIsHost){   // WAVE3: joining friends mirror the host's bots/boss over the network instead of spawning their own
    const nBots = botCount || D.bots;
    for(let i=0;i<nBots;i++) bots.push(makeBot(BOT_NAMES[i%BOT_NAMES.length]));
  }
  makeKart(player.pos.x+5, player.pos.z-4);                        // kart parked near spawn
  makeKart(mrand(-MAP*.55,MAP*.55), mrand(-MAP*.55,MAP*.55));      // one random
  dropTimer=mrand(35,50);
  invReset(); buildViewmodel(); updateAlive(); updateBars(); updateWood();
  // WAVE2: mutators — legit game modes, NOT cheats (scores submit as normal)
  if(mutator==='wild'){ giveWeaponBase('deagle', 1); showMsg('🤠 WILD WEST — deagles only!',1800); }
  else if(mutator==='moon'){ gravMult=.4; jumpMult=1.6; showMsg('🌙 MOON GRAVITY — boing!',1800); }
  else if(mutator==='knives'){ showMsg('🔪 KNIVES ONLY — get stabby!',1800); }
  while(pendingCheats.length) pendingCheats.shift()();   // IDKFA/HANSOLO typed in lobby
  showMsg(`🚌 DROPPED IN — ${D.name}<br><small>find a chest, grab a gun</small>`);
}
$('playBtn').onclick=async ()=>{
  if(mpChannel && !mpIsHost) return;   // joiners can't self-start — waiting message covers the button anyway
  if(mpChannel && mpIsHost){
    const seed=(Math.random()*2**31)|0;
    try {
      const res=await mpChannel.send({type:'broadcast', event:'start', payload:{diffIx, botCount, mutator, seed}});
      if(res!=='ok') showMsg('⚠ Could not reach your party — starting anyway. Friends may need to rejoin.',2600);
    } catch(e){ showMsg('⚠ Could not reach your party — starting anyway. Friends may need to rejoin.',2600); }
    beginMatch({diffIx, botCount, mutator, seed});
  } else {
    beginMatch();
  }
};
renderer.domElement.addEventListener('click', ()=>{ if(running&&!locked&&!isTouch) lockPtr(); });

// ---------- minimap ----------
const mm = $('minimap'), mmx = mm.getContext('2d');
function drawMinimap(){
  const S=180, c=S/2, scale=c/(MAP+10);
  mmx.clearRect(0,0,S,S);
  // island
  mmx.fillStyle='rgba(80,170,90,.85)';
  mmx.beginPath(); mmx.arc(c,c,MAP*scale,0,7); mmx.fill();
  // storm safe zone
  mmx.strokeStyle='#c26bff'; mmx.lineWidth=3;
  mmx.beginPath(); mmx.arc(c,c,Math.min(stormR,MAP+10)*scale,0,7); mmx.stroke();
  mmx.fillStyle='rgba(120,40,170,.35)';
  mmx.beginPath(); mmx.arc(c,c,(MAP+10)*scale,0,7);
  mmx.arc(c,c,Math.min(stormR,MAP+10)*scale,0,7,true); mmx.fill('evenodd');
  // chests
  mmx.fillStyle='#ffd34d';
  for(const ch of chests){ if(!ch.open){ mmx.fillRect(c+ch.x*scale-2, c+ch.z*scale-2, 4,4); } }
  // supply drops (pulsing blue square)
  const pul=.5+.5*Math.sin(performance.now()/180);
  mmx.fillStyle=`rgba(60,167,255,${.45+.55*pul})`;
  for(const dp of drops){ if(!dp.opened){ const sq=4+pul*3; mmx.fillRect(c+dp.x*scale-sq/2, c+dp.z*scale-sq/2, sq, sq); } }
  // named location labels
  mmx.fillStyle='rgba(255,255,255,.78)'; mmx.font='700 6.5px sans-serif'; mmx.textAlign='center';
  for(const zn of ZONES) mmx.fillText(zn.name, c+zn.x*scale, c+zn.z*scale);
  // bots
  mmx.fillStyle='#ff5e5e';
  for(const b of bots){ if(b.alive){ mmx.beginPath(); mmx.arc(c+b.mesh.position.x*scale, c+b.mesh.position.z*scale, 2.4,0,7); mmx.fill(); } }
  // player (triangle facing yaw)
  mmx.save();
  mmx.translate(c+player.pos.x*scale, c+player.pos.z*scale);
  mmx.rotate(-player.yaw);
  mmx.fillStyle='#ffffff';
  mmx.beginPath(); mmx.moveTo(0,-6); mmx.lineTo(4,5); mmx.lineTo(-4,5); mmx.closePath(); mmx.fill();
  mmx.restore();
}

// ---------- post-processing: vignette + film grain + cheap bloom (desktop only, hand-rolled) ----------
let post=null;
function initPost(){
  if(isTouch) return;   // touch devices keep direct rendering
  try{
    const size=renderer.getDrawingBufferSize(new THREE.Vector2());
    const p={};
    p.sceneRT=new THREE.WebGLRenderTarget(size.x, size.y, {samples:perfMode?0:4});
    p.qw=Math.max(2,size.x>>2); p.qh=Math.max(2,size.y>>2);
    p.brightRT=new THREE.WebGLRenderTarget(p.qw,p.qh,{depthBuffer:false});
    p.blurA=new THREE.WebGLRenderTarget(p.qw,p.qh,{depthBuffer:false});
    p.blurB=new THREE.WebGLRenderTarget(p.qw,p.qh,{depthBuffer:false});
    const VERT='varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }';
    p.brightMat=new THREE.ShaderMaterial({ uniforms:{tD:{value:null}}, vertexShader:VERT, depthTest:false, depthWrite:false, toneMapped:false,
      fragmentShader:'uniform sampler2D tD; varying vec2 vUv; void main(){ vec3 c=texture2D(tD,vUv).rgb; float l=dot(c,vec3(.299,.587,.114)); gl_FragColor=vec4(c*smoothstep(.62,.95,l),1.0); }' });
    p.blurMat=new THREE.ShaderMaterial({ uniforms:{tD:{value:null}, dir:{value:new THREE.Vector2(1,0)}}, vertexShader:VERT, depthTest:false, depthWrite:false, toneMapped:false,
      fragmentShader:['uniform sampler2D tD; uniform vec2 dir; varying vec2 vUv;',
        'void main(){ vec3 c=texture2D(tD,vUv).rgb*.227027;',
        'c+=(texture2D(tD,vUv+dir*1.3846).rgb+texture2D(tD,vUv-dir*1.3846).rgb)*.316216;',
        'c+=(texture2D(tD,vUv+dir*3.2307).rgb+texture2D(tD,vUv-dir*3.2307).rgb)*.070270;',
        'gl_FragColor=vec4(c,1.0); }'].join('\n') });
    p.combineMat=new THREE.ShaderMaterial({ uniforms:{tD:{value:null}, tB:{value:null}, time:{value:0}}, vertexShader:VERT, depthTest:false, depthWrite:false,
      fragmentShader:['uniform sampler2D tD; uniform sampler2D tB; uniform float time; varying vec2 vUv;',
        'void main(){',
        'vec3 c=texture2D(tD,vUv).rgb + texture2D(tB,vUv).rgb*.5;',                 // additive bloom
        'vec2 q=vUv-.5; c*=1.0-dot(q,q)*.55;',                                      // vignette
        'float g=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233))+mod(time,10.0)*61.7)*43758.5453);',
        'c+=(g-.5)*.032;',                                                           // animated film grain
        'gl_FragColor=vec4(c,1.0);',
        '#include <tonemapping_fragment>',
        '#include <colorspace_fragment>',
        '}'].join('\n') });
    p.scene=new THREE.Scene();
    p.cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    p.quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2), p.combineMat);
    p.quad.frustumCulled=false;
    p.scene.add(p.quad);
    p.resize=()=>{
      const s=renderer.getDrawingBufferSize(new THREE.Vector2());
      p.sceneRT.setSize(s.x,s.y);
      p.qw=Math.max(2,s.x>>2); p.qh=Math.max(2,s.y>>2);
      p.brightRT.setSize(p.qw,p.qh); p.blurA.setSize(p.qw,p.qh); p.blurB.setSize(p.qw,p.qh);
    };
    post=p;
  }catch(e){ post=null; }   // any failure → plain rendering
}
function postRender(now){
  const p=post;
  renderer.setRenderTarget(p.sceneRT); renderer.render(scene,camera);
  p.quad.material=p.brightMat; p.brightMat.uniforms.tD.value=p.sceneRT.texture;
  renderer.setRenderTarget(p.brightRT); renderer.render(p.scene,p.cam);
  p.quad.material=p.blurMat;
  p.blurMat.uniforms.tD.value=p.brightRT.texture; p.blurMat.uniforms.dir.value.set(1/p.qw,0);
  renderer.setRenderTarget(p.blurA); renderer.render(p.scene,p.cam);
  p.blurMat.uniforms.tD.value=p.blurA.texture; p.blurMat.uniforms.dir.value.set(0,1/p.qh);
  renderer.setRenderTarget(p.blurB); renderer.render(p.scene,p.cam);
  p.quad.material=p.combineMat;
  p.combineMat.uniforms.tD.value=p.sceneRT.texture;
  p.combineMat.uniforms.tB.value=p.blurB.texture;
  p.combineMat.uniforms.time.value=now/1000;
  renderer.setRenderTarget(null); renderer.render(p.scene,p.cam);
}
if(!perfMode) initPost();

// ---------- WAVE2: ATTRACT MODE — 30s idle on login/lobby → bot deathmatch demo + 80s chiptune ----------
let attract=false, attractA=0, lastInputT=performance.now(), attractHidden=[];
const demoBots=[];
let tune=null;
function startTune(){
  try{
    ac = ac||new AC();
    if(ac.state==='suspended') ac.resume().catch(()=>{});
    const master=ac.createGain(); master.gain.value=.055; master.connect(ac.destination);
    tune={master, oscs:[], timer:0, next:0};
    const SPB=60/118, bar=SPB*4, loopLen=bar*8;                          // ~118bpm, 8 bars
    const roots=[110,110,87.31,87.31,130.81,130.81,98,98];               // Am Am F F C C G G
    const chords=[[0,3,7,12],[0,3,7,12],[0,4,7,12],[0,4,7,12],[0,4,7,12],[0,4,7,12],[0,4,7,10],[0,4,7,10]];
    const sched=(start)=>{
      for(let br=0;br<8;br++){
        const bs=start+br*bar, root=roots[br];
        for(let n=0;n<8;n++){                                            // bass 8ths (triangle)
          const o=ac.createOscillator(), g=ac.createGain();
          o.type='triangle'; o.frequency.value=root*(n%4===3?2:1);
          o.connect(g); g.connect(master);
          const ts=bs+n*SPB/2;
          g.gain.setValueAtTime(.8,ts); g.gain.exponentialRampToValueAtTime(.02,ts+SPB*.45);
          o.start(ts); o.stop(ts+SPB*.5); tune.oscs.push(o);
        }
        for(let n=0;n<16;n++){                                           // lead arpeggio 16ths (square)
          const o=ac.createOscillator(), g=ac.createGain();
          o.type='square'; o.frequency.value=root*4*Math.pow(2,(chords[br][n%4]+(n%8>=4?12:0))/12);
          o.connect(g); g.connect(master);
          const ts=bs+n*SPB/4;
          g.gain.setValueAtTime(.22,ts); g.gain.exponentialRampToValueAtTime(.01,ts+SPB*.22);
          o.start(ts); o.stop(ts+SPB*.25); tune.oscs.push(o);
        }
      }
    };
    const t0=ac.currentTime+.08;
    sched(t0); tune.next=t0+loopLen;
    tune.timer=setInterval(()=>{                                         // keep one loop scheduled ahead
      if(!tune) return;
      if(ac.currentTime>tune.next-1.2){ tune.oscs.length=0; sched(tune.next); tune.next+=loopLen; }
    },400);
  }catch(e){ tune=null; }
}
function stopTune(){
  if(!tune) return;
  clearInterval(tune.timer);
  for(const o of tune.oscs){ try{ o.stop(); }catch(e){} }
  try{ tune.master.disconnect(); }catch(e){}
  tune=null;
}
function startAttract(){
  attract=true; attractA=rand(0,6.28); attractHidden=[];
  for(const id of ['loginOverlay','lobby','adminOverlay','lbOverlay']){
    const el=$(id);
    if(el && getComputedStyle(el).display!=='none'){ attractHidden.push([el, el.style.display]); el.style.display='none'; }
  }
  $('attractUI').style.display='block';
  gunGroup.visible=false;                  // no viewmodel in the demo orbit
  for(let i=0;i<8;i++){
    const b=makeBot(BOT_NAMES[(Math.random()*BOT_NAMES.length)|0]);
    b.tag.visible=false;
    demoBots.push(b);
  }
  startTune();
}
function stopAttract(){
  if(!attract) return;
  attract=false;
  for(const b of demoBots) scene.remove(b.mesh);
  demoBots.length=0;
  stopTune();
  $('attractUI').style.display='none';
  gunGroup.visible=true;
  for(const [el,d] of attractHidden) el.style.display=d;
  attractHidden=[];
  lastInputT=performance.now();
}
function attractTick(dt,now){
  attractA+=dt*.05;                                  // slow island orbit
  camera.position.set(Math.cos(attractA)*115, 52, Math.sin(attractA)*115);
  camera.lookAt(0,6,0);
  for(const b of demoBots){
    if(!b.alive){                                    // respawn to keep the show running
      b.respawnT=(b.respawnT===undefined?rand(1.5,3):b.respawnT)-dt;
      if(b.respawnT<=0){
        b.respawnT=undefined; b.alive=true; b.hp=100; b.hpShown=-1;
        const a=rand(0,6.28), r=rand(20,90);
        b.mesh.position.set(Math.cos(a)*r,0,Math.sin(a)*r);
        scene.add(b.mesh); b.tag.visible=false;
      }
      continue;
    }
    let tgt=null, td=1e9;                            // nearest other demo bot
    for(const o of demoBots){ if(o!==b&&o.alive){ const d2=o.mesh.position.distanceTo(b.mesh.position); if(d2<td){ td=d2; tgt=o; } } }
    if(!tgt) continue;
    if(td>13){
      const dir=tgt.mesh.position.clone().sub(b.mesh.position); dir.y=0; dir.normalize();
      const np=b.mesh.position.clone().addScaledVector(dir,b.speed*dt);
      if(!collides(np,.6)){ b.mesh.position.copy(np); b.moving=true; } else b.moving=false;
    } else b.moving=false;
    b.mesh.lookAt(tgt.mesh.position.x, b.mesh.position.y, tgt.mesh.position.z);
    if(b.moving){ b.phase+=dt*b.speed*1.35; b.swing=Math.min(1,b.swing+dt*6); } else b.swing=Math.max(0,b.swing-dt*6);
    const sw=Math.sin(b.phase)*.62*b.swing;
    b.legL.rotation.x=sw; b.legR.rotation.x=-sw; b.armL.rotation.x=-sw*.85; b.armR.rotation.x=sw*.85;
    b.cd-=dt;
    if(b.cd<=0 && td<48){
      b.cd=rand(.5,1.4);
      tracer(b.mesh.position.clone().setY(2), tgt.mesh.position.clone().setY(rand(1,2.2)));
      if(Math.random()<.4){
        tgt.hp-=rand(12,34);
        if(tgt.hp<=0){ tgt.alive=false; voxelBurst(tgt.mesh.position, tgt.col); scene.remove(tgt.mesh); }
      }
    }
  }
  updateBursts(dt);
  for(const cl of clouds){ cl.g.position.x+=cl.speed*dt; if(cl.g.position.x>260) cl.g.position.x=-260; }
  water.position.y=-1.4+Math.sin(now/1400)*.1;
  updateNightFx(now);
}
// idle detection + any-key/tap exit (never mid-match, never over the initials panel)
['pointerdown','keydown','touchstart','wheel'].forEach(ev=>addEventListener(ev, e=>{
  lastInputT=performance.now();
  if(attract){ stopAttract(); if(e.cancelable) e.preventDefault(); e.stopPropagation(); }
},{capture:true, passive:false}));
addEventListener('mousemove', ()=>{ if(!attract) lastInputT=performance.now(); }, {passive:true});
setInterval(()=>{
  if(!attract && !running && !hsOpen && performance.now()-lastInputT>30000) startAttract();
},1000);

// ---------- loop ----------
let last=performance.now();
let fpsT=performance.now(), fpsFrames=0;   // rolling FPS, HUD-updated ~2x/s
function loop(){
  requestAnimationFrame(loop);
  const now=performance.now();
  const dt=Math.min((now-last)/1000,.05); last=now;
  if(attract){ attractTick(dt,now); }                                 // WAVE2: lobby demo mode
  else if(running&&!gameOver&&!paused&&killcam){ killcamTick(dt); }   // WAVE2: kill-cam freezes the world
  else if(running&&!gameOver&&!paused){
    fpsFrames++;
    if(now-fpsT>500){
      const f=Math.round(fpsFrames*1000/(now-fpsT));
      fpsT=now; fpsFrames=0;
      const fe=$('fps'); fe.textContent=f+' FPS';
      fe.style.color = f>=50?'#7CFC00':f>=30?'#ffe93b':'#ff5e5e';
    }
    // Halo shield regen: 5s out of combat, then 25/s back to full
    if(player.alive && player.shield<100 && now-(player.lastHitT||0)>5000){
      player.shield=Math.min(100,player.shield+25*dt); updateBars();
    }
    if(player.cloakT>0){ player.cloakT-=dt; if(player.cloakT<=0) showMsg('👻 Cloak faded'); }
    if(player.adrT>0){ player.adrT-=dt; if(player.adrT<=0) showMsg('⚡ Adrenaline worn off'); }
    $('fxHud').textContent = (player.cloakT>0?'👻 '+Math.ceil(player.cloakT)+'s  ':'') + (player.adrT>0?'⚡ '+Math.ceil(player.adrT)+'s  ':'') + (player.slimeT>0?'🟢 SLIMED ':'') + (cheatNames.length?'  🕹 '+cheatNames.join(' · '):'');
    // crouch: smooth duck (Ctrl/C or 🦆), halves speed, lowers eye + bots aim at the ducked head
    const wantC = ((keys['ControlLeft']||keys['ControlRight']||keys['KeyC']||touchCrouch) && !inKart && player.alive) ? 1 : 0;
    crouchK += (wantC-crouchK)*Math.min(1,dt*10);
    // sniper ADS: fov lerp + scope overlay
    adsOn = adsHeld && !spectating && !inKart && player.alive && inv[activeSlot] && inv[activeSlot].key==='sniper';
    const tf = adsOn?25:80;
    if(Math.abs(camera.fov-tf)>.15){ camera.fov+=(tf-camera.fov)*Math.min(1,dt*9); camera.updateProjectionMatrix(); }
    $('scope').style.display = adsOn?'block':'none';

    if(spectating){
      // slow orbit around the island centre
      specAngle+=dt*.18;
      camera.position.set(Math.cos(specAngle)*75, 48, Math.sin(specAngle)*75);
      camera.lookAt(0,4,0);
    } else if(inKart){
      driveKart(dt);
      $('interact').textContent='E — exit kart';
      $('interact').style.opacity=1;
      if(isTouch) $('btnE').style.display='flex';
    } else if(grapPull){
      // WAVE2: grapple pull — gravity suspended, ease-in-out toward the anchor, pop + release
      grapPull.t+=dt;
      const gk=Math.min(1,grapPull.t/grapPull.dur);
      const ge=gk<.5 ? 2*gk*gk : 1-Math.pow(-2*gk+2,2)/2;
      player.pos.lerpVectors(grapPull.from,grapPull.to,ge);
      player.vel.set(0,0,0);
      if(gk>=1){ grapPull=null; player.vel.y=2.6; player.onGround=false; }
      camera.position.copy(player.pos);
      camera.rotation.set(0,0,0); camera.rotateY(player.yaw); camera.rotateX(player.pitch);
    } else {
      const f=new THREE.Vector3(-Math.sin(player.yaw),0,-Math.cos(player.yaw));
      const r=new THREE.Vector3(-f.z,0,f.x);
      let wish=new THREE.Vector3();
      if(keys['KeyW'])wish.add(f); if(keys['KeyS'])wish.sub(f);
      if(keys['KeyD'])wish.add(r); if(keys['KeyA'])wish.sub(r);
      if(isTouch&&(joyX||joyY)) wish.addScaledVector(f,-joyY).addScaledVector(r,joyX);
      let speed=(keys['ShiftLeft']||keys['ShiftRight']||(isTouch&&Math.hypot(joyX,joyY)>.82))?SPRINT:SPEED;
      if(player.adrT>0) speed*=1.5;
      speed*=(1-.5*crouchK);
      if(player.slowT>0) speed*=.45;
      if(player.slimeT>0) speed*=.33;
      if(adsOn) speed*=.4;   // scoped = slow walk
      if(wish.lengthSq()>0) wish.normalize().multiplyScalar(speed);
      player.vel.x=wish.x; player.vel.z=wish.z;
      player.vel.y-=GRAV*gravMult*dt;
      if(keys['Space']&&player.onGround){ player.vel.y=JUMP*jumpMult; player.onGround=false; }
      const np=player.pos.clone().addScaledVector(player.vel,dt);
      const feet=player.pos.y-EYE;
      const tryX=player.pos.clone(); tryX.x=np.x; if(!collides(tryX,.5,feet)) player.pos.x=np.x;
      const tryZ=player.pos.clone(); tryZ.z=np.z; if(!collides(tryZ,.5,feet)) player.pos.z=np.z;
      player.pos.y=np.y;
      const gh=supportH(player.pos,.45);
      if(player.pos.y<=gh+EYE){ player.pos.y=gh+EYE; player.vel.y=0; player.onGround=true; }
      else player.onGround=false;
      camera.position.copy(player.pos);
      camera.position.y-=crouchK*.78;
      camera.rotation.set(0,0,0); camera.rotateY(player.yaw); camera.rotateX(player.pitch);
      if(danceT>0){ danceT-=dt; camera.rotateZ(Math.sin(now/90)*.1); camera.position.y+=Math.abs(Math.sin(now/130))*.3; }   // dance bop
      recoil=Math.max(0,recoil-dt*.12);
      // viewmodel life: walk bob, look sway, shot kick, knife swing, reload dip (visual only)
      vmKick=Math.max(0,vmKick-dt*8); vmSwing=Math.max(0,vmSwing-dt*7);
      const vmMv=Math.min(1, Math.hypot(player.vel.x,player.vel.z)/SPRINT) * (player.onGround?1:.2);
      if(vmMv>.05) vmBobT+=dt*(6+8*vmMv);
      const vmYd=player.yaw-vmPrevYaw, vmPd=player.pitch-vmPrevPitch;
      vmPrevYaw=player.yaw; vmPrevPitch=player.pitch;
      const vmSm=Math.min(1,dt*10), vmAds=adsOn?.25:1;
      vmSwayX+=(clamp(vmYd*1.4,-.05,.05)*vmAds-vmSwayX)*vmSm;
      vmSwayY+=(clamp(-vmPd*1.1,-.04,.04)*vmAds-vmSwayY)*vmSm;
      vmReloadK+=((reloading?1:0)-vmReloadK)*Math.min(1,dt*7);
      gunGroup.position.set(
        .28 + Math.cos(vmBobT)*.013*vmMv*vmAds + vmSwayX,
        -.26 - Math.abs(Math.sin(vmBobT))*.016*vmMv*vmAds + vmSwayY*.6 + Math.sin(now/1100)*.004*vmAds - vmReloadK*.15,
        -.55 + vmKick*.09);
      gunGroup.rotation.set(
        -vmSwing*.6 + vmKick*.10 - vmReloadK*.4 - vmSwayY*1.4,   // knife chops down, shots kick muzzle up
        vmSwayX*1.2,
        vmSwayX*.5 + Math.sin(vmBobT)*.01*vmMv);
      if(((mouseDown&&locked)||touchFire)&&player.alive){ const w=W(); if(w){ if(w.auto||w.type==='melee') shoot(now/1000); else { shoot(now/1000); mouseDown=false; touchFire=false; } } }

      // interact hint
      const ni=nearestInteractable();
      if(ni) $('interact').textContent = ni.t==='chest'?'E — open chest' : ni.t==='gun'?'E — pick up '+WEAPONS[ni.o.key].name : ni.t==='drop'?'E — open supply drop' : 'E — drive kart';
      $('interact').style.opacity = ni?1:0;
      if(isTouch) $('btnE').style.display = ni?'flex':'none';
    }

    // rockets
    // guidance chip: crosshair lock-on while holding the rocket launcher
    if(upg.homing && player.alive && !spectating && inv[activeSlot] && inv[activeSlot].key==='rocket'){
      const cdir=camera.getWorldDirection(LOCK_DIR), cpos=camera.getWorldPosition(LOCK_POS);
      let cand=null, candDot=0.9986;   // ~3° cone
      for(const b of bots){ if(!b.alive||b.dropping) continue;
        LOCK_TMP.copy(b.mesh.position).setY(1.3).sub(cpos);
        const d=LOCK_TMP.length(); if(d<4||d>260) continue;
        LOCK_TMP.divideScalar(d);
        const dot=LOCK_TMP.dot(cdir);
        if(dot>candDot){ cand=b; candDot=dot; }
      }
      if(cand && cand===lockCand){ lockT+=dt; lockLost=0; }
      else if(cand){ lockCand=cand; lockT=dt; lockLost=0; }
      else { lockLost+=dt; if(lockLost>.4){ lockCand=null; lockT=0; lockedOn=null; } }
      if(lockCand && lockT>=1.2 && lockedOn!==lockCand){ lockedOn=lockCand; lockBeep(true); }
      if(lockCand && lockT<1.2){ lockBeepT-=dt; if(lockBeepT<=0){ lockBeepT=.25; lockBeep(false); } }
      const el=$('lockBox');
      if(lockCand){
        LOCK_TMP.copy(lockCand.mesh.position).setY(1.5).project(camera);
        if(LOCK_TMP.z<1){
          el.style.display='block';
          el.style.left=((LOCK_TMP.x+1)/2*innerWidth)+'px';
          el.style.top=((-LOCK_TMP.y+1)/2*innerHeight)+'px';
          el.className = lockedOn===lockCand ? 'locked' : 'locking';
          el.innerHTML = lockedOn===lockCand ? '◤&nbsp;&nbsp;◥<br><b>LOCKED</b><br>◣&nbsp;&nbsp;◢' : '◤&nbsp;&nbsp;◥<br><br>◣&nbsp;&nbsp;◢';
        } else el.style.display='none';
      } else el.style.display='none';
    } else { if($('lockBox').style.display!=='none'){ $('lockBox').style.display='none'; } lockCand=null; lockT=0; lockedOn=null; }
    for(let i=rockets.length-1;i>=0;i--){
      const rk=rockets[i];
      if(rk.target){
        if(rk.target.alive){
          LOCK_TMP.copy(rk.target.mesh.position).setY(1.3).sub(rk.mesh.position).normalize();
          rk.dir.lerp(LOCK_TMP, Math.min(1, 3.2*dt)).normalize();
          rk.mesh.quaternion.setFromUnitVectors(UP_Y, rk.dir);
        } else rk.target=null;
      }
      // sniper-grade rocket: fast + substepped so it can't tunnel through bots or thin walls at low fps
      const step=80*dt, nSub=Math.max(1,Math.ceil(step/.55)), sub=step/nSub;
      rk.life-=dt;
      let boom=false;
      const p=rk.mesh.position;
      for(let si=0; si<nSub && !boom; si++){
        p.addScaledVector(rk.dir, sub);
        if(rk.life<=0 || p.y<=0.1 || Math.hypot(p.x,p.z)>MAP+6){ boom=true; break; }
        for(const o of obstacles){
          if(p.x>o.min.x&&p.x<o.max.x&&p.y>o.min.y&&p.y<o.max.y&&p.z>o.min.z&&p.z<o.max.z){ boom=true; break; } }
        if(!boom){ for(const b of bots){ if(b.alive && !b.dropping && b.mesh.position.clone().setY(1.2).distanceTo(p)<1.7){ boom=true; break; } } }
      }
      rk.smokeT=(rk.smokeT||0)-dt;
      if(rk.smokeT<=0){ rk.smokeT=.05; puffSmoke(p); }
      if(boom){ explode(p.clone(), rk.mult||1); scene.remove(rk.mesh); rockets.splice(i,1); }
    }
    updateBossRockets(dt,now);   // WAVE2: boss arcing rockets + target rings

    // grace countdown
    if(grace>0){
      grace-=dt;
      $('graceT').textContent='🕊 '+Math.max(0,Math.ceil(grace));
      if(grace<=0){ $('graceT').style.display='none'; announce(Math.random()<.3?'g80_bubblegum':'weaponsfree',.9,0,true); showMsg('⚔️ WEAPONS FREE!'); }
    }
    // storm — WAVE3: joining friends mirror this from the host's broadcast instead of simulating it themselves
    if(mpIsHost){
      if(!shrinking){
        phaseTimer-=dt;
        if(phaseTimer<=0&&phaseIx<stormPhases.length){ shrinking=true; stormTarget=stormPhases[phaseIx].to; stormShrinkRate=stormPhases[phaseIx].rate;
          announce(Math.random()<.5?'g80_choppah':'storm',.8);   // WAVE2: "GET TO THE CHOPPAH" alternates with the storm line
          if(phaseIx===1&&!bossSpawned){ if(bcfg('dad','off',0)===1) bossSpawned=true; else spawnBoss(); } }   // boss drops at the start of the second shrink
      } else {
        stormR=Math.max(stormTarget,stormR-stormShrinkRate*dt*10);
        if(stormR<=stormTarget){ shrinking=false; phaseIx++;
          phaseTimer=phaseIx<stormPhases.length?stormPhases[phaseIx].wait:9999; }
      }
    }
    $('storm').textContent = shrinking ? '⛈ STORM CLOSING — get inside!' : `⛈ Storm shrinks in ${Math.max(0,Math.ceil(phaseTimer))}s`;
    stormWall.scale.setScalar(stormR/200);
    stormWall2.scale.setScalar(stormR/199);
    stormWall2.rotation.y = now/4000;
    edgeRing.scale.setScalar(stormR);
    stormMat.opacity=.26+.12*Math.sin(now/300);
    stormMat2.opacity=.14+.08*Math.sin(now/210+2);
    // lightning during shrink phases
    if(shrinking){
      boltNext-=dt;
      if(boltNext<=0){
        boltNext=rand(4,8); boltT=.3;
        const ba=rand(0,Math.PI*2), br=stormR*rand(.85,1);
        boltLight.position.set(Math.cos(ba)*br, rand(25,55), Math.sin(ba)*br);
        if(now/1000-lastRumble>10){ lastRumble=now/1000; afile('storm_rumble',.3); }
      }
    }
    if(boltT>0){ boltT-=dt; boltLight.intensity=boltT>0 ? 140*(boltT/.3)*(.6+.4*Math.sin(now/23)) : 0; }
    else if(boltLight.intensity) boltLight.intensity=0;
    // sky + water life
    for(const cl of clouds){ cl.g.position.x+=cl.speed*dt; if(cl.g.position.x>260) cl.g.position.x=-260; }
    water.position.y=-1.4+Math.sin(now/1400)*.1;
    foam.position.y=water.position.y+.52;                    // foam rides the water at the sand boundary
    foamMat.opacity=.22+.14*Math.sin(now/850);
    const fs=1+.004*Math.sin(now/1300); foam.scale.set(fs,fs,1);
    updateBursts(dt); updateShells(dt); updateLeaves(dt); updateSmoke(dt);
    updateGrappleFx(dt);   // WAVE2: grapple cooldown + rope visual + HUD
    drawMinimap();
    updateMood();                                            // storm sunset: day → golden → blood dusk
    updateNightFx(now);                                      // WAVE2: campfire + torch flicker
    const myDist=Math.hypot(player.pos.x,player.pos.z);
    $('stormWarn').style.opacity = (player.alive&&myDist>stormR) ? 1 : 0;
    if(player.alive&&myDist>stormR){ scene.fog.color.setHex(0x6a2b8f); scene.background.setHex(0x6a2b8f); }
    else { scene.fog.color.copy(moodFog); scene.background.copy(moodSky); }
    if(player.alive&&myDist>stormR){ if(Math.floor(now/500)!==Math.floor((now-dt*1000)/500)) damagePlayer(3,'the Storm'); }
    if(mpIsHost){   // WAVE3: guests get resulting hp/alive/position from the host's broadcast instead
      for(const b of bots){ if(b.alive&&Math.hypot(b.mesh.position.x,b.mesh.position.z)>stormR){
        b.hp-=14*dt; if(b.hp<=0){ b.alive=false; feed(`⛈ the Storm consumed <b>${b.name}</b>`); voxelBurst(b.mesh.position, b.col); scene.remove(b.mesh); updateAlive(); } } }
      for(const b of bots) botThink(b,dt,now);
    }
    for(const b of bots){ if(!b.alive) continue;
      if(b.hp!==b.hpShown) drawTag(b);
      b.tag.visible = b.mesh.position.distanceTo(player.pos)<(b.boss?220:45); }
    stroyerDirector(dt);
    updateBossBar();   // WAVE2: boss HUD health strip
    mpUpdateNetPlayers(dt);   // WAVE3: friends over the network
    mpBroadcastState(now);
    mpBroadcastHostState(now);

    // supply drops: timer, descent, landing glow
    dropTimer-=dt;
    if(dropTimer<=0){ dropTimer=rand(40,55); spawnDrop(); }
    for(const dp of drops){
      if(!dp.landed){
        dp.grp.position.y-=13*dt; dp.grp.rotation.y+=dt*.4;
        if(dp.grp.position.y<=0){
          dp.grp.position.y=0; dp.landed=true; dp.grp.remove(dp.chute);
          dp.glow=new THREE.PointLight(0x3fa7ff,1.2,9); dp.glow.position.y=1.6; dp.grp.add(dp.glow);
        }
      } else if(!dp.opened&&dp.glow) dp.glow.intensity=.9+.5*Math.sin(now/220);
    }

    // named locations
    checkZone();

    // chest shimmer + floor loot spin (dramatic at night)
    for(const c of chests){ if(!c.open) c.glow.intensity=(.7+.3*Math.sin(now/250))*(nightMode?1.9:1); }
    for(const f of floorLoot){ f.mesh.rotation.y+=dt*2; f.mesh.position.y=1.1+Math.sin(now/300)*.15; }

    // pickups
    for(let i=pickups.length-1;i>=0;i--){
      const p=pickups[i];
      p.mesh.rotation.y+=dt*2; p.mesh.position.y=(p.baseY||1.4)+Math.sin(now/300+i)*.2;
      if(player.alive&&p.mesh.position.distanceTo(player.pos)<2.2){
        if(p.kind==='med'){ player.hp=clamp(player.hp+40,0,player.maxHp||100); showMsg('🩹 +40 HP',900); }
        if(p.kind==='shield'){ player.shield=clamp(player.shield+50,0,100); showMsg('🛡 +50 shield',900); }
        if(p.kind==='ammo'){ inv.forEach(it=>{ if(it&&WEAPONS[it.key].mag) it.res=Math.min((it.res|0)+Math.ceil(resMax(WEAPONS[it.key])*0.5), resMax(WEAPONS[it.key])*2); }); renderSlots(); showMsg('📦 +reserve ammo',900); }
        if(p.kind==='ammopack'){ upg.resMult=Math.min(upg.resMult+0.5,3); showMsg('🎒 AMMO PACK! reserves +50%',1300); }
        if(p.kind==='mag'){ upg.magMult=Math.min(upg.magMult+0.5,2.5); inv.forEach(it=>{ if(it) it.ammo=Math.max(it.ammo, magSize(WEAPONS[it.key],it)); }); renderSlots(); showMsg('📎 EXTENDED MAG! clip +50%',1300); }
        if(p.kind==='wood'){ woodCount+=15; updateWood(); showMsg('🪵 +15 wood',900); }
        if(p.kind==='chip'){ upg.homing=true; showMsg('🎯 GUIDANCE CHIP!<br><small>rockets now lock on — hold your aim on a target</small>',2200); }
        if(p.kind.startsWith('it_')){ const k=p.kind.slice(3); if(items.length<6){ items.push(k); showMsg(ITEMS[k].icon+' '+ITEMS[k].name+' — press TAB to use',1600); } else showMsg('🎒 Item bag full!',900); }
        sfx('pick'); updateBars();
        scene.remove(p.mesh); pickups.splice(i,1);
      }
    }
  }
  if(post){
    try{ postRender(now); }
    catch(e){ post=null; renderer.setRenderTarget(null); renderer.render(scene,camera); }
  } else renderer.render(scene,camera);
}
// ---------- touch controls (iPhone/iPad) ----------
if(isTouch){
  $('touchUI').style.display='block';
  $('slots').style.right='130px'; $('slots').style.bottom='150px'; $('slots').style.pointerEvents='auto';   // tappable weapon slots
  const base=$('joyBase'), knob=$('joyKnob');
  let joyId=-1;
  const setJoy=t=>{
    const r0=base.getBoundingClientRect();
    let dx=t.clientX-(r0.left+r0.width/2), dy=t.clientY-(r0.top+r0.height/2);
    const d=Math.hypot(dx,dy), max=r0.width/2-10;
    if(d>max){ dx*=max/d; dy*=max/d; }
    joyX=dx/max; joyY=dy/max;
    knob.style.transform=`translate(${dx}px,${dy}px)`;
  };
  base.addEventListener('touchstart', e=>{ e.preventDefault(); const t=e.changedTouches[0]; joyId=t.identifier; setJoy(t); }, {passive:false});
  base.addEventListener('touchmove', e=>{ e.preventDefault(); for(const t of e.changedTouches) if(t.identifier===joyId) setJoy(t); }, {passive:false});
  const joyEnd=e=>{ for(const t of e.changedTouches) if(t.identifier===joyId){ joyId=-1; joyX=joyY=0; knob.style.transform='translate(0,0)'; } };
  base.addEventListener('touchend', joyEnd); base.addEventListener('touchcancel', joyEnd);

  $('btnFire').addEventListener('touchstart', e=>{ e.preventDefault(); touchFire=true; }, {passive:false});
  $('btnFire').addEventListener('touchend', ()=>touchFire=false);
  $('btnFire').addEventListener('touchcancel', ()=>touchFire=false);
  $('btnJump').addEventListener('touchstart', e=>{ e.preventDefault(); keys['Space']=true; }, {passive:false});
  $('btnJump').addEventListener('touchend', ()=>keys['Space']=false);
  $('btnE').addEventListener('touchstart', e=>{ e.preventDefault(); if(inKart) exitKart(); else tryInteract(); }, {passive:false});
  $('btnBag').addEventListener('touchstart', e=>{ e.preventDefault(); if(running&&!gameOver&&player.alive&&!spectating) toggleInvOverlay(); }, {passive:false});
  $('btnWall').addEventListener('touchstart', e=>{ e.preventDefault(); placeStructure('wall'); }, {passive:false});
  $('btnRamp').addEventListener('touchstart', e=>{ e.preventDefault(); placeStructure('ramp'); }, {passive:false});
  $('btnCrouch').addEventListener('touchstart', e=>{ e.preventDefault(); touchCrouch=!touchCrouch; $('btnCrouch').style.background=touchCrouch?'rgba(124,252,0,.4)':'rgba(255,255,255,.14)'; }, {passive:false});
  $('btnGrap').addEventListener('touchstart', e=>{ e.preventDefault(); fireGrapple(); }, {passive:false});   // WAVE2
  document.addEventListener('gesturestart', e=>e.preventDefault());

  // right-side drag anywhere on the canvas = look
  let lookId=-1, lx=0, ly=0;
  renderer.domElement.addEventListener('touchstart', e=>{
    if(spectating){ if(performance.now()-specStart>3000) showEnd(deathTitle,deathStats); return; }
    for(const t of e.changedTouches){ if(lookId<0 && t.clientX>innerWidth*0.45){ lookId=t.identifier; lx=t.clientX; ly=t.clientY; } }
  }, {passive:true});
  renderer.domElement.addEventListener('touchmove', e=>{
    e.preventDefault();
    for(const t of e.changedTouches) if(t.identifier===lookId){
      const s=.0044*(camera.fov/80);
      player.yaw -= (t.clientX-lx)*s;
      player.pitch = clamp(player.pitch-(t.clientY-ly)*s, -1.45, 1.45);
      lx=t.clientX; ly=t.clientY;
    }
  }, {passive:false});
  const lookEnd=e=>{ for(const t of e.changedTouches) if(t.identifier===lookId) lookId=-1; };
  renderer.domElement.addEventListener('touchend', lookEnd);
  renderer.domElement.addEventListener('touchcancel', lookEnd);
}

invReset(); buildViewmodel(); updateBars();
loop();
})();
