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

/* ---------- Danieru Arena: mini game fight bergaya "Langit Tenang", satu hero per tema ---------- */
const H={
 dark:{n:'Umbra',c:'#7c5cff',sk:'Shadow Dash',w:'Katana',sky:['#1b1446','#6b4a9a','#e48a8a'],o:'#2b2f6b',s:'#e63946',hc:'#2a1f4a',ec:'#ff4d6d',a:'cape'},
 light:{n:'Lumi',c:'#ffb703',sk:'Nova Cahaya',w:'Tongkat Cahaya',sky:['#3a5a9a','#f2a65a','#ffe29a'],o:'#f3e3b0',s:'#ff8a00',hc:'#ffd36b',ec:'#4aa8ff',a:'halo'},
 onepiece:{n:'Kapten Layar',c:'#19a7ce',sk:'Pukulan Karet',w:'Pedang Layar',sky:['#14507a','#ff9a5a','#ffd27a'],o:'#14507a',s:'#ffd166',hc:'#1b1b1b',ec:'#6bd36b',a:'bandana'},
 zio:{n:'Kronos',c:'#ff2d9a',sk:'Henti Waktu',w:'Pedang Waktu',sky:['#1b0b2e','#7a2a7a','#ff7ab0'],o:'#3a1a5a',s:'#edc95e',hc:'#e8e8ff',ec:'#ff2d9a',a:'clock'},
 spider:{n:'Webby',c:'#e62429',sk:'Tembak Jaring',w:'Belati Jaring',sky:['#0b1a3a','#2a4aa0','#e66a6a'],o:'#232a4a',s:'#ff7a1a',hc:'#1de9b6',ec:'#ffd23f',a:'goggles'}};
const SEC={dark:'glitch',light:'disco',onepiece:'dot',zio:'matrix',spider:'konami'};
const arena=mk(B,'dialog','fx-arena');let stopArena=()=>{};
arena.addEventListener('close',()=>stopArena());
function openArena(){
 let hk=H[B.dataset.theme]?B.dataset.theme:'dark';
 arena.innerHTML=`<div class="ar-top"><b>Langit Tenang · Arena</b><span id="arS"></span><button class="rx" data-x>Tutup ×</button></div><div class="ar-pick">${Object.keys(H).map(k=>`<button data-h="${k}" style="--c:${H[k].c}">${H[k].n}</button>`).join('')}</div><canvas id="arC" width="800" height="450"></canvas><div class="ar-w"><button data-w="0" id="arW0"></button><button data-w="1">Senapan 2</button></div><div class="ar-hud" id="arH"></div><div class="ar-help">Gerak <kbd>A</kbd><kbd>D</kbd> · Lompat <kbd>W</kbd> · Serang <kbd>J</kbd> · Senjata <kbd>1</kbd><kbd>2</kbd> · Skill <kbd>K</kbd> · Ultimate <kbd>L</kbd> (form rahasia)</div><div class="ar-touch">${[['a','◀'],['d','▶'],['w','⤒'],['j','⚔'],['k','✦'],['l','★']].map(([k,t])=>`<button data-key="${k}">${t}</button>`).join('')}</div>`;
 const cv=$('#arC'),g=cv.getContext('2d'),W=800,CH=450,GY=385,keys={},M={arrowleft:'a',arrowright:'d',arrowup:'w',' ':'w'};
 let P,E,F,BU,OR,S,wave,score,over,wt,el,last=performance.now(),raf;
 const kd=e=>{const k=M[e.key.toLowerCase()]||e.key.toLowerCase();keys[k]=1;if(k.length==1&&'wasdjkl'.includes(k))e.preventDefault()},ku=e=>{keys[M[e.key.toLowerCase()]||e.key.toLowerCase()]=0};
 document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
 stopArena=()=>{cancelAnimationFrame(raf);document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);stopArena=()=>{}};
 const fx=(x,y,c,n=10)=>{for(let i=0;i<n;i++)F.push({x,y,vx:(Math.random()-.5)*300,vy:-Math.random()*250,l:.5,c})};
 const cy=e=>e.u?e.y:e.y-20;
 function wv(){wave++;if(wave>5){over=2;arp([523,659,784,1047,1319],.3,'triangle',.16,.1);return}
  for(let i=0;i<4+wave*2;i++)E.push({x:i%2?-40-i*50:W+40+i*50,y:GY,hp:16+wave*3,mx:16+wave*3,sp:45+Math.random()*30+wave*3,w:30,h:40,cd:0,fz:0,sl:0});
  if(wave===5)E.push({u:1,x:W/2,y:GY-95,hp:170,mx:170,w:110,h:50,tt:0,sh:2,cd:0,fz:0,sl:0})}
 function start(){const h=H[hk],sc=own.includes(SEC[hk]);
  P={x:120,y:GY,vy:0,hp:100,f:1,ac:0,sk:0,ul:0,inv:0,w:0,mv:0,sc};P.img=new Image();P.img.onload=()=>{P.ok=1};P.img.src='heroes/'+hk+'.png';E=[];F=[];BU=[];OR=[];wave=0;score=0;over=0;wt=0;el=0;
  S={st:Array.from({length:70},()=>[Math.random()*W,Math.random()*230,Math.random()*2+.5]),gr:Array.from({length:140},()=>[Math.random()*W,GY-14+Math.random()*(CH-GY+10)])};
  wv();$('#arW0').textContent=h.w+' 1';$('#arS').textContent=sc?'✦ FORM RAHASIA AKTIF':'Form rahasia: buka karakter '+CH[SEC[hk]][0]}
 function hit(x,r,d){const dm=d*(P.sc?1.5:1);E.forEach(e=>{if(Math.abs(e.x-x)<r+e.w/2&&Math.abs(cy(e)-(P.y-34))<75){e.hp-=dm;if(!e.u)e.x+=P.f*14;fx(e.x,cy(e),H[hk].c,5);SFX.tick()}})}
 function step(dt){
  if(over){if(keys.j)start();return}
  el+=dt;const dir=(keys.d?1:0)-(keys.a?1:0);P.mv=dir;P.x=Math.max(20,Math.min(W-20,P.x+dir*230*dt));if(dir)P.f=dir;
  if(keys.w&&P.y>=GY)P.vy=-540;P.vy+=1500*dt;P.y=Math.min(GY,P.y+P.vy*dt);
  P.ac-=dt;P.sk-=dt;P.ul-=dt;P.inv-=dt;if(keys['1'])P.w=0;if(keys['2'])P.w=1;
  if(keys.j&&P.ac<=0){if(P.w){P.ac=.22;BU.push({x:P.x+P.f*34,y:P.y-34,vx:P.f*650});tone(500,.05,'square',.1,0,200)}else{P.ac=.28;hit(P.x+P.f*42,56,10);tone(260,.06,'square',.12,0,140)}}
  if(keys.k&&P.sk<=0){P.sk=5;if(hk==='dark'){P.x=Math.max(20,Math.min(W-20,P.x+P.f*260));P.inv=.5;hit(P.x-P.f*130,140,30)}else if(hk==='light'){hit(P.x,210,24);P.hp=Math.min(100,P.hp+15)}else if(hk==='onepiece')hit(P.x+P.f*180,150,30);else if(hk==='zio')E.forEach(e=>e.fz=3);else E.forEach(e=>{if(Math.abs(e.x-P.x)<340){e.sl=4;e.hp-=15}});fx(P.x,P.y-30,H[hk].c,24);arp([392,587,784],.2,'sawtooth',.12,.05)}
  if(keys.l&&P.sc&&P.ul<=0){P.ul=12;E.forEach(e=>e.hp-=45);fx(W/2,GY-40,'#ffd166',60);arp([262,330,392,523,659,784],.3,'triangle',.16,.05);$('.main')?.classList.add('fx-shake');setTimeout(()=>$('.main')?.classList.remove('fx-shake'),550)}
  BU.forEach(b=>{b.x+=b.vx*dt;E.forEach(e=>{if(!b.d&&Math.abs(b.x-e.x)<e.w/2&&Math.abs(b.y-cy(e))<e.h/2+8){e.hp-=8*(P.sc?1.5:1);b.d=1;fx(b.x,b.y,'#ffe27a',4);SFX.tick()}})});BU=BU.filter(b=>!b.d&&b.x>0&&b.x<W);
  E.forEach(e=>{e.cd-=dt;if(e.fz>0){e.fz-=dt;return}e.sl-=dt;
   if(e.u){e.tt+=dt;e.x=W/2+Math.sin(e.tt*.7)*(W/2-90);e.y=GY-95+Math.sin(e.tt*1.3)*40;e.sh-=dt;if(e.sh<=0){e.sh=2.2;const a=Math.atan2(P.y-34-e.y,P.x-e.x);OR.push({x:e.x,y:e.y+10,vx:Math.cos(a)*230,vy:Math.sin(a)*230});tone(700,.2,'sine',.12,0,200)}return}
   const d=P.x-e.x;e.x+=Math.sign(d)*e.sp*(e.sl>0?.3:1)*dt;
   if(Math.abs(d)<e.w/2+14&&Math.abs(P.y-e.y)<50&&e.cd<=0&&P.inv<=0){P.hp-=7;e.cd=1;P.inv=.6;fx(P.x,P.y-30,'#f33',8);tone(120,.15,'sawtooth',.15,0,60)}});
  OR.forEach(o=>{o.x+=o.vx*dt;o.y+=o.vy*dt;if(Math.hypot(o.x-P.x,o.y-(P.y-34))<20&&P.inv<=0){P.hp-=10;P.inv=.6;o.d=1;fx(P.x,P.y-30,'#f6c',8);tone(120,.15,'sawtooth',.15,0,60)}});OR=OR.filter(o=>!o.d&&o.x>-20&&o.x<W+20&&o.y<CH);
  E=E.filter(e=>{if(e.hp>0)return true;score+=e.u?100:10;fx(e.x,cy(e),'#fff',e.u?40:12);return false});
  if(!E.length){wt+=dt;if(wt>.9){wt=0;wv()}}
  if(P.hp<=0){over=1;arp([300,220,160,100],.3,'sawtooth',.14,.15)}}
 function bg(h){
  const sk=g.createLinearGradient(0,0,0,CH);sk.addColorStop(0,h.sky[0]);sk.addColorStop(.55,h.sky[1]);sk.addColorStop(1,h.sky[2]);g.fillStyle=sk;g.fillRect(0,0,W,CH);
  g.fillStyle='#fff';S.st.forEach(([x,y,r])=>{g.globalAlpha=.4+.6*Math.abs(Math.sin(el*1.5+x));g.fillRect(x,y,r,r)});g.globalAlpha=1;
  g.fillStyle='#ffe9c8';g.beginPath();g.arc(690,350,26,0,7);g.fill();
  g.fillStyle='rgba(170,150,220,.5)';[[90,100],[420,70],[640,150]].forEach(([x,y],i)=>{const cx=(x+el*(6+i*3))%(W+200)-100;[[0,0,34],[30,6,28],[-30,8,24]].forEach(([a,b,r])=>{g.beginPath();g.ellipse(cx+a,y+b,r*1.3,r*.6,0,0,7);g.fill()})});
  g.fillStyle='#34447a';g.beginPath();g.moveTo(0,CH);for(let x=0;x<=W;x+=20)g.lineTo(x,330+Math.sin(x/130)*34+Math.sin(x/47)*6);g.lineTo(W,CH);g.fill();
  g.fillStyle='#2e5a48';g.beginPath();g.moveTo(0,CH);for(let x=0;x<=W;x+=20)g.lineTo(x,365+Math.sin(x/90+2)*14);g.lineTo(W,CH);g.fill();
  g.fillStyle='#2f6b45';g.fillRect(0,GY-6,W,CH-GY+6);g.strokeStyle='#58a867';g.lineWidth=2;S.gr.forEach(([x,y])=>{g.beginPath();g.moveTo(x,y+8);g.lineTo(x+Math.sin(el*2+x)*3,y-4);g.stroke()})}
 function hero(x,y,f,h,sc,mv,sw,gun){
  const ol='#14121f',L=mv?Math.sin(el*14)*5:0,fl=Math.sin(el*6)*4,sf={dark:'#e63946',light:'#ffffff',onepiece:'#ffd166',zio:'#ff2d9a',spider:'#77ffff'}[hk],bl=(fn,c)=>{g.fillStyle=c;g.beginPath();fn();g.fill();g.stroke()};
  g.save();g.translate(x,y);g.scale(f,1);if(sc){g.shadowColor='#ffd166';g.shadowBlur=26}g.lineJoin='round';g.lineWidth=2;g.strokeStyle=ol;
  if(h.a==='clock'){g.save();g.strokeStyle=h.s;g.lineWidth=3;g.beginPath();g.arc(-4,-38,20,0,7);g.stroke();g.translate(-4,-38);g.rotate(el*2);g.fillStyle=h.c;g.fillRect(-1.5,-18,3,18);g.restore()}
  if(h.a==='halo')bl(()=>{g.moveTo(-5,-42);g.quadraticCurveTo(-30,-58+fl,-26,-26);g.quadraticCurveTo(-14,-32,-5,-28);g.closePath()},'#ffffffcc');
  bl(()=>{g.moveTo(-5,-40);g.quadraticCurveTo(-18,-40+fl,-28,-30+fl);g.lineTo(-24,-26+fl);g.quadraticCurveTo(-14,-33,-3,-34);g.closePath()},sc?'#ffd166':sf);
  bl(()=>g.roundRect(-8+L,-18,7,18,3),'#1c1c3a');bl(()=>g.roundRect(2-L,-18,7,18,3),'#1c1c3a');
  bl(()=>g.roundRect(-10,-44,20,28,6),h.o);g.fillStyle=h.s;g.fillRect(-10,-28,20,4);g.strokeRect(-10,-28,20,4);
  bl(()=>g.arc(0,-54,11,0,7),'#f2c9a0');
  bl(()=>{g.arc(0,-56,11.5,Math.PI,0);g.closePath()},sc?'#fff2b8':h.hc);
  g.fillStyle=h.s;g.fillRect(-11.5,-58,23,4);g.strokeRect(-11.5,-58,23,4);
  if(h.a==='goggles')[-5,6].forEach(gx=>bl(()=>g.arc(gx,-60,4,0,7),'#77ffff'));
  if(h.a==='bandana')bl(()=>{g.moveTo(-11,-56);g.lineTo(-22,-52+fl);g.lineTo(-17,-47+fl);g.closePath()},h.s);
  g.fillStyle='#111';g.fillRect(3,-53,3,4);
  if(h.a==='halo'||sc){g.strokeStyle='#ffd166';g.lineWidth=3;g.beginPath();g.ellipse(0,-72,11,3.5,0,0,7);g.stroke();g.strokeStyle=ol;g.lineWidth=2}
  g.save();g.translate(8,-36);g.rotate(sw);bl(()=>g.roundRect(0,-3,12,6,3),'#f2c9a0');
  if(gun){bl(()=>g.roundRect(7,-7,24,8,2),'#3a3a4a');g.fillStyle=h.c;g.fillRect(27,-5,5,5)}
  else{g.lineCap='round';g.strokeStyle=ol;g.lineWidth=6;g.beginPath();g.moveTo(12,0);g.lineTo(52,-6);g.stroke();g.strokeStyle='#eef4ff';g.lineWidth=3;g.beginPath();g.moveTo(12,0);g.lineTo(52,-6);g.stroke();g.strokeStyle=h.c;g.lineWidth=4;g.beginPath();g.moveTo(11,-4);g.lineTo(13,5);g.stroke()}
  g.restore();g.restore()}
 function alien(e){g.save();g.translate(e.x,e.y);const w=Math.sin(el*10+e.x)*3;g.fillStyle=e.fz>0?'#9ef':'#6fe36f';g.fillRect(-9+w,-8,6,8);g.fillRect(3-w,-8,6,8);g.beginPath();g.ellipse(0,-22,14,17,0,0,7);g.fill();
  g.fillStyle='#111';[-5,5].forEach(x=>{g.beginPath();g.ellipse(x,-25,3.5,5,0,0,7);g.fill()});g.fillStyle='#fff';[-6,4].forEach(x=>g.fillRect(x,-28,2,2));
  g.strokeStyle='#4a4';g.lineWidth=2;g.beginPath();g.moveTo(0,-38);g.lineTo(0,-46);g.stroke();g.fillStyle='#ff6';g.beginPath();g.arc(0,-47,3,0,7);g.fill();g.restore()}
 function ufo(e){g.save();g.translate(e.x,e.y);g.strokeStyle='#8ef8';g.lineWidth=3;g.beginPath();g.ellipse(0,0,70,42,0,0,7);g.stroke();
  g.fillStyle='#bfe9';g.beginPath();g.arc(0,-6,22,Math.PI,0);g.fill();g.fillStyle='#6fe36f';g.beginPath();g.arc(0,-12,10,0,7);g.fill();g.fillStyle='#111';[-4,4].forEach(x=>g.fillRect(x-1,-14,3,5));
  g.fillStyle=e.fz>0?'#9ef':'#3a4a8a';g.beginPath();g.ellipse(0,4,52,14,0,0,7);g.fill();for(let i=0;i<7;i++){g.fillStyle=(Math.floor(el*4)+i)%2?'#ff6':'#f6c';g.beginPath();g.arc(-36+i*12,5,2.5,0,7);g.fill()}
  g.fillStyle='#0008';g.fillRect(-40,-50,80,6);g.fillStyle='#f55';g.fillRect(-40,-50,80*Math.max(0,e.hp/e.mx),6);g.restore()}
 function draw(){
  const h=H[hk];bg(h);E.forEach(e=>e.u?ufo(e):alien(e));
  BU.forEach(b=>{g.fillStyle='#ffe27a';g.fillRect(b.x-6,b.y-2,12,4)});OR.forEach(o=>{g.shadowColor='#f6c';g.shadowBlur=14;g.fillStyle='#f6c';g.beginPath();g.arc(o.x,o.y,8,0,7);g.fill();g.shadowBlur=0});
  g.globalAlpha=P.inv>0?.5:1;const sw=P.w?-.15:P.ac>0?-1.5+(1-P.ac/.28)*2.4:-.4;if(P.ok){g.save();g.translate(P.x,P.y);g.scale(P.f,1);if(P.sc){g.shadowColor='#ffd166';g.shadowBlur=30}const r=P.img.width/P.img.height;g.drawImage(P.img,-45*r,-90,90*r,90);g.restore()}else hero(P.x,P.y,P.f,h,P.sc,P.mv&&P.y>=GY,sw,P.w);g.globalAlpha=1;
  F.forEach(p=>{g.globalAlpha=Math.max(0,p.l*2);g.fillStyle=p.c;g.fillRect(p.x,p.y,4,4)});g.globalAlpha=1;
  g.fillStyle='#fff';g.font='700 15px Space Grotesk,sans-serif';g.textAlign='left';g.fillText('HP',20,32);g.fillStyle='#0006';g.beginPath();g.roundRect(48,22,170,12,6);g.fill();g.fillStyle='#4ade80';g.beginPath();g.roundRect(48,22,Math.max(0,170*P.hp/100),12,6);g.fill();
  g.fillStyle='#fff';g.textAlign='center';g.font='700 24px Space Grotesk,sans-serif';g.fillText('Wave '+Math.min(wave,5)+'/5',W/2,36);g.font='15px DM Sans,sans-serif';g.fillText('Sisa pasukan: '+E.length,W/2,58);
  const m=306+Math.floor(el*6);g.textAlign='right';g.font='700 24px Space Grotesk,sans-serif';g.fillText(String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0'),W-20,36);g.font='15px DM Sans,sans-serif';g.fillText(['Subuh','Pagi','Siang','Sore','Malam'][Math.min(wave,5)-1],W-20,58);g.textAlign='left';
  if(over){g.fillStyle='#000a';g.fillRect(0,0,W,CH);g.fillStyle='#fff';g.textAlign='center';g.font='700 36px Space Grotesk,sans-serif';g.fillText((over==2?'MENANG! ':'GAME OVER · ')+'Skor '+score,W/2,200);g.font='16px DM Sans,sans-serif';g.fillText('Tekan J atau ⚔ untuk main lagi',W/2,235);g.textAlign='left'}
  arena.querySelectorAll('.ar-w button').forEach((b,i)=>b.classList.toggle('on',i===P.w));
  $('#arH').textContent=`Skor ${score} · K ${h.sk} ${P.sk>0?P.sk.toFixed(1)+'s':'SIAP'}${P.sc?' · L Ultimate '+(P.ul>0?P.ul.toFixed(0)+'s':'SIAP'):''}`}
 function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;step(dt);F.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=600*dt;p.l-=dt});F=F.filter(p=>p.l>0);draw();raf=requestAnimationFrame(loop)}
 arena.onclick=e=>{const b=e.target.closest('button');if(e.target===arena||(b&&b.dataset.x!==undefined)){arena.close();return}if(b?.dataset.h){hk=b.dataset.h;start()}if(b?.dataset.w)P.w=+b.dataset.w};
 arena.onpointerdown=e=>{const k=e.target.closest('[data-key]')?.dataset.key;if(k)keys[k]=1};
 arena.onpointerup=arena.onpointercancel=()=>['a','d','w','j','k','l'].forEach(k=>keys[k]=0);
 start();if(!arena.open)arena.showModal();raf=requestAnimationFrame(loop);
}
$('#dxR').insertAdjacentHTML('afterend','<button id="dxG" title="Arena (mini game)">⚔</button>');$('#dxG').onclick=openArena;
const _mm=$('#openMemoryGame');if(_mm){const b=document.createElement('button');b.type='button';b.className='arcade-launch';b.innerHTML='PLAY ARENA (FIGHT) <span>↗</span>';b.onclick=openArena;_mm.after(b)}

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
