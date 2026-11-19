/* Danieru Space — enhance layer. Dimuat SETELAH script.js. Semua suara dibuat lewat WebAudio (tanpa file mp3). */
(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s),B=document.body,R=document.documentElement;
const ls={g:k=>{try{return localStorage.getItem(k)}catch(e){return null}},s:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
const COL={dark:'#7c5cff',light:'#ffb703',onepiece:'#19a7ce',zio:'#ff2d9a',spider:'#e62429'};
const calm=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||/reduce/i.test(B.className+R.className);
const col=()=>COL[B.dataset.theme]||COL.dark;
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
/* Bungkus applyTheme dari script.js: tambah wipe + SFX + ambient saat tema berganti */
const _a=window.applyTheme;
if(typeof _a==='function')window.applyTheme=function(t,a=true){
 const p=B.dataset.theme;_a.apply(this,arguments);
 const n=B.dataset.theme;R.style.setProperty('--fx',COL[n]||COL.dark);
 if(a&&n!==p){wipe(n);(SFX[n]||SFX.click)();ambient(n);}
};
R.style.setProperty('--fx',col());

/* ---------- Dock suara ---------- */
const dock=document.createElement('div');dock.className='fx-dock';
dock.innerHTML=`<button id="dxS" aria-pressed="${sfxOn}" title="Efek suara">SFX</button><button id="dxA" aria-pressed="${ambOn}" title="Backsound sesuai tema">BGM</button><input id="dxV" type="range" min="0" max="1" step=".05" value="${vol}" aria-label="Volume efek">`;
B.appendChild(dock);
$('#dxS').onclick=e=>{sfxOn=!sfxOn;e.currentTarget.setAttribute('aria-pressed',sfxOn);ls.s('dx-sfx',sfxOn?'1':'0');SFX.click()};
$('#dxA').onclick=e=>{ambOn=!ambOn;e.currentTarget.setAttribute('aria-pressed',ambOn);ls.s('dx-amb',ambOn?'1':'0');ambOn?ambient(B.dataset.theme):stopAmb()};
$('#dxV').oninput=e=>{vol=+e.target.value;ls.s('dx-vol',vol);if(mg)mg.gain.value=vol*3};
['pointerdown','keydown'].forEach(ev=>addEventListener(ev,()=>{if(ambOn)ambient(B.dataset.theme)},{once:true}));

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
