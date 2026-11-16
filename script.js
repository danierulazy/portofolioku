const $=(s,root=document)=>root.querySelector(s), $$=(s,root=document)=>[...root.querySelectorAll(s)];
const sidebar=$('#sidebar'),menuToggle=$('#menuToggle');
menuToggle?.addEventListener('click',()=>sidebar.classList.toggle('open'));
$$('.nav-link').forEach(link=>link.addEventListener('click',()=>{ $$('.nav-link').forEach(a=>a.classList.remove('active'));link.classList.add('active');sidebar.classList.remove('open');$('#currentSection').textContent=link.textContent.trim().toUpperCase();}));
const themeButton=$('#themeButton'),themePopover=$('#themePopover');
const themeTransition=$('#themeTransition');
let transitionTimer=null,clockTimer=null;
function syncThemeChoices(theme){
 $$('.theme-popover [data-theme-choice]').forEach(btn=>{
  const selected=btn.dataset.themeChoice===theme;
  btn.classList.toggle('selected',selected);
  btn.setAttribute('aria-pressed',String(selected));
  const check=btn.querySelector('.theme-check');
  if(check)check.textContent=selected?'✓':'';
 });
}
function updateZioClock(){
 const now=new Date(),time=$('#zioClock'),date=$('#zioDate');
 if(time)time.textContent=now.toLocaleTimeString('id-ID',{hour12:false});
 if(date)date.textContent=now.toLocaleDateString('en-GB',{weekday:'long',day:'2-digit',month:'long'}).toUpperCase();
 const seconds=now.getSeconds()+now.getMilliseconds()/1000,minutes=now.getMinutes()+seconds/60,hours=(now.getHours()%12)+minutes/60;
 const hour=$('#zioHourHand'),minute=$('#zioMinuteHand'),second=$('#zioSecondHand');
 if(hour)hour.style.transform='rotate('+(hours*30)+'deg)';
 if(minute)minute.style.transform='rotate('+(minutes*6)+'deg)';
 if(second)second.style.transform='rotate('+(seconds*6)+'deg)';
}
function showThemeTransition(theme){
 if(!themeTransition||!['zio','onepiece','spider'].includes(theme))return;
 themeTransition.className='theme-transition active show-'+theme;
 if(theme==='zio'){updateZioClock();clearInterval(clockTimer);clockTimer=setInterval(updateZioClock,250);}
 clearTimeout(transitionTimer);
 transitionTimer=setTimeout(()=>{themeTransition.classList.remove('active','show-zio','show-onepiece','show-spider');clearInterval(clockTimer);},4300);
 
}
function applyTheme(theme,animate=true){
 const allowed=['dark','light','onepiece','zio','spider'];
 if(!allowed.includes(theme))theme='dark';
 const previous=document.body.dataset.theme||'dark';
 document.body.dataset.theme=theme;
 try{localStorage.setItem('danieru-theme',theme);}catch(error){console.warn('Theme preference could not be saved:',error);}
 syncThemeChoices(theme);
 if(themePopover)themePopover.hidden=true;
 if(animate&&theme!==previous)showThemeTransition(theme);
 const selected=$('[data-theme-choice="'+theme+'"]');
 const toast=$('#toast');
 if(toast){toast.textContent='Atmosfer: '+(selected?.querySelector('b')?.textContent||theme);toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1600);}
}
if(themeButton&&themePopover){
 themeButton.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();themePopover.hidden=!themePopover.hidden;});
 themePopover.addEventListener('click',event=>{
  event.stopPropagation();
  const choice=event.target.closest('[data-theme-choice]');
  if(choice)applyTheme(choice.dataset.themeChoice,true);
 });
 $('#closeThemes')?.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();themePopover.hidden=true;});
 document.addEventListener('click',event=>{
  if(!themePopover.contains(event.target)&&!themeButton.contains(event.target))themePopover.hidden=true;
 });
}
let initialTheme='dark';
try{initialTheme=localStorage.getItem('danieru-theme')||document.body.dataset.theme||'dark';}catch(error){}
applyTheme(initialTheme,false);
let activeFilter='all';
function filterWorks(){const q=$('#searchInput').value.toLowerCase().trim();let shown=0;$$('.work-card').forEach(card=>{const matchFilter=activeFilter==='all'||card.dataset.category===activeFilter;const matchSearch=!q||(card.dataset.search+' '+card.innerText).toLowerCase().includes(q);card.hidden=!(matchFilter&&matchSearch);if(!card.hidden)shown++;});$('#resultCount').textContent=String(shown).padStart(2,'0')+' PROJECTS';$('#emptyState').hidden=shown!==0;}
$$('.filter').forEach(btn=>btn.addEventListener('click',()=>{$$('.filter').forEach(b=>b.classList.remove('active'));btn.classList.add('active');activeFilter=btn.dataset.filter;filterWorks();}));
$('#searchInput').addEventListener('input',filterWorks);
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#searchInput').focus();}if(e.key==='Escape'){themePopover.hidden=true;sidebar.classList.remove('open');}});
const audio=$('#audioPlayer');const tracks={song1:{title:'Letdown',artist:'Radiohead',src:'https://raw.githubusercontent.com/danierulazy/portofolio/main/song1.mp3'},song2:{title:'Impostor Syndrome',artist:'Sidney Gish',src:'https://raw.githubusercontent.com/danierulazy/portofolio/main/song2.mp3'}};
$$('.track').forEach(btn=>btn.addEventListener('click',()=>{const track=tracks[btn.dataset.track];if(!track)return;if(audio.src===track.src&&!audio.paused){audio.pause();btn.querySelector('.track-action').textContent='▶';$('#audioStatus').textContent='PAUSED';return;}audio.src=track.src;audio.play().then(()=>{$$('.track').forEach(b=>{b.classList.remove('active');b.querySelector('.track-action').textContent='▶';});btn.classList.add('active');btn.querySelector('.track-action').textContent='Ⅱ';$('#nowPlaying').textContent=track.title+' — '+track.artist;$('#audioStatus').textContent='NOW PLAYING';}).catch(()=>{$('#audioStatus').textContent='GAGAL MEMUAT AUDIO';});}));
audio.addEventListener('ended',()=>{$$('.track-action').forEach(x=>x.textContent='▶');$('#audioStatus').textContent='FINISHED';});
const sections=$$('main .section');const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){const id=entry.target.id;$$('.nav-link').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+id));$('#currentSection').textContent=id.toUpperCase();}}),{rootMargin:'-35% 0px -55% 0px'});sections.forEach(s=>observer.observe(s));
