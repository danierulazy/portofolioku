/* Danieru Space — enhance layer. Dimuat SETELAH script.js. Semua suara dibuat lewat WebAudio (tanpa file mp3). */
(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s),B=document.body,R=document.documentElement;
const ls={g:k=>{try{return localStorage.getItem(k)}catch(e){return null}},s:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
const CH={matrix:['Cipher','Hacker dari balik layar','Semua pintu punya celah. Tinggal cari kodenya.','#19e36b','Ketik nama film hacker klasik itu.',0],disco:['Groove','Penguasa lantai dansa','Hidup lebih enak dengan beat.','#ff4fd8','Ketik tempat berdansa dengan bola kilau.',1],danil:['Danieru','Si pembuat dunia ini','Belajar sesuatu. Buat sesuatu.','#ffb703','Ketik nama panggilanmu.',2],glitch:['Glitch','Bug yang jadi teman','Error itu fitur yang belum dimengerti.','#00e5ff','Klik judul besar 3× dengan cepat.',3],dot:['Dotty','Penjaga status online','Selalu available, selalu hijau!','#35e08a','Klik titik hijau 5×.',4],konami:['Pixel','Pahlawan 8-bit','Tiga puluh nyawa sudah cukup.','#ff6a3d','Masukkan kode klasik di keyboard.',5],logo:['AD Prime','Bentuk akhir sang kreator','Satu logo, seribu cerita.','#ffd166','Klik dua kali logo AD.',6]};
let eq=ls.g('dx-eq')||'',own=[];try{own=JSON.parse(ls.g('dx-chars')||'[]')}catch(e){}
const COL={dark:'#7c5cff',light:'#ffb703',onepiece:'#19a7ce',zio:'#ff2d9a',spider:'#e62429'};
const calm=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||/reduce/i.test(B.className+R.className);
const col=()=>(eq&&CH[eq]?CH[eq][3]:COL[B.dataset.theme])||COL.dark;
let ac,mg,sfxOn=ls.g('dx-sfx')!=='0',ambOn=ls.g('dx-amb')!=='0',vol=+(ls.g('dx-vol')||.7),stopAmb=()=>{};

/* ---------- Audio engine ---------- */
function C(){if(!ac){ac=new(window.AudioContext||window.webkitAudioContext)();mg=ac.createGain();mg.gain.value=vol*3;const k=ac.createDynamicsCompressor();mg.connect(k);k.connect(ac.destination);}if(ac.state==='suspended')ac.resume();return ac;}
function tone(f,d=.15,type='sine',g=.15,t0=0,to){if(!sfxOn&&!tone.f)return;const c=C(),t=c.currentTime+t0,o=c.createOscillator(),e=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(to)o.frequency.exponentialRampToValueAtTime(to,t+d);e.gain.setValueAtTime(g,t);e.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(e);e.connect(mg);o.start(t);o.stop(t+d+.05);}
function hiss(d=.4,f=800,g=.12,to){if(!sfxOn&&!tone.f)return;const c=C(),n=Math.floor(c.sampleRate*d),b=c.createBuffer(1,n,c.sampleRate),a=b.getChannelData(0),t=c.currentTime;for(let i=0;i<n;i++)a[i]=Math.random()*2-1;const s=c.createBufferSource(),q=c.createBiquadFilter(),e=c.createGain();s.buffer=b;q.type='bandpass';q.frequency.setValueAtTime(f,t);if(to)q.frequency.exponentialRampToValueAtTime(to,t+d);e.gain.setValueAtTime(g,t);e.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(q);q.connect(e);e.connect(mg);s.start(t);}
const arp=(a,d,ty='triangle',g=.14,s=.08)=>a.forEach((f,i)=>tone(f,d,ty,g,i*s));
const SFX={
 click:()=>tone(540,.07,'triangle',.1,0,380),
 tick:()=>tone(1100,.025,'sine',.03),
 win:()=>arp([523,659,784,1047,1319],.3),
 dark:()=>{tone(90,.7,'sawtooth',.1,0,40);hiss(.5,300,.06,2000)},
 light:()=>arp([784,988,1175,1568],.5,'sine',.12,.07),
 onepiece:()=>{hiss(.9,400,.1,1200);arp([392,494,587,784],.35,'triangle',.12,.12)},
 zio:()=>{for(let i=0;i<7;i++)tone(1400,.04,'square',.05,i*.07);tone(160,.9,'sawtooth',.09,.45,900)},
 spider:()=>{hiss(.25,5000,.18,500);tone(200,.35,'square',.12,.04,50)}
};
/* Backsound ambient: tiap tema punya suasana sendiri */
function ambient(t){
 stopAmb();if(!ambOn)return;
 const c=C(),g=c.createGain(),stops=[];g.gain.value=0;g.gain.linearRampToValueAtTime(.12,c.currentTime+2);g.connect(mg);
 const osc=(f,ty='sine')=>{const o=c.createOscillator();o.type=ty;o.frequency.value=f;o.connect(g);o.start();stops.push(()=>o.stop())};
 const iv=(fn,ms)=>{const i=setInterval(()=>{if(!ambOn)return;tone.f=1;fn();tone.f=0},ms);stops.push(()=>clearInterval(i))};
 if(t==='dark'){osc(55);osc(82.4);osc(110.5,'triangle')}
 else if(t==='light'){osc(261.6);osc(329.6);osc(392)}
 else if(t==='onepiece'){osc(98);osc(147);iv(()=>hiss(2.2,500,.05,200),3200)}
 else if(t==='zio')iv(()=>tone(1500,.02,'square',.05),1000);
 else iv(()=>{tone(60,.18,'sine',.25);tone(55,.2,'sine',.2,.22)},900);
 const sc={dark:[220,262,330,392],light:[523,659,784,988],onepiece:[392,494,587,784],zio:[349,466,698,932],spider:[330,392,494,659]}[t]||[392,494,587];
 iv(()=>tone(sc[Math.random()*sc.length|0],1.4,'sine',.25),1500);
 stopAmb=()=>{g.gain.setTargetAtTime(0,c.currentTime,.3);stops.forEach(f=>setTimeout(f,1500));stopAmb=()=>{}};
}

/* ---------- Visual FX ---------- */
let mx=innerWidth/2,my=innerHeight/2;
addEventListener('pointerdown',e=>{mx=e.clientX;my=e.clientY},true);
function burst(x,y,n=14,c=col()){
 if(calm())n=Math.min(n,4);
 for(let i=0;i<n;i++){const p=document.createElement('i'),a=Math.random()*6.28,r=40+Math.random()*90;p.className='fx-p';p.style.cssText=`left:${x}px;top:${y}px;--c:${c};--dx:${Math.cos(a)*r}px;--dy:${Math.sin(a)*r}px`;B.appendChild(p);setTimeout(()=>p.remove(),900);}
}
function wipe(t){
 if(calm())return;
 const w=document.createElement('div');w.className='fx-wipe';w.style.cssText=`--x:${mx}px;--y:${my}px;--c:${COL[t]}`;B.appendChild(w);setTimeout(()=>w.remove(),1300);
 burst(mx,my,28,COL[t]);
 const m=$('.main');m?.classList.add('fx-shake');setTimeout(()=>m?.classList.remove('fx-shake'),550);
}
/* ---------- Adegan transisi sinematik (menggantikan adegan lama) ---------- */
const img=q=>$(q)?.src||'';
const A=(el,kf,o={})=>el.animate(kf,{fill:'both',easing:'cubic-bezier(.2,.8,.2,1)',...o});
const mk=(p,tag,cls,css,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(css)e.style.cssText=css;if(html)e.innerHTML=html;p.appendChild(e);return e};
const cap=(s,t,d)=>A(mk(s,'div','cx-cap','',t),[{opacity:0,letterSpacing:'1em'},{opacity:1,letterSpacing:'.4em'}],{duration:900,delay:d});
function stage(bg,ms){document.querySelectorAll('.cx').forEach(e=>e.remove());const s=mk(B,'div','cx',`background:${bg}`);A(s,[{opacity:0},{opacity:1}],{duration:250});A(s,[{opacity:1},{opacity:0}],{duration:450,delay:ms-450,fill:'forwards'});setTimeout(()=>s.remove(),ms);return s}
const SCN={
onepiece(){
 const s=stage('linear-gradient(#ffd27a,#ff8a4c 38%,#0e5a86 39%,#04233d)',3800);
 const sun=mk(s,'div','','width:34vmin;height:34vmin;border-radius:50%;top:6%;background:radial-gradient(#fff6c8,#ffc94d 60%,transparent 70%)');A(sun,[{transform:'translateY(40vh) scale(.6)'},{transform:'none'}],{duration:1800});
 for(let i=0;i<3;i++){const w=mk(s,'div','',`left:-10%;right:-10%;bottom:${i*9-4}%;height:34%;background:radial-gradient(circle at 50% 100%,transparent 54%,rgba(255,255,255,${.2-i*.05}) 55% 58%,transparent 59%) 0 0/${90+i*40}px 60px repeat-x,linear-gradient(transparent,rgba(4,35,61,.85))`);A(w,[{transform:'translateX(0)'},{transform:`translateX(${i%2?'':'-'}90px)`}],{duration:1400,iterations:3,easing:'linear'})}
 ['.poster-a','.poster-b','.poster-c'].forEach((q,i)=>{
  const p=mk(s,'img','',`width:clamp(90px,19vw,240px);left:${[14,40,66][i]}%;top:22%;box-shadow:0 20px 50px #0008`);p.src=img(q);const r=[-9,3,10][i];
  A(p,[{transform:`translateY(-110vh) rotate(${r*4}deg) scale(1.5)`,opacity:0},{transform:`translateY(0) rotate(${r}deg)`,opacity:1,offset:.7},{transform:`translateY(-14px) rotate(${r}deg) scale(1.04)`,offset:.82},{transform:`translateY(0) rotate(${r}deg)`}],{duration:1100,delay:350+i*220});
  A(p,[{opacity:1},{opacity:0,transform:`translateY(-30vh) rotate(${r*2}deg)`}],{duration:500,delay:2900,fill:'forwards'});
  setTimeout(()=>{burst(innerWidth*[.24,.5,.76][i],innerHeight*.5,14,'#ffd27a');tone(70,.3,'sine',.5,0,40)},900+i*220)});
 const sh=mk(s,'img','','width:clamp(140px,22vw,300px);bottom:12%;left:0');sh.src=img('.sunny-ship');
 A(sh,[{transform:'translateX(-30vw) rotate(-3deg)'},{transform:'translateX(130vw) rotate(3deg)'}],{duration:3400,easing:'ease-in-out'});
 cap(s,'WELCOME ABOARD · GRAND LINE',1200)},
zio(){
 const s=stage('radial-gradient(circle,#2a1038,#07030d 70%)',3900),n=new Date(),H=n.getHours()%12,M=n.getMinutes(),S=n.getSeconds();
 for(let i=0;i<4;i++){const r=mk(s,'div','',`width:30vmin;height:30vmin;border-radius:50%;border:2px solid ${i%2?'#edc95e':'#ed35a7'}`);A(r,[{transform:'scale(.2)',opacity:.9},{transform:'scale(4)',opacity:0}],{duration:1800,delay:i*450,iterations:2,easing:'ease-out'})}
 const d=mk(s,'div','','width:min(70vmin,480px);height:min(70vmin,480px);border-radius:50%;border:4px solid #edc95e;box-shadow:0 0 60px #ed35a7,inset 0 0 60px #ed35a766;background:#12081c');
 A(d,[{transform:'scale(0) rotate(-360deg)',opacity:0},{transform:'none',opacity:1}],{duration:900});
 A(mk(d,'div','','inset:5%;border-radius:50%;border:3px dashed #ed35a7'),[{transform:'rotate(0)'},{transform:'rotate(-720deg)'}],{duration:3400,easing:'linear'});
 for(let i=0;i<12;i++)mk(d,'i','',`inset:0;transform:rotate(${i*30}deg)`,`<b style="position:absolute;left:calc(50% - 2px);top:7%;width:4px;height:6%;background:#edc95e"></b>`);
 [[(H+M/60)*30,'3px','30%','#edc95e'],[(M+S/60)*6,'3px','38%','#fff'],[S*6,'2px','42%','#ed35a7']].forEach(([a,w,l,c],i)=>{const h=mk(d,'div','','inset:0'),b=mk(h,'b','',`left:calc(50% - 1.5px);bottom:50%;width:${w};height:${l};background:${c};border-radius:4px;box-shadow:0 0 10px ${c}`);A(h,[{transform:`rotate(${a+1440*(i+1)}deg)`},{transform:`rotate(${a}deg)`}],{duration:2300,delay:500,easing:'cubic-bezier(.7,0,.2,1)'})});
 const tm=mk(d,'div','','left:0;right:0;top:62%;text-align:center;font:700 clamp(30px,7vw,56px) "Space Grotesk";text-shadow:0 0 25px #ed35a7'),f=x=>String(x).padStart(2,'0'),real=`${f(n.getHours())}:${f(M)}:${f(S)}`;
 let k=0;const iv=setInterval(()=>{k++;tm.textContent=k>26?real:real.replace(/\d/g,()=>Math.random()*10|0);if(k>26)clearInterval(iv)},100);
 for(let i=0;i<10;i++)tone(900+i*120,.05,'square',.08,i*.12);
 const w=mk(s,'img','','width:20vmin;right:7%;bottom:12%');w.src=img('.zio-watch');A(w,[{transform:'rotate(-180deg) scale(0)',opacity:0},{transform:'none',opacity:1}],{duration:1400,delay:1200});
 cap(s,'THE FUTURE IS IN YOUR HANDS',1500);
 A(mk(s,'div','','inset:0;background:#fff'),[{opacity:0},{opacity:0,offset:.8},{opacity:.9,offset:.9},{opacity:0}],{duration:3900})},
spider(){
 const s=stage('#07101f',3500);
 A(mk(s,'div','','inset:-10%;background:radial-gradient(#e6242966 22%,transparent 24%) 0 0/16px 16px'),[{transform:'scale(1.3)',opacity:0},{transform:'scale(1)',opacity:1}],{duration:700});
 A(mk(s,'div','','inset:-50%;background:repeating-conic-gradient(#0000 0 6deg,#3b9cff33 6deg 8deg)'),[{transform:'rotate(0) scale(.4)',opacity:0},{transform:'rotate(40deg) scale(1.2)',opacity:1}],{duration:3200});
 const rd=mk(s,'img','','width:min(120vmin,1000px);opacity:.8');rd.src=img('.spider-radial');A(rd,[{transform:'scale(.3) rotate(0)',opacity:0},{transform:'scale(1) rotate(25deg)',opacity:.8}],{duration:2600,delay:700});
 const b=mk(s,'img','','width:min(88vmin,760px)');b.src=img('.spider-burst');
 A(b,[{transform:'scale(.1) rotate(-25deg)',opacity:0},{transform:'scale(1.15) rotate(4deg)',opacity:1,offset:.45},{transform:'scale(1) rotate(0)',offset:.6},{transform:'scale(1.04)',opacity:1,offset:.9},{transform:'scale(1.3)',opacity:0}],{duration:2300,delay:850});
 [['#e62429','polygon(0 0,62% 0,38% 100%,0 100%)',-1],['#1a56ff','polygon(62% 0,100% 0,100% 100%,38% 100%)',1]].forEach(([c,cp,dr])=>A(mk(s,'div','',`inset:0;background:${c};clip-path:${cp}`),[{transform:`translateX(${dr*100}%)`},{transform:'none',offset:.35},{transform:'none',offset:.5},{transform:`translateX(${dr*100}%)`}],{duration:1300,easing:'cubic-bezier(.7,0,.2,1)'}));
 const t=mk(s,'div','','font:900 clamp(60px,16vw,170px) "Space Grotesk";color:#fff;-webkit-text-stroke:3px #000;text-shadow:6px 6px 0 #e62429,-6px -6px 0 #3b9cff',"THWIP!");
 A(t,[{transform:'scale(3) rotate(-14deg)',opacity:0},{transform:'scale(1) rotate(-6deg)',opacity:1,offset:.25},{transform:'scale(1.06) rotate(-6deg)',opacity:1,offset:.8},{transform:'scale(1.2) rotate(-6deg)',opacity:0}],{duration:1500,delay:1100});
 setTimeout(()=>{hiss(.25,5000,.2,500);tone(180,.3,'square',.15,0,50);burst(innerWidth/2,innerHeight/2,30,'#e62429');$('.main')?.classList.add('fx-shake');setTimeout(()=>$('.main')?.classList.remove('fx-shake'),550)},1100);
 cap(s,'FRIENDLY NEIGHBORHOOD CREATOR',1500)}
};
/* Bungkus applyTheme dari script.js: tambah wipe + SFX + ambient saat tema berganti */
const _a=window.applyTheme;
if(typeof _a==='function')window.applyTheme=function(t,a=true){
 const p=B.dataset.theme;_a.apply(this,arguments);
 const n=B.dataset.theme;R.style.setProperty('--fx',col());
 if(a&&n!==p){SCN[n]&&!calm()?SCN[n]():wipe(n);(SFX[n]||SFX.click)();ambient(n);}
};
R.style.setProperty('--fx',col());

/* ---------- Dock suara ---------- */
const dock=document.createElement('div');dock.className='fx-dock';
dock.innerHTML=`<button id="dxS" aria-pressed="${sfxOn}" title="Efek suara">SFX</button><button id="dxA" aria-pressed="${ambOn}" title="Backsound sesuai tema">BGM</button><button id="dxR" title="Karakter rahasia">★ <span id="dxN"></span></button><input id="dxV" type="range" min="0" max="1" step=".05" value="${vol}" aria-label="Volume efek">`;
B.appendChild(dock);
$('#dxS').onclick=e=>{sfxOn=!sfxOn;e.currentTarget.setAttribute('aria-pressed',sfxOn);ls.s('dx-sfx',sfxOn?'1':'0');SFX.click()};
$('#dxA').onclick=e=>{ambOn=!ambOn;e.currentTarget.setAttribute('aria-pressed',ambOn);ls.s('dx-amb',ambOn?'1':'0');ambOn?ambient(B.dataset.theme):stopAmb()};
$('#dxV').oninput=e=>{vol=+e.target.value;ls.s('dx-vol',vol);if(mg)mg.gain.value=vol*3};
['pointerdown','keydown'].forEach(ev=>addEventListener(ev,()=>{if(ambOn)ambient(B.dataset.theme)},{once:true}));

/* ---------- Karakter rahasia: tiap easter egg membuka 1 karakter ---------- */
function av(k){return avs(CH[k][3],CH[k][5],k)}
function avs(c,s,k){const e=[[24,40],[40,40]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="6" fill="#fff"/><circle cx="${x+1}" cy="${y+1}" r="3" fill="#111"/>`).join('');
 const acc=['<rect x="14" y="33" width="36" height="12" rx="6" fill="#0009" stroke="#fff" stroke-width="2"/>','<path d="M10 36a22 22 0 0144 0" fill="none" stroke="#fff" stroke-width="5"/><rect x="6" y="34" width="8" height="14" rx="4" fill="#fff"/><rect x="50" y="34" width="8" height="14" rx="4" fill="#fff"/>','<path d="M16 18l5-12 11 8 11-8 5 12z" fill="#ffd166" stroke="#fff"/>','<path d="M8 28h14M42 50h14M20 54h10" stroke="#fff" stroke-width="3"/>','<path d="M32 2l-5 14h10zM24 6l-3 12h8zM40 6l3 12h-8z" fill="#fff"/>','<path d="M12 12h40v6H12zM18 6h8v4h-8zM38 6h8v4h-8z" fill="#fff"/>','<ellipse cx="32" cy="7" rx="16" ry="4" fill="none" stroke="#ffd166" stroke-width="3"/>'][s];
 return `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><radialGradient id="g${k}" cx=".35" cy=".3"><stop offset="0" stop-color="#fff"/><stop offset=".25" stop-color="${c}"/><stop offset="1" stop-color="#0007"/></radialGradient></defs><circle cx="32" cy="36" r="26" fill="url(#g${k})"/>${e}<path d="M24 50q8 6 16 0" stroke="#111" stroke-width="3" fill="none" stroke-linecap="round"/>${acc}</svg>`}
const ids=Object.keys(CH);let pet,pp={x:innerWidth/2,y:innerHeight/2},pq={x:pp.x,y:pp.y};
const save=()=>{ls.s('dx-chars',JSON.stringify(own));ls.s('dx-eq',eq)};
const note=t=>{const e=$('#toast');if(e){e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),3200)}};
const upd=()=>{$('#dxN').textContent=own.length+'/'+ids.length};
function mkPet(){pet?.remove();pet=null;R.style.setProperty('--fx',col());if(eq&&CH[eq])pet=mk(B,'div','fx-pet','',av(eq))}
(function loop(){if(pet){pq.x+=(pp.x-pq.x)*.12;pq.y+=(pp.y-pq.y)*.12;pet.style.transform=`translate(${pq.x+18}px,${pq.y+18}px)`}requestAnimationFrame(loop)})();
addEventListener('pointermove',e=>{pp.x=e.clientX;pp.y=e.clientY});
function giveChar(k){
 if(!CH[k]||own.includes(k))return;own.push(k);save();upd();
 const c=CH[k],s=stage('rgba(5,5,14,.88)',3400);
 A(mk(s,'div','cx-card',`--c:${c[3]}`,`<div class="cx-av">${av(k)}</div><small>SECRET CHARACTER UNLOCKED</small><b>${c[0]}</b><em>${c[1]}</em><p>“${c[2]}”</p>`),[{transform:'translateY(60px) scale(.6) rotate(-6deg)',opacity:0},{transform:'none',opacity:1}],{duration:900,easing:'cubic-bezier(.2,1.4,.3,1)'});
 burst(innerWidth/2,innerHeight/2,40,c[3]);arp([523,659,784,1047,1319,1568],.35,'triangle',.16,.1);
}
const dlg=mk(B,'dialog','fx-roster');
function roster(){
 dlg.innerHTML=`<h3>Karakter rahasia · ${own.length}/${ids.length}</h3><div class="rg">`+ids.map(k=>{const c=CH[k],on=own.includes(k);return `<article class="${on?'on':''} ${eq===k?'eq':''}" style="--c:${c[3]}"><div class="cx-av">${av(k)}</div><b>${on?c[0]:'???'}</b><small>${on?c[1]:c[4]}</small>${on?`<button data-k="${k}">${eq===k?'Lepas':'Pakai'}</button>`:''}</article>`}).join('')+`</div><button class="rx" data-x>Tutup ×</button>`;
 if(!dlg.open)dlg.showModal();
}
dlg.onclick=e=>{const b=e.target.closest('button');if(e.target===dlg||(b&&b.dataset.x!==undefined)){dlg.close();return}const k=b?.dataset.k;if(k){eq=eq===k?'':k;save();mkPet();if(eq)note(CH[k][0]+': “'+CH[k][2]+'”');SFX.win();roster()}};
$('#dxR').onclick=roster;
const vl=$('#vaultList');
if(vl)new MutationObserver(()=>['konami','logo'].forEach(k=>vl.querySelector(`[data-secret="${k}"]`)?.classList.contains('unlocked')&&giveChar(k))).observe(vl,{subtree:true,attributes:true,attributeFilter:['class']});
upd();mkPet();

/* ---------- Danieru Arena: mini game fight, satu hero per tema ---------- */
const H={dark:['Umbra','#7c5cff',0,'Shadow Dash'],light:['Lumi','#ffb703',6,'Nova Cahaya'],onepiece:['Kapten Layar','#19a7ce',2,'Pukulan Karet'],zio:['Kronos','#ff2d9a',5,'Henti Waktu'],spider:['Webby','#e62429',3,'Tembak Jaring']};
const SEC={dark:'glitch',light:'disco',onepiece:'dot',zio:'matrix',spider:'konami'};
const toImg=s=>{const i=new Image();i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" '));return i};
const arena=mk(B,'dialog','fx-arena');let stopArena=()=>{};
arena.addEventListener('close',()=>stopArena());
function openArena(){
 let hk=H[B.dataset.theme]?B.dataset.theme:'dark';
 arena.innerHTML=`<div class="ar-top"><b>Danieru Arena</b><span id="arS"></span><button class="rx" data-x>Tutup ×</button></div><div class="ar-pick">${Object.keys(H).map(k=>`<button data-h="${k}" style="--c:${H[k][1]}">${H[k][0]}</button>`).join('')}</div><canvas id="arC" width="800" height="360"></canvas><div class="ar-hud" id="arH"></div><div class="ar-help">Gerak <kbd>A</kbd><kbd>D</kbd> · Lompat <kbd>W</kbd> · Serang <kbd>J</kbd> · Skill <kbd>K</kbd> · Ultimate <kbd>L</kbd> (form rahasia)</div><div class="ar-touch">${[['a','◀'],['d','▶'],['w','⤒'],['j','⚔'],['k','✦'],['l','★']].map(([k,t])=>`<button data-key="${k}">${t}</button>`).join('')}</div>`;
 const cv=$('#arC'),g=cv.getContext('2d'),W=800,GY=300,keys={},M={arrowleft:'a',arrowright:'d',arrowup:'w',' ':'w'};
 let P,E,F,wave,score,over,wt,last=performance.now(),raf;
 const kd=e=>{const k=M[e.key.toLowerCase()]||e.key.toLowerCase();keys[k]=1;if('wasdjkl'.includes(k)&&k.length==1)e.preventDefault()},ku=e=>{keys[M[e.key.toLowerCase()]||e.key.toLowerCase()]=0};
 document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
 stopArena=()=>{cancelAnimationFrame(raf);document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);stopArena=()=>{}};
 const fx=(x,y,c,n=10)=>{for(let i=0;i<n;i++)F.push({x,y,vx:(Math.random()-.5)*300,vy:-Math.random()*250,l:.5,c})};
 function wv(){wave++;const n=wave%5?2+wave:1;for(let i=0;i<n;i++){const b=!(wave%5);E.push({x:i%2?-40-i*50:W+40+i*50,y:GY,hp:b?150+wave*10:18+wave*3,mx:b?150+wave*10:18+wave*3,sp:(b?35:45+Math.random()*30)+wave*2,w:b?70:34,cd:0,fz:0,sl:0,b})}}
 function start(){const h=H[hk],sc=own.includes(SEC[hk]);P={x:120,y:GY,vy:0,hp:100,f:1,ac:0,sk:0,ul:0,inv:0,sc,img:toImg(avs(sc?'#ffd166':h[1],sc?6:h[2],'a'+hk+sc))};E=[];F=[];wave=0;score=0;over=0;wt=0;wv();$('#arS').textContent=sc?'✦ FORM RAHASIA AKTIF':'Form rahasia: buka karakter '+CH[SEC[hk]][0]}
 function hit(cx,r,d){const dm=d*(P.sc?1.5:1);E.forEach(e=>{if(Math.abs(e.x-cx)<r+e.w/2&&Math.abs(e.y-P.y)<80){e.hp-=dm;e.x+=P.f*14;fx(e.x,e.y-20,H[hk][1],5);SFX.tick()}})}
 function step(dt){
  if(over){if(keys.j)start();return}
  const dir=(keys.d?1:0)-(keys.a?1:0);P.x=Math.max(20,Math.min(W-20,P.x+dir*230*dt));if(dir)P.f=dir;
  if(keys.w&&P.y>=GY)P.vy=-540;P.vy+=1500*dt;P.y=Math.min(GY,P.y+P.vy*dt);
  P.ac-=dt;P.sk-=dt;P.ul-=dt;P.inv-=dt;
  if(keys.j&&P.ac<=0){P.ac=.28;hit(P.x+P.f*42,52,10);tone(260,.06,'square',.12,0,140)}
  if(keys.k&&P.sk<=0){P.sk=5;const t=hk;if(t==='dark'){P.x=Math.max(20,Math.min(W-20,P.x+P.f*260));P.inv=.5;hit(P.x-P.f*130,140,30)}else if(t==='light'){hit(P.x,210,24);P.hp=Math.min(100,P.hp+15)}else if(t==='onepiece')hit(P.x+P.f*180,150,30);else if(t==='zio')E.forEach(e=>e.fz=3);else E.forEach(e=>{if(Math.abs(e.x-P.x)<340){e.sl=4;e.hp-=15}});fx(P.x,P.y-30,H[hk][1],24);arp([392,587,784],.2,'sawtooth',.12,.05)}
  if(keys.l&&P.sc&&P.ul<=0){P.ul=12;E.forEach(e=>e.hp-=45);fx(W/2,GY-40,'#ffd166',60);arp([262,330,392,523,659,784],.3,'triangle',.16,.05);$('.main')?.classList.add('fx-shake');setTimeout(()=>$('.main')?.classList.remove('fx-shake'),550)}
  E.forEach(e=>{e.cd-=dt;if(e.fz>0){e.fz-=dt;return}e.sl-=dt;const d=P.x-e.x;e.x+=Math.sign(d)*e.sp*(e.sl>0?.3:1)*dt;if(Math.abs(d)<e.w/2+14&&Math.abs(P.y-e.y)<50&&e.cd<=0&&P.inv<=0){P.hp-=e.b?14:7;e.cd=1;P.inv=.6;fx(P.x,P.y-30,'#f33',8);tone(120,.15,'sawtooth',.15,0,60)}});
  E=E.filter(e=>{if(e.hp>0)return true;score+=e.b?50:10;fx(e.x,e.y-20,'#fff',12);return false});
  if(!E.length){wt+=dt;if(wt>.9){wt=0;wv()}}
  if(P.hp<=0){over=1;arp([300,220,160,100],.3,'sawtooth',.14,.15)}
 }
 function draw(){
  const c=H[hk][1],gr=g.createLinearGradient(0,0,0,360);gr.addColorStop(0,'#07070f');gr.addColorStop(1,c+'66');g.fillStyle=gr;g.fillRect(0,0,W,360);g.fillStyle=c+'55';g.fillRect(0,GY+2,W,60);
  E.forEach(e=>{g.fillStyle=e.fz>0?'#8ef':e.b?'#7a2cff':'#e5484d';g.beginPath();g.roundRect(e.x-e.w/2,e.y-e.w,e.w,e.w,12);g.fill();g.fillStyle='#fff';g.fillRect(e.x-e.w/4,e.y-e.w*.65,5,7);g.fillRect(e.x+e.w/8,e.y-e.w*.65,5,7);g.fillStyle='#0008';g.fillRect(e.x-e.w/2,e.y-e.w-8,e.w,4);g.fillStyle='#4f4';g.fillRect(e.x-e.w/2,e.y-e.w-8,e.w*Math.max(0,e.hp/e.mx),4)});
  g.save();g.translate(P.x,P.y);if(P.f<0)g.scale(-1,1);if(P.inv>0)g.globalAlpha=.5;if(P.sc){g.shadowColor='#ffd166';g.shadowBlur=24}g.drawImage(P.img,-30,-62,60,60);g.restore();
  if(P.ac>.14){g.strokeStyle='#fff';g.lineWidth=4;g.beginPath();g.arc(P.x+P.f*34,P.y-30,26,P.f>0?-1:2.1,P.f>0?1:4.2);g.stroke()}
  F.forEach(p=>{g.globalAlpha=Math.max(0,p.l*2);g.fillStyle=p.c;g.fillRect(p.x,p.y,4,4)});g.globalAlpha=1;
  if(over){g.fillStyle='#000a';g.fillRect(0,0,W,360);g.fillStyle='#fff';g.textAlign='center';g.font='700 34px Space Grotesk,sans-serif';g.fillText('GAME OVER · Skor '+score,W/2,170);g.font='16px DM Sans,sans-serif';g.fillText('Tekan J atau ⚔ untuk main lagi',W/2,205);g.textAlign='left'}
  $('#arH').textContent=`HP ${Math.max(0,P.hp|0)} · Wave ${wave} · Skor ${score} · K ${H[hk][3]} ${P.sk>0?P.sk.toFixed(1)+'s':'SIAP'}${P.sc?' · L '+(P.ul>0?P.ul.toFixed(0)+'s':'SIAP'):''}`;
 }
 function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;step(dt);F.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=600*dt;p.l-=dt});F=F.filter(p=>p.l>0);draw();raf=requestAnimationFrame(loop)}
 arena.onclick=e=>{const b=e.target.closest('button');if(e.target===arena||(b&&b.dataset.x!==undefined)){arena.close();return}if(b?.dataset.h){hk=b.dataset.h;start()}};
 arena.onpointerdown=e=>{const k=e.target.closest('[data-key]')?.dataset.key;if(k)keys[k]=1};
 arena.onpointerup=arena.onpointercancel=()=>['a','d','w','j','k','l'].forEach(k=>keys[k]=0);
 start();if(!arena.open)arena.showModal();raf=requestAnimationFrame(loop);
}
$('#dxR').insertAdjacentHTML('afterend','<button id="dxG" title="Danieru Arena (mini game)">⚔</button>');$('#dxG').onclick=openArena;
const _mm=$('#openMemoryGame');if(_mm){const b=document.createElement('button');b.type='button';b.className='arcade-launch';b.innerHTML='PLAY DANIERU ARENA <span>↗</span>';b.onclick=openArena;_mm.after(b)}

/* ---------- Interaksi ---------- */
document.addEventListener('click',e=>{burst(e.clientX,e.clientY,6);if(e.target.closest('a,button,.work-card,.track'))SFX.click()},true);
let lt=0;
document.addEventListener('pointerover',e=>{const n=Date.now();if(ac&&n-lt>90&&e.target.closest?.('a,button,.work-card')){lt=n;SFX.tick()}},true);
if(!calm()){
 document.addEventListener('pointermove',e=>{const c=e.target.closest?.('.work-card,.portrait-frame');if(!c)return;const r=c.getBoundingClientRect();c.classList.add('fx-tilt');c.style.setProperty('--ry',((e.clientX-r.left)/r.width-.5)*10+'deg');c.style.setProperty('--rx',(.5-(e.clientY-r.top)/r.height)*10+'deg')});
 document.addEventListener('pointerout',e=>{const c=e.target.closest?.('.fx-tilt');if(c&&!c.contains(e.relatedTarget)){c.style.setProperty('--rx','0deg');c.style.setProperty('--ry','0deg')}});
}
const st=$('#secretUnlockToast');
if(st)new MutationObserver(()=>{if(st.classList.contains('show'))SFX.win()}).observe(st,{attributes:true,attributeFilter:['class']});

/* ---------- Easter egg baru (5) ---------- */
const EG=JSON.parse(ls.g('dx-eggs')||'[]');
function egg(k,msg){
 giveChar(k);
 if(!EG.includes(k)){EG.push(k);ls.s('dx-eggs',JSON.stringify(EG));}
 SFX.win();const t=$('#toast');
 if(t){t.textContent='✦ EGG '+EG.length+'/5 · '+msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3200);}
}
function confetti(){const c=['#ff2d9a','#ffb703','#19a7ce','#7c5cff','#e62429'];for(let i=0;i<5;i++)setTimeout(()=>burst(innerWidth*(.2+i*.15),innerHeight*.35,18,c[i]),i*120)}
function matrix(){
 const cv=document.createElement('canvas');cv.className='fx-matrix';cv.width=innerWidth;cv.height=innerHeight;B.appendChild(cv);
 const x=cv.getContext('2d'),y=Array(Math.floor(innerWidth/16)).fill(0),ch='ｱｲｳｴｵｶｷｸｹｺ01ADﾀﾁﾂ';
 const id=setInterval(()=>{x.fillStyle='rgba(0,0,0,.08)';x.fillRect(0,0,cv.width,cv.height);x.fillStyle=col();x.font='16px monospace';y.forEach((v,i)=>{x.fillText(ch[Math.random()*ch.length|0],i*16,v*16);y[i]=v*16>cv.height&&Math.random()>.97?0:v+1})},50);
 setTimeout(()=>{clearInterval(id);cv.classList.add('out');setTimeout(()=>cv.remove(),800)},7000);
}
const CODES={
 matrix:()=>{matrix();egg('matrix','Wake up, Danieru…')},
 disco:()=>{R.classList.add('fx-disco');arp([392,523,659,784,659,523],.2,'square',.07,.1);egg('disco','Disco mode!');setTimeout(()=>R.classList.remove('fx-disco'),8000)},
 danil:()=>{confetti();egg('danil','Hai, Danil!')}
};
let buf='';
document.addEventListener('keydown',e=>{
 if(e.target.matches?.('input,textarea')||e.key.length!==1)return;
 buf=(buf+e.key.toLowerCase()).slice(-8);
 for(const k in CODES)if(buf.endsWith(k)){buf='';CODES[k]()}
});
$('.hero h1')?.addEventListener('click',(()=>{let n=0,t;return()=>{n++;clearTimeout(t);t=setTimeout(()=>n=0,700);if(n>=3){n=0;const h=$('.hero h1');h.classList.add('fx-glitch');hiss(.4,2000,.15,300);setTimeout(()=>h.classList.remove('fx-glitch'),1200);egg('glitch','Glitch in the system')}}})());
$('.status-dot')?.addEventListener('click',(()=>{let n=0;return()=>{if(++n>=5){n=0;confetti();egg('dot','Tetap available!')}}})());
})();
