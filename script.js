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


/* Project detail viewer: keyboard-accessible native dialog with previous/next navigation. */
(()=>{
 const dialog=$('#projectDialog');
 if(!dialog)return;
 const image=$('#projectDialogImage'),title=$('#projectDialogTitle'),description=$('#projectDialogDescription');
 const category=$('#projectDialogCategory'),tools=$('#projectDialogTools'),type=$('#projectDialogType');
 const link=$('#projectDialogLink'),counter=$('#projectCounter');
 const lightbox=$('#projectLightbox'),lightboxImage=$('#lightboxImage'),lightboxCaption=$('#lightboxCaption');
 const videoFrame=$('#projectDialogVideo'),videoPlay=$('#projectVideoPlay');
 const videoIds={'School Project':'d2ym3MhWYus','Gaming Video':'kfKSKs3OUXU'};
 function stopVideo(){if(videoFrame){videoFrame.src='';videoFrame.hidden=true;}if(videoPlay)videoPlay.hidden=true;image.hidden=false;}
 const cards=()=>$$('.work-card').filter(card=>!card.hidden);
 let activeCard=null;
 const detailCopy={
  'GFX Design':{description:'Eksplorasi desain grafis bertema anime dengan fokus pada komposisi, tipografi, warna, dan penyusunan elemen visual.',tools:'Graphic design · Digital tools'},
  'Photography':{description:'Kumpulan eksplorasi fotografi yang menonjolkan komposisi, pencahayaan, dan cara menangkap momen.',tools:'Camera · Composition · Lighting'},
  'School Project':{description:'Proyek video sekolah yang menggabungkan dokumentasi, penyuntingan, dan storytelling visual.',tools:'Video editing · Storytelling'},
  'Motion Graphic':{description:'Eksperimen visual bergerak untuk mengeksplorasi ritme, transisi, dan animasi grafis.',tools:'Motion design · Animation'},
  'Gaming Video':{description:'Konten video gaming dengan pendekatan editing dan storytelling yang ringan.',tools:'Video editing · YouTube'}
 };
 function render(card){
  if(!card)return;
  activeCard=card;
  const heading=$('h3',card),preview=$('.work-image img',card),kind=$('.work-type',card);
  const name=heading?.textContent.trim()||'Creative project';
  const details=detailCopy[name]||{description:'Eksplorasi karya kreatif dari Danieru.',tools:'Creative process'};
  title.textContent=name;
  description.textContent=details.description;
  tools.textContent=details.tools;
  type.textContent=card.dataset.category||'creative';
  category.textContent=kind?.textContent||'CREATIVE PROJECT';
  stopVideo();
  image.src=preview?.currentSrc||preview?.src||'';
  image.alt=preview?.alt||name;
  if(videoIds[name])videoPlay.hidden=false;
  const external=$('a[href]',card);
  if(external){link.href=external.href;link.hidden=false;link.textContent=card.dataset.category==='video'?'Watch video ↗':'Open project ↗';}
  else{link.hidden=true;link.removeAttribute('href');}
  const list=cards(),index=list.indexOf(card);
  counter.textContent=String(index+1).padStart(2,'0')+' / '+String(list.length).padStart(2,'0');
 }
 function open(card){render(card);if(!dialog.open)dialog.showModal();}
 function playVideo(){if(!activeCard||!videoIds[title.textContent]||!videoFrame)return;const id=videoIds[title.textContent];image.hidden=true;videoPlay.hidden=true;videoFrame.hidden=false;videoFrame.src='https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0&modestbranding=1';}
 function openLightbox(){if(!activeCard||!lightbox)return;lightboxImage.src=image.currentSrc||image.src;lightboxImage.alt=image.alt;lightboxCaption.textContent=(title.textContent+' — '+category.textContent).toUpperCase();if(!lightbox.open)lightbox.showModal();}
 function stepLightbox(direction){step(direction);lightboxImage.src=image.currentSrc||image.src;lightboxImage.alt=image.alt;lightboxCaption.textContent=(title.textContent+' — '+category.textContent).toUpperCase();}
 function step(direction){const list=cards();if(!list.length)return;let index=list.indexOf(activeCard);index=(index+direction+list.length)%list.length;render(list[index]);}
 $$('.work-card').forEach(card=>{
  card.setAttribute('tabindex','0');card.setAttribute('role','button');
  card.setAttribute('aria-label','Lihat detail '+($('h3',card)?.textContent.trim()||'proyek'));
 });
 $('.work-grid')?.addEventListener('click',event=>{
  const card=event.target.closest('.work-card');
  if(!card)return;
  if(event.target.closest('a'))event.preventDefault();
  open(card);
 });
 $('.work-grid')?.addEventListener('keydown',event=>{
  const card=event.target.closest('.work-card');
  if(!card)return;
  if(event.key==='Enter'||event.key===' '){event.preventDefault();open(card);}
 });
 $('#projectClose')?.addEventListener('click',()=>dialog.close());
 videoPlay?.addEventListener('click',playVideo);
 dialog.addEventListener('close',stopVideo);
 image?.addEventListener('click',openLightbox);
 $('#lightboxClose')?.addEventListener('click',()=>lightbox.close());
 $('#lightboxPrev')?.addEventListener('click',()=>stepLightbox(-1));
 $('#lightboxNext')?.addEventListener('click',()=>stepLightbox(1));
 lightbox?.addEventListener('click',event=>{if(event.target===lightbox)lightbox.close();});
 $('#projectPrev')?.addEventListener('click',()=>step(-1));
 $('#projectNext')?.addEventListener('click',()=>step(1));
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
 dialog.addEventListener('close',()=>{activeCard?.focus({preventScroll:true});});
 document.addEventListener('keydown',event=>{if(lightbox?.open){if(event.key==='ArrowLeft'){event.preventDefault();stepLightbox(-1);}if(event.key==='ArrowRight'){event.preventDefault();stepLightbox(1);}return;}if(!dialog.open)return;if(event.key==='ArrowLeft'){event.preventDefault();step(-1);}if(event.key==='ArrowRight'){event.preventDefault();step(1);}});
 document.querySelectorAll('[data-quick-index]').forEach(button=>button.addEventListener('click',()=>{const card=$('.work-card')[Number(button.dataset.quickIndex)];if(card)open(card);}));
 const quickTrack=$('#quickPicksTrack');
 $('#quickPrev')?.addEventListener('click',()=>quickTrack?.scrollBy({left:-quickTrack.clientWidth*.8,behavior:'smooth'}));
 $('#quickNext')?.addEventListener('click',()=>quickTrack?.scrollBy({left:quickTrack.clientWidth*.8,behavior:'smooth'}));
})();
