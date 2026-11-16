const $=(s,root=document)=>root.querySelector(s), $$=(s,root=document)=>[...root.querySelectorAll(s)];
const sidebar=$('#sidebar'),menuToggle=$('#menuToggle');
menuToggle?.addEventListener('click',()=>sidebar.classList.toggle('open'));
$$('.nav-link').forEach(link=>link.addEventListener('click',()=>{ $$('.nav-link').forEach(a=>a.classList.remove('active'));link.classList.add('active');sidebar.classList.remove('open');$('#currentSection').textContent=link.textContent.trim().toUpperCase();}));
const themeButton=$('#themeButton'),themePopover=$('#themePopover');
const themeTransition=$('#themeTransition');
let transitionTimer=null,clockTimer=null;
function syncThemeChoices(theme){
 $('[data-theme-choice]').forEach(btn=>{const selected=btn.dataset.themeChoice===theme;btn.classList.toggle('selected',selected);btn.setAttribute('aria-pressed',String(selected));const check=btn.querySelector('.theme-check');if(check)check.textContent=selected?'✓':'';});
}
function updateZioClock(){const now=new Date();$('#zioClock').textContent=now.toLocaleTimeString('id-ID',{hour12:false});$('#zioDate').textContent=now.toLocaleDateString('en-GB',{weekday:'long',day:'2-digit',month:'long'}).toUpperCase();}
function playThemeCue(theme){
 const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)return;
 const ctx=new AudioCtx(),now=ctx.currentTime,master=ctx.createGain();master.gain.setValueAtTime(.0001,now);master.gain.exponentialRampToValueAtTime(.16,now+.025);master.gain.exponentialRampToValueAtTime(.0001,now+1.7);master.connect(ctx.destination);
 const tone=(freq,start,duration,type='sine',volume=.5,slide=null)=>{const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(freq,now+start);if(slide)osc.frequency.exponentialRampToValueAtTime(slide,now+start+duration);gain.gain.setValueAtTime(.0001,now+start);gain.gain.exponentialRampToValueAtTime(volume,now+start+.025);gain.gain.exponentialRampToValueAtTime(.0001,now+start+duration);osc.connect(gain);gain.connect(master);osc.start(now+start);osc.stop(now+start+duration+.04);};
 if(theme==='zio'){tone(660,0,.48,'triangle',.65,990);tone(880,.22,.7,'sine',.42,1320);tone(440,.55,.8,'triangle',.45,660);tone(1320,.85,.35,'sine',.22);}
 else if(theme==='onepiece'){tone(180,0,.7,'sawtooth',.25,90);tone(520,.18,.45,'triangle',.45,780);tone(1040,.48,.8,'sine',.22,700);}
 else if(theme==='spider'){tone(880,0,.12,'sawtooth',.5,180);tone(220,.08,.38,'triangle',.5,660);tone(1320,.25,.28,'sine',.18,900);}
 else{tone(440,0,.28,'sine',.25,660);}
 setTimeout(()=>ctx.close().catch(()=>{}),2100);
}
function showThemeTransition(theme){
 if(!['zio','onepiece','spider'].includes(theme))return;
 themeTransition.className='theme-transition active show-'+theme;
 if(theme==='zio'){updateZioClock();clearInterval(clockTimer);clockTimer=setInterval(updateZioClock,1000);}
 clearTimeout(transitionTimer);transitionTimer=setTimeout(()=>{themeTransition.classList.remove('active');clearInterval(clockTimer);},3000);playThemeCue(theme);
}
themeButton.addEventListener('click',()=>themePopover.hidden=!themePopover.hidden);
$('#closeThemes').addEventListener('click',()=>themePopover.hidden=true);
$('[data-theme-choice]').forEach(btn=>btn.addEventListener('click',()=>{const theme=btn.dataset.themeChoice,previous=document.body.dataset.theme;document.body.dataset.theme=theme;localStorage.setItem('danieru-theme',theme);syncThemeChoices(theme);themePopover.hidden=true;if(theme!==previous)showThemeTransition(theme);$('#toast').textContent='Atmosfer: '+btn.querySelector('b').textContent;$('#toast').classList.add('show');setTimeout(()=>$('#toast').classList.remove('show'),1600);}));
const savedTheme=localStorage.getItem('danieru-theme');if(savedTheme)document.body.dataset.theme=savedTheme;
syncThemeChoices(document.body.dataset.theme||'dark');
document.addEventListener('click',e=>{if(!themePopover.contains(e.target)&&!themeButton.contains(e.target))themePopover.hidden=true;});
let activeFilter='all';
function filterWorks(){const q=$('#searchInput').value.toLowerCase().trim();let shown=0;$$('.work-card').forEach(card=>{const matchFilter=activeFilter==='all'||card.dataset.category===activeFilter;const matchSearch=!q||(card.dataset.search+' '+card.innerText).toLowerCase().includes(q);card.hidden=!(matchFilter&&matchSearch);if(!card.hidden)shown++;});$('#resultCount').textContent=String(shown).padStart(2,'0')+' PROJECTS';$('#emptyState').hidden=shown!==0;}
$$('.filter').forEach(btn=>btn.addEventListener('click',()=>{$$('.filter').forEach(b=>b.classList.remove('active'));btn.classList.add('active');activeFilter=btn.dataset.filter;filterWorks();}));
$('#searchInput').addEventListener('input',filterWorks);
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#searchInput').focus();}if(e.key==='Escape'){themePopover.hidden=true;sidebar.classList.remove('open');}});
const audio=$('#audioPlayer');const tracks={song1:{title:'Letdown',artist:'Radiohead',src:'https://raw.githubusercontent.com/danierulazy/portofolio/main/song1.mp3'},song2:{title:'Impostor Syndrome',artist:'Sidney Gish',src:'https://raw.githubusercontent.com/danierulazy/portofolio/main/song2.mp3'}};
$$('.track').forEach(btn=>btn.addEventListener('click',()=>{const track=tracks[btn.dataset.track];if(!track)return;if(audio.src===track.src&&!audio.paused){audio.pause();btn.querySelector('.track-action').textContent='▶';$('#audioStatus').textContent='PAUSED';return;}audio.src=track.src;audio.play().then(()=>{$$('.track').forEach(b=>{b.classList.remove('active');b.querySelector('.track-action').textContent='▶';});btn.classList.add('active');btn.querySelector('.track-action').textContent='Ⅱ';$('#nowPlaying').textContent=track.title+' — '+track.artist;$('#audioStatus').textContent='NOW PLAYING';}).catch(()=>{$('#audioStatus').textContent='GAGAL MEMUAT AUDIO';});}));
audio.addEventListener('ended',()=>{$$('.track-action').forEach(x=>x.textContent='▶');$('#audioStatus').textContent='FINISHED';});
const sections=$$('main .section');const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){const id=entry.target.id;$$('.nav-link').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+id));$('#currentSection').textContent=id.toUpperCase();}}),{rootMargin:'-35% 0px -55% 0px'});sections.forEach(s=>observer.observe(s));
