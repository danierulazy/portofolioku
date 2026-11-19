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
// Expose the theme controller so the optional enhancement layer can add cinematic effects.
window.applyTheme=applyTheme;
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


/* Smart Navigation + Command Center batch */
(()=>{
 const palette=$('#commandPalette'),input=$('#commandInput'),results=$('#commandResults');
 if(!palette||!input||!results)return;
 const sections=[
  {id:'home',title:'Beranda',desc:'Kembali ke halaman utama',icon:'⌂'},
  {id:'about',title:'Tentang Saya',desc:'Profil dan perjalanan kreatif',icon:'◉'},
  {id:'work',title:'Portfolio',desc:'Jelajahi seluruh karya',icon:'▧'},
  {id:'skills',title:'Keahlian',desc:'Skill dan creative tools',icon:'✳'},
  {id:'music',title:'Music Space',desc:'Playlist dan pemutar musik',icon:'♫'},
  {id:'games',title:'Games',desc:'Game dan hiburan',icon:'◈'},
  {id:'social',title:'Sosial Media',desc:'Temukan akun sosial',icon:'◎'},
  {id:'contact',title:'Kontak',desc:'Hubungi Ahmad Danil',icon:'↗'}
 ];
 const themeNames={dark:'Dark Modern',light:'Light Clean',onepiece:'One Piece / Grand Line',zio:'Kamen Rider Zi-O',spider:'Spider-Verse'};
 let items=[],activeIndex=0;
 const normalize=s=>(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 function fuzzyScore(query,target){
  const q=normalize(query),t=normalize(target);
  if(!q)return 1;
  if(t.includes(q))return 100-q.length;
  let qi=0,score=0,last=-1;
  for(let i=0;i<t.length&&qi<q.length;i++)if(t[i]===q[qi]){score+=last===i-1?5:2;last=i;qi++;}
  return qi===q.length?score-q.length*0.2:0;
 }
 function buildItems(){
  items=[];
  sections.forEach(s=>items.push({title:s.title,desc:s.desc,icon:s.icon,keywords:s.id+' navigation section',run:()=>goTo(s.id)}));
  $$('.work-card').forEach(card=>{const name=$('h3',card)?.textContent.trim()||'Project';items.push({title:name,desc:'Buka detail karya · '+(card.dataset.category||'creative'),icon:'▣',keywords:(card.dataset.search||'')+' '+card.innerText,run:()=>{card.hidden=false;$$('.filter').forEach(b=>b.classList.toggle('active',b.dataset.filter==='all'));document.querySelector('.filter[data-filter="all"]')?.click();card.scrollIntoView({behavior:'smooth',block:'center'});card.click();}});});
  Object.entries(themeNames).forEach(([key,name])=>items.push({title:'Tema: '+name,desc:'Ganti tampilan website',icon:'◐',keywords:'theme appearance color '+key,run:()=>applyTheme(key,true)}));
  items.push({title:'Kembali ke atas',desc:'Scroll ke bagian paling atas',icon:'↑',keywords:'top home scroll up',run:()=>window.scrollTo({top:0,behavior:'smooth'})});
  items.push({title:'Bersihkan pencarian',desc:'Hapus pencarian dan tampilkan semua karya',icon:'⌕',keywords:'clear reset search filter',run:()=>{const search=$('#searchInput');if(search){search.value='';search.dispatchEvent(new Event('input',{bubbles:true}));}document.querySelector('.filter[data-filter="all"]')?.click();goTo('work');}});
 }
 function goTo(id){const el=document.getElementById(id);if(el){el.scrollIntoView({behavior:'smooth',block:'start'});history.replaceState(null,'','#'+id);}}
 function render(){
  const q=input.value.trim();
  const matches=items.map((item,index)=>({item,index,score:fuzzyScore(q,item.title+' '+item.desc+' '+item.keywords)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,9);
  activeIndex=0;
  results.innerHTML='';
  if(!matches.length){results.innerHTML='<div class="command-empty">Tidak ada hasil. Coba kata kunci lain.</div>';return;}
  matches.forEach((match,i)=>{
   const button=document.createElement('button');button.type='button';button.className='command-item'+(i===0?' active':'');button.setAttribute('role','option');button.setAttribute('aria-selected',String(i===0));
   button.innerHTML='<span class="command-icon"></span><span class="command-item-copy"><b></b><small></small></span><kbd>↵</kbd>';
   $('.command-icon',button).textContent=match.item.icon;$('.command-item-copy b',button).textContent=match.item.title;$('.command-item-copy small',button).textContent=match.item.desc;
   button.addEventListener('click',()=>execute(match.item));results.append(button);
  });
 }
 function execute(item){palette.close();item.run();}
 function setActive(next){const buttons=$$('.command-item',results);if(!buttons.length)return;activeIndex=(next+buttons.length)%buttons.length;buttons.forEach((b,i)=>{b.classList.toggle('active',i===activeIndex);b.setAttribute('aria-selected',String(i===activeIndex));});buttons[activeIndex].scrollIntoView({block:'nearest'});}
 function open(){buildItems();input.value='';render();if(!palette.open)palette.showModal();requestAnimationFrame(()=>input.focus());}
 document.addEventListener('keydown',event=>{
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();if(palette.open)palette.close();else open();}
  if(event.key==='/'&&!palette.open&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)&&!document.activeElement.isContentEditable){event.preventDefault();$('#searchInput')?.focus();}
  if(!palette.open)return;
  if(event.key==='ArrowDown'){event.preventDefault();setActive(activeIndex+1);}
  if(event.key==='ArrowUp'){event.preventDefault();setActive(activeIndex-1);}
  if(event.key==='Enter'){event.preventDefault();const active=$('.command-item.active',results);active?.click();}
 });
 input.addEventListener('input',render);
 palette.addEventListener('click',event=>{if(event.target===palette)palette.close();});
 document.addEventListener('click',event=>{
  const anchor=event.target.closest('a[href^="#"]');
  if(!anchor)return;
  const id=anchor.getAttribute('href').slice(1),target=document.getElementById(id);
  if(target){event.preventDefault();goTo(id);sidebar?.classList.remove('open');}
 });
 const progress=$('#readingProgress'),topButton=$('#backToTop');
 let scheduled=false;
 function updateScrollUI(){
  const max=document.documentElement.scrollHeight-window.innerHeight;
  const percent=max>0?(window.scrollY/max)*100:0;
  if(progress)progress.style.width=percent+'%';
  if(topButton)topButton.classList.toggle('visible',window.scrollY>480);
  scheduled=false;
 }
 window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateScrollUI);}},{passive:true});
 window.addEventListener('resize',updateScrollUI,{passive:true});
 topButton?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
 updateScrollUI();
})();


/* Creator Dashboard + Persistent Music Player + Visual polish batch */
(()=>{
 const cards=$$('.work-card'),tools=$$('.tool-cloud span'),themeCount=$$('.theme-popover [data-theme-choice]').length;
 const values={projects:cards.length,fields:4,tools:tools.length,themes:themeCount||5};
 Object.entries(values).forEach(([key,value])=>{const node=$('[data-stat="'+key+'"]');if(node)node.textContent=String(value).padStart(2,'0');});
 $$('[data-focus]').forEach(button=>button.addEventListener('click',()=>{
  const type=button.dataset.focus;
  const filter=document.querySelector('.filter[data-filter="'+type+'"]');
  if(filter){filter.click();$('#work')?.scrollIntoView({behavior:'smooth',block:'start'});}
 }));
 const audio=$('#audioPlayer'),player=$('#persistentPlayer');
 if(audio&&player){
  const trackButtons=$$('.track'),miniTitle=$('#miniTitle'),miniArtist=$('#miniArtist'),miniCover=$('#miniCover');
  const miniPlay=$('#miniPlay'),seek=$('#miniSeek'),current=$('#miniCurrent'),duration=$('#miniDuration'),volume=$('#miniVolume');
  const trackOrder=trackButtons.map(b=>b.dataset.track).filter(Boolean);
  const trackMeta={song1:{title:'Letdown',artist:'Radiohead',cover:'https://raw.githubusercontent.com/danierulazy/portofolio/main/cover1.png'},song2:{title:'Impostor Syndrome',artist:'Sidney Gish',cover:'https://raw.githubusercontent.com/danierulazy/portofolio/main/cover2.png'}};
  let dismissed=false,seeking=false;
  const formatTime=value=>{if(!Number.isFinite(value))return'0:00';const m=Math.floor(value/60),s=Math.floor(value%60);return m+':'+String(s).padStart(2,'0');};
  function syncTrack(){
   const source=audio.currentSrc||audio.src;
   const id=trackOrder.find(key=>source.includes('/'+key+'.mp3'));
   const meta=trackMeta[id];
   if(meta){miniTitle.textContent=meta.title;miniArtist.textContent=meta.artist;miniCover.src=meta.cover;}
   trackButtons.forEach(button=>{const active=!!id&&button.dataset.track===id;button.classList.toggle('active',active);const icon=$('.track-action',button);if(icon)icon.textContent=active&&!audio.paused?'Ⅱ':'▶';});
   miniPlay.textContent=audio.paused?'▶':'Ⅱ';
   $('#nowPlaying').textContent=meta?meta.title+' — '+meta.artist:'Pilih lagu untuk memutar';
  }
  function showPlayer(){if(!dismissed){player.classList.add('visible');document.body.classList.add('player-open');}}
  function hidePlayer(){player.classList.remove('visible');document.body.classList.remove('player-open');dismissed=true;}
  audio.addEventListener('play',()=>{showPlayer();syncTrack();$('#audioStatus').textContent='NOW PLAYING';});
  audio.addEventListener('pause',()=>{syncTrack();if(!audio.ended)$('#audioStatus').textContent='PAUSED';});
  audio.addEventListener('loadedmetadata',()=>{duration.textContent=formatTime(audio.duration);});
  audio.addEventListener('timeupdate',()=>{current.textContent=formatTime(audio.currentTime);if(!seeking&&Number.isFinite(audio.duration)&&audio.duration>0)seek.value=String(Math.round(audio.currentTime/audio.duration*1000));});
  audio.addEventListener('ended',()=>{syncTrack();const index=trackOrder.findIndex(key=>audio.currentSrc.includes('/'+key+'.mp3'));if(index>=0&&index<trackOrder.length-1){const next=document.querySelector('.track[data-track="'+trackOrder[index+1]+'"]');next?.click();}else $('#audioStatus').textContent='FINISHED';});
  miniPlay.addEventListener('click',()=>{if(!audio.src){trackButtons[0]?.click();return;}if(audio.paused)audio.play().catch(()=>{});else audio.pause();});
  function changeTrack(direction){const index=trackOrder.findIndex(key=>(audio.currentSrc||audio.src).includes('/'+key+'.mp3'));const nextIndex=(index+direction+trackOrder.length)%trackOrder.length;const button=document.querySelector('.track[data-track="'+trackOrder[nextIndex]+'"]');if(button)button.click();}
  $('#miniPrev')?.addEventListener('click',()=>changeTrack(-1));
  $('#miniNext')?.addEventListener('click',()=>changeTrack(1));
  seek.addEventListener('input',()=>{seeking=true;if(Number.isFinite(audio.duration)){const time=Number(seek.value)/1000*audio.duration;current.textContent=formatTime(time);}});
  seek.addEventListener('change',()=>{if(Number.isFinite(audio.duration))audio.currentTime=Number(seek.value)/1000*audio.duration;seeking=false;});
  volume.addEventListener('input',()=>{audio.volume=Number(volume.value);});
  audio.volume=.8;
  $('#miniClose')?.addEventListener('click',hidePlayer);
  trackButtons.forEach(button=>button.addEventListener('click',()=>{dismissed=false;}));
 }
 // Subtle reveal-on-scroll; no external animation library required.
 const revealTargets=$$('.section-head,.about-card,.fact,.work-card,.skill-row,.tool-panel,.playlist-panel,.game-card,.social-grid>a,.contact-card,.dashboard-stat');
 if('IntersectionObserver'in window){
  revealTargets.forEach(el=>el.classList.add('reveal-ready'));
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target);}}),{threshold:.12,rootMargin:'0px 0px -35px 0px'});
  revealTargets.forEach(el=>observer.observe(el));
 }else revealTargets.forEach(el=>el.classList.add('revealed'));
 // Pointer tilt is deliberately restrained and disabled for touch / reduced-motion devices.
 const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(!reduceMotion&&window.matchMedia('(pointer:fine)').matches){
  $$('.work-card,.dashboard-stat,.game-card').forEach(card=>{
   card.addEventListener('pointermove',event=>{const rect=card.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;card.style.transform='perspective(850px) rotateX('+(-y*3)+'deg) rotateY('+(x*3)+'deg) translateY(-2px)';});
   card.addEventListener('pointerleave',()=>{card.style.transform='';});
  });
 }
})();


/* Portfolio Collection Manager — saved projects, share actions and contact helpers */
(()=>{
 const STORAGE_KEY='danieru-saved-projects-v1';
 let saved=new Set();
 try{const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');if(Array.isArray(parsed))saved=new Set(parsed.filter(x=>typeof x==='string'));}catch(error){console.warn('Saved projects unavailable:',error);}
 const cards=$$('.work-card'),count=$('#savedWorksCount'),saveButton=$('#projectSave'),shareButton=$('#projectShare');
 const getName=card=>$('h3',card)?.textContent.trim()||'Creative project';
 const persist=()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify([...saved]));}catch(error){console.warn('Could not save collection:',error);}updateCount();};
 function updateCount(){if(count)count.textContent=String(saved.size).padStart(2,'0');}
 function updateSaveButton(card){
  if(!saveButton||!card)return;
  const isSaved=saved.has(getName(card));
  saveButton.classList.toggle('is-saved',isSaved);
  saveButton.setAttribute('aria-pressed',String(isSaved));
  saveButton.textContent=isSaved?'♥ Tersimpan':'♡ Simpan';
 }
 function refreshSavedFilter(){
  const filter=$('#savedWorksFilter');
  if(filter)filter.querySelector('span').textContent=String(saved.size).padStart(2,'0');
 }
 function filterSaved(){
  const query=$('#searchInput')?.value.toLowerCase().trim()||'';
  let visible=0;
  cards.forEach(card=>{
   const name=getName(card),matches=saved.has(name)&&(!query||(card.dataset.search+' '+card.innerText).toLowerCase().includes(query));
   card.hidden=!matches;if(matches)visible++;
  });
  $('#resultCount').textContent=String(visible).padStart(2,'0')+' SAVED PROJECTS';
  $('#emptyState').hidden=visible!==0;
 }
 const allFilter=$('.filter[data-filter="all"]');
 $('#savedWorksFilter')?.addEventListener('click',()=>{
  $$('.filter').forEach(button=>button.classList.remove('active'));
  $('#savedWorksFilter').classList.add('active');
  window.__danieruSavedFilter=true;
  filterSaved();
 });
 $$('.filter').filter(button=>button.dataset.filter!=='saved').forEach(button=>button.addEventListener('click',()=>{window.__danieruSavedFilter=false;}));
 const originalFilter=window.filterWorks;
 // Keep saved state in sync with the existing project detail dialog.
 document.addEventListener('click',event=>{
  if(event.target.closest('#projectSave')){
   const dialog=$('#projectDialog'),name=$('#projectDialogTitle')?.textContent.trim();
   if(!name)return;
   if(saved.has(name))saved.delete(name);else saved.add(name);
   persist();updateSaveButton(cards.find(card=>getName(card)===name));
   if(window.__danieruSavedFilter)filterSaved();
  }
  if(event.target.closest('#projectShare')){
   const name=$('#projectDialogTitle')?.textContent.trim()||'Creative project';
   const url=location.href.split('#')[0]+'#work';
   const shareData={title:name+' — Danieru Portfolio',text:'Lihat karya '+name+' dari Danieru.',url};
   if(navigator.share){navigator.share(shareData).catch(()=>{});}
   else if(navigator.clipboard?.writeText){navigator.clipboard.writeText(url).then(()=>{const b=$('#projectShare');if(b){b.textContent='✓ Link disalin';setTimeout(()=>b.textContent='↗ Bagikan',1500);}}).catch(()=>{});}
  }
 });
 const dialog=$('#projectDialog');
 if(dialog&&saveButton){
  const observer=new MutationObserver(()=>{const name=$('#projectDialogTitle')?.textContent.trim();const card=cards.find(item=>getName(item)===name);if(card)updateSaveButton(card);});
  const title=$('#projectDialogTitle');if(title)observer.observe(title,{childList:true,characterData:true,subtree:true});
 }
 updateCount();refreshSavedFilter();
 $('#copyEmail')?.addEventListener('click',()=>{
  const button=$('#copyEmail'),email='danierulazy@gmail.com';
  if(navigator.clipboard?.writeText){navigator.clipboard.writeText(email).then(()=>{button.textContent='✓ Email Tersalin';setTimeout(()=>button.textContent='Salin Email ⧉',1800);}).catch(()=>{button.textContent=email;});}
  else button.textContent=email;
 });
 // Restore saved filter behavior when the user changes search text.
 $('#searchInput')?.addEventListener('input',()=>{if(window.__danieruSavedFilter)filterSaved();});
 updateCount();
})();


/* Batch 5 — Project Explorer, Creative Analytics and Display Preferences */
(()=>{
 const grid=$('.work-grid'),sort=$('#projectSort'),viewButtons=$$('.view-button'),clear=$('#clearProjectFilters');
 if(grid){
  const originalOrder=$$('.work-card',grid);
  function sortProjects(mode){
   const ordered=[...originalOrder];
   if(mode==='az')ordered.sort((a,b)=>a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent));
   if(mode==='za')ordered.sort((a,b)=>b.querySelector('h3').textContent.localeCompare(a.querySelector('h3').textContent));
   if(mode==='category')ordered.sort((a,b)=>a.dataset.category.localeCompare(b.dataset.category)||a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent));
   if(mode==='default')ordered.sort((a,b)=>originalOrder.indexOf(a)-originalOrder.indexOf(b));
   ordered.forEach(card=>grid.append(card));
  }
  sort?.addEventListener('change',()=>sortProjects(sort.value));
  viewButtons.forEach(button=>button.addEventListener('click',()=>{
   const list=button.dataset.view==='list';grid.classList.toggle('list-view',list);
   viewButtons.forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));});
   try{localStorage.setItem('danieru-project-view',list?'list':'grid');}catch(error){}
  }));
  try{if(localStorage.getItem('danieru-project-view')==='list')$('.view-button[data-view="list"]')?.click();}catch(error){}
  clear?.addEventListener('click',()=>{
   $('#searchInput').value='';
   $('#searchInput').dispatchEvent(new Event('input',{bubbles:true}));
   $('.filter[data-filter="all"]')?.click();
   if(sort){sort.value='default';sortProjects('default');}
   $('.view-button[data-view="grid"]')?.click();
  });
 }
 // Data-driven category analytics; it never invents extra projects or counts.
 const cards=$$('.work-card'),categories=[['design','Design'],['photo','Photography'],['video','Video'],['motion','Motion']];
 const chart=$('#analyticsChart'),legend=$('#analyticsLegend');
 if(chart&&legend){
  const total=cards.length;
  categories.forEach(([key,label])=>{
   const amount=cards.filter(card=>card.dataset.category===key).length;
   const percent=total?Math.round(amount/total*100):0;
   const bar=document.createElement('div');bar.className='analytics-bar';bar.style.setProperty('--bar-height',Math.max(percent,3)+'%');bar.title=label+': '+amount+' projects';
   const fill=document.createElement('i');const caption=document.createElement('span');caption.textContent=key.slice(0,3).toUpperCase();bar.append(fill,caption);chart.append(bar);
   const item=document.createElement('div');item.className='analytics-legend-item';item.innerHTML='<i></i><span></span><b></b>';item.children[1].textContent=label;item.children[2].textContent=String(amount).padStart(2,'0')+' · '+percent+'%';legend.append(item);
  });
  $('#analyticsTotal').textContent=String(total).padStart(2,'0')+' PROJECTS';
 }
 // Display preferences are local to the visitor's browser.
 const settings=$('#settingsDialog'),openSettings=$('#openSettings'),closeSettings=$('#closeSettings');
 const preferenceControls={reduceMotion:$('#settingReduceMotion'),highContrast:$('#settingHighContrast'),largeText:$('#settingLargeText')};
 const preferenceClasses={reduceMotion:'reduce-motion',highContrast:'high-contrast',largeText:'large-text'};
 function applyPreferences(){
  Object.entries(preferenceControls).forEach(([key,input])=>{
   const enabled=!!input?.checked;document.body.classList.toggle(preferenceClasses[key],enabled);
   try{localStorage.setItem('danieru-pref-'+key,enabled?'1':'0');}catch(error){}
  });
 }
 Object.entries(preferenceControls).forEach(([key,input])=>{
  if(!input)return;
  try{input.checked=localStorage.getItem('danieru-pref-'+key)==='1';}catch(error){}
  input.addEventListener('change',applyPreferences);
 });
 applyPreferences();
 openSettings?.addEventListener('click',()=>settings?.showModal());
 closeSettings?.addEventListener('click',()=>settings?.close());
 settings?.addEventListener('click',event=>{if(event.target===settings)settings.close();});
 // Current-section navigation indicator, including the hero section.
 const navLinks=$$('.nav-link');
 if('IntersectionObserver'in window){
  const sectionObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(!entry.isIntersecting)return;
   navLinks.forEach(link=>link.classList.toggle('active',link.getAttribute('href')==='#'+entry.target.id));
   const current=$('#currentSection');if(current)current.textContent=entry.target.id.toUpperCase();
  }),{rootMargin:'-35% 0px -55% 0px'});
  ['home','about','work','skills','music','games','social','contact'].forEach(id=>{const section=document.getElementById(id);if(section)sectionObserver.observe(section);});
 }
})();


/* Danieru Universe Experience — intro controls, flip ID and summon hub */
(()=>{
 const intro=$('#danieruIntro'),enter=$('#enterUniverse'),skip=$('#skipIntro');
 if(intro){
  let alreadySeen=false;
  try{alreadySeen=sessionStorage.getItem('danieru-intro-seen')==='1';}catch(error){}
  if(alreadySeen)intro.classList.add('is-leaving');
  const dismiss=()=>{
   intro.classList.add('is-leaving');
   try{sessionStorage.setItem('danieru-intro-seen','1');}catch(error){}
   window.setTimeout(()=>{intro.hidden=true;},850);
  };
  enter?.addEventListener('click',dismiss);skip?.addEventListener('click',dismiss);
  document.addEventListener('keydown',event=>{
   if(!intro.hidden&&!intro.classList.contains('is-leaving')&&(event.key==='Enter'||event.key==='Escape')){event.preventDefault();dismiss();}
  });
  intro.addEventListener('transitionend',event=>{if(event.target===intro&&intro.classList.contains('is-leaving'))intro.hidden=true;});
 }
 const idCard=$('#identityCard');
 idCard?.addEventListener('click',()=>{
  const flipped=idCard.classList.toggle('is-flipped');
  idCard.setAttribute('aria-pressed',String(flipped));
 });
 const hub=$('#characterHub'),openHub=$('#openCharacterHub'),closeHub=$('#closeCharacterHub');
 const stage=$('#summonStage'),grid=$('.hub-grid',hub),summonImage=$('#summonImage');
 const summonTitle=$('#summonTitle'),summonEyebrow=$('#summonEyebrow'),summonDescription=$('#summonDescription');
 const universes={
  onepiece:{title:'GRAND LINE',eyebrow:'PIRATE WORLD ACTIVATED',description:'The sea is calling. Welcome aboard the Thousand Sunny.',image:'https://raw.githubusercontent.com/danierulazy/imagesrcformyprtflio/main/LUFFY_WANTED_POSTER.png',theme:'onepiece'},
  spider:{title:'SPIDER-VERSE',eyebrow:'NEIGHBORHOOD PROTECTED',description:'A new web-slinging chapter begins in your creative universe.',image:'https://raw.githubusercontent.com/danierulazy/imagesrcformyprtflio/main/SPIDERMAN.png',theme:'spider'},
  zio:{title:'KAMEN RIDER ZI-O',eyebrow:'TIME IMPACT ACTIVATED',description:'The future is yours to rewrite. The king of time has arrived.',image:'https://raw.githubusercontent.com/danierulazy/imagesrcformyprtflio/main/Zi-O%20Ridewatch.png',theme:'zio'}
 };
 openHub?.addEventListener('click',()=>{if(hub&&!hub.open)hub.showModal();});
 closeHub?.addEventListener('click',()=>hub?.close());
 hub?.addEventListener('click',event=>{if(event.target===hub)hub.close();});
 hub?.querySelectorAll('[data-universe]').forEach(button=>button.addEventListener('click',()=>{
  const selected=universes[button.dataset.universe];if(!selected)return;
  if(grid)grid.hidden=true;
  if(stage){stage.hidden=false;stage.classList.remove('summon-replay');void stage.offsetWidth;stage.classList.add('summon-replay');}
  summonImage.src=selected.image;summonImage.alt=selected.title;
  summonTitle.textContent=selected.title;summonEyebrow.textContent=selected.eyebrow;summonDescription.textContent=selected.description;
  if(typeof applyTheme==='function')applyTheme(selected.theme,true);
 }));
 $('#summonBack')?.addEventListener('click',()=>{
  if(stage)stage.hidden=true;if(grid)grid.hidden=false;
 });
 hub?.addEventListener('close',()=>{if(stage)stage.hidden=true;if(grid)grid.hidden=false;});
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&hub?.open){hub.close();}
 });
})();


/* Danieru Arcade — memory match game */
(()=>{
 const dialog=$('#memoryDialog'),board=$('#memoryBoard');
 const launch=$('#openMemoryGame'),close=$('#closeMemoryGame'),restart=$('#restartMemoryGame');
 if(!dialog||!board||!launch)return;
 const symbols=['✦','☾','⚡','♛','✿','◈'];
 let deck=[],opened=[],matched=new Set(),moves=0,seconds=0,timer=null,locked=false;
 const movesNode=$('#memoryMoves'),pairsNode=$('#memoryPairs'),timeNode=$('#memoryTime'),message=$('#memoryMessage');
 const formatTime=value=>String(Math.floor(value/60)).padStart(2,'0')+':'+String(value%60).padStart(2,'0');
 function updateStats(){
  if(movesNode)movesNode.textContent=String(moves).padStart(2,'0');
  if(pairsNode)pairsNode.textContent=matched.size+' / '+symbols.length;
  if(timeNode)timeNode.textContent=formatTime(seconds);
 }
 function stopTimer(){if(timer){clearInterval(timer);timer=null;}}
 function startTimer(){if(timer)return;timer=setInterval(()=>{seconds++;updateStats();},1000);}
 function shuffle(items){
  const copy=items.slice();
  for(let i=copy.length-1;i>0;i--){const k=Math.floor(Math.random()*(i+1));[copy[i],copy[k]]=[copy[k],copy[i]];}
  return copy;
 }
 function draw(){
  board.replaceChildren();
  deck.forEach((symbol,index)=>{
   const button=document.createElement('button');
   button.type='button';button.className='memory-card';button.dataset.index=String(index);
   button.setAttribute('aria-label','Kartu tertutup '+(index+1));
   const face=document.createElement('span');face.className='memory-symbol';face.textContent=symbol;
   button.append(face);button.addEventListener('click',()=>flip(index,button));board.append(button);
  });
 }
 function reset(){
  stopTimer();deck=shuffle([...symbols,...symbols]);opened=[];matched=new Set();moves=0;seconds=0;locked=false;
  if(message)message.textContent='Pilih dua kartu untuk menemukan pasangan.';
  updateStats();draw();
 }
 function flip(index,button){
  if(locked||opened.some(item=>item.index===index)||matched.has(index))return;
  startTimer();button.classList.add('is-open');button.setAttribute('aria-label','Kartu '+deck[index]);opened.push({index,button});
  if(opened.length<2)return;
  moves++;updateStats();
  const [first,second]=opened;
  if(deck[first.index]===deck[second.index]){
   matched.add(first.index);matched.add(second.index);
   [first.button,second.button].forEach(card=>{card.classList.remove('is-open');card.classList.add('is-matched');card.disabled=true;card.setAttribute('aria-label','Pasangan ditemukan: '+deck[first.index]);});
   opened=[];
   if(matched.size===symbols.length){
    stopTimer();if(message)message.textContent='Semua pasangan ditemukan! '+moves+' langkah · '+formatTime(seconds)+'. Coba pecahkan rekor langkahmu.';
   }else if(message)message.textContent='Nice! Pasangan ditemukan.';
   updateStats();
  }else{
   locked=true;if(message)message.textContent='Belum cocok. Coba pasangan lain.';
   window.setTimeout(()=>{
    [first,second].forEach(item=>{item.button.classList.remove('is-open');item.button.setAttribute('aria-label','Kartu tertutup');});
    opened=[];locked=false;
   },750);
  }
 }
 launch.addEventListener('click',()=>{reset();if(!dialog.open)dialog.showModal();});
 close?.addEventListener('click',()=>dialog.close());
 restart?.addEventListener('click',reset);
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
 dialog.addEventListener('close',stopTimer);
})();


/* Danieru Secret System — discoverable easter eggs */
(()=>{
 const vault=$('#easterVault'),list=$('#vaultList'),toast=$('#secretUnlockToast');
 if(!vault||!list||!toast)return;
 const keys=['logo','konami','luffy','spider','zio','credits','matrix','disco','danil','glitch','dot','minecraft','otaku','wajo','danieruch','creator'];
 const found=new Set();
 try{JSON.parse(localStorage.getItem('dx-eggs')||'[]').forEach(key=>{if(keys.includes(key))found.add(key);});}catch(error){}
 const labels={logo:"The Creator's Mark",konami:'Retro Player',luffy:'Grand Line Signal',spider:'Friendly Neighborhood',zio:'Time Administrator',credits:'Hidden Credits',matrix:'Cipher Rain',disco:'Disco Dimension',danil:'Danil’s Signature',glitch:'Glitch Protocol',dot:'Online Guardian',minecraft:'Block Builder',otaku:'Otaku Signal',wajo:'Wajo Spirit',danieruch:'Channel Transmission',creator:'Developer Terminal'};
 const count=$('#vaultCount'),bar=$('#vaultProgressBar'),name=$('#secretUnlockName');
 let toastTimer=null;
 function updateVault(){
  list.querySelectorAll('[data-secret]').forEach(item=>{
   const unlocked=found.has(item.dataset.secret);item.classList.toggle('unlocked',unlocked);
   const status=item.querySelector('em');if(status)status.textContent=unlocked?'UNLOCKED':'LOCKED';
  });
  if(count)count.textContent=found.size+' / '+keys.length+' SECRETS FOUND';
  if(bar)bar.style.width=(found.size/keys.length*100)+'%';
 }
 function openVault(){if(!vault.open)vault.showModal();}
 function unlock(key){
  if(!keys.includes(key)||found.has(key))return;
  found.add(key);updateVault();
  try{localStorage.setItem('dx-eggs',JSON.stringify([...found]));}catch(error){}
  if(name)name.textContent=labels[key];
  toast.classList.add('show');clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toast.classList.remove('show'),5200);
  if(key==='logo')document.body.classList.add('secret-mode');
  if(key==='konami'){
   document.body.classList.add('retro-secret');
   const t=$('#toast');if(t){t.textContent='RETRO MODE UNLOCKED · SECRET THEME ACTIVE';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600);}
  }
  if(key==='luffy'&&typeof applyTheme==='function')applyTheme('onepiece',true);
  if(key==='spider'&&typeof applyTheme==='function')applyTheme('spider',true);
  if(key==='zio'&&typeof applyTheme==='function')applyTheme('zio',true);
  if(found.size===keys.length){
   const t=$('#toast');if(t){t.textContent='ALL SECRETS FOUND · DANIERU MASTER EXPLORER';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),4000);}
  }
 }

 document.addEventListener('danieru:secret',event=>{const key=event.detail?.key;if(keys.includes(key))unlock(key);});
 $('#closeEasterVault')?.addEventListener('click',()=>vault.close());
 $('#vaultDone')?.addEventListener('click',()=>vault.close());
 $('#openVaultFromToast')?.addEventListener('click',openVault);
 $('#brandLogo')?.addEventListener('dblclick',()=>unlock('logo'));
 const brand=document.querySelector('.brand-mark');
 brand?.addEventListener('dblclick',()=>unlock('logo'));
 $('#heroPortrait')?.addEventListener('click',()=>unlock('logo'));
 // Vault entries are clues and progress indicators; discoveries must be triggered in the portfolio itself.
 const codes={
  konami:['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'],
  luffy:['l','u','f','f','y'],
  spider:['s','p','i','d','e','r'],
  zio:['z','i','o']
 };
 const progress={konami:0,luffy:0,spider:0,zio:0};
 document.addEventListener('keydown',event=>{
  if(event.target instanceof HTMLInputElement||event.target instanceof HTMLTextAreaElement||event.target?.isContentEditable)return;
  Object.entries(codes).forEach(([key,code])=>{
   const expected=code[progress[key]];
   if(event.key.toLowerCase()===String(expected).toLowerCase()){
    progress[key]++;
    if(progress[key]===code.length){progress[key]=0;unlock(key);}
   }else progress[key]=event.key.toLowerCase()===String(code[0]).toLowerCase()?1:0;
  });
  if(event.key==='Escape')toast.classList.remove('show');
 });
 const footerCredit=document.querySelector('footer>span:last-child');
 let footerClicks=0,footerClickTimer=null;
 footerCredit?.addEventListener('click',()=>{
  footerClicks++;clearTimeout(footerClickTimer);
  footerClickTimer=setTimeout(()=>{footerClicks=0;},1800);
  if(footerClicks>=5){footerClicks=0;unlock('credits');if(name)name.textContent='A little thank-you from Danieru.';}
 });
 if(footerCredit){footerCredit.style.cursor='default';footerCredit.title='';}
 const command=$('#commandInput');
 command?.addEventListener('input',()=>{
  const value=command.value.trim().toLowerCase();
  if(value==='secrets'||value==='easter eggs'||value==='vault')openVault();
 });
 updateVault();
})();

/* Danieru Multiverse Room — quest log, XP and achievements */
(()=>{
 const room=document.querySelector('#dxMultiverseRoom'),launcher=document.querySelector('#dxRoomLauncher');
 if(!room||!launcher)return;
 const $=selector=>room.querySelector(selector);
 const QUESTS=[
  ['first-theme','World Hopper','Ganti tema website minimal satu kali.',40],
  ['character-call','Summoner','Panggil salah satu karakter dari Character Hub.',60],
  ['arcade-visit','Arcade Explorer','Buka salah satu mini game.',50],
  ['project-view','Art Appreciator','Buka detail salah satu karya.',50],
  ['secret-found','Secret Hunter','Temukan minimal satu Easter Egg.',80],
  ['social-visit','Signal Sent','Kunjungi salah satu tautan sosial.',30],
  ['contact-visit','Say Hello','Jelajahi bagian kontak.',40]
 ];
 const ACHIEVEMENTS=[
  ['first','🌱','First Steps','Selesaikan misi pertamamu.'],
  ['worlds','🧭','World Explorer','Buka semua tiga universe.'],
  ['character','✦','Character Collector','Buka Character Hub.'],
  ['arcade','🎮','Arcade Regular','Mainkan mini game.'],
  ['secret','🔎','Curiosity Wins','Temukan Easter Egg.'],
  ['project','🎨','Art Appreciator','Lihat detail karya.'],
  ['social','📡','Connected','Kunjungi tautan sosial.'],
  ['all','🏆','Quest Master','Selesaikan seluruh tujuh misi.']
 ];
 let state={quests:[],worlds:[],signals:[]};
 try{const saved=JSON.parse(localStorage.getItem('dx-multiverse-progress')||'{}');if(saved&&typeof saved==='object')state=Object.assign(state,saved);}catch(error){}
 const unique=(arr,key)=>arr.includes(key)?arr:[...arr,key];
 const done=key=>state.quests.includes(key);
 const signal=key=>state.signals.includes(key);
 const save=()=>{try{localStorage.setItem('dx-multiverse-progress',JSON.stringify(state));}catch(error){}};
 const $points={'first-theme':40,'character-call':60,'arcade-visit':50,'project-view':50,'secret-found':80,'social-visit':30,'contact-visit':40};
 const questList=$('#dxQuestList'),achievementGrid=$('#dxAchievementGrid');
 const xpTotal=$('#dxXpTotal'),xpBar=$('#dxXpBar'),progress=$('#dxQuestProgress'),badge=$('#dxQuestBadge'),launcherProgress=$('#dxLauncherProgress');
 function unlocked(){
  return {
   first:state.quests.length>0,
   worlds:['onepiece','spider','zio'].every(key=>state.worlds.includes(key)),
   character:signal('character'),arcade:signal('arcade'),secret:signal('secret'),
   project:signal('project'),social:signal('social'),
   all:QUESTS.every(q=>done(q[0]))
  };
 }
 function render(){
  const total=state.quests.reduce((sum,key)=>sum+($points[key]||0),0);
  const count=QUESTS.filter(q=>done(q[0])).length;
  if(questList)questList.innerHTML=QUESTS.map(q=>'<article class="dx-quest '+(done(q[0])?'done':'')+'"><i>'+(done(q[0])?'✓':'·')+'</i><div><b>'+q[1]+'</b><small>'+q[2]+'</small></div><em>'+(done(q[0])?'COMPLETED':'+'+q[3]+' XP')+'</em></article>').join('');
  if(xpTotal)xpTotal.textContent=total+' XP';
  if(xpBar)xpBar.style.width=(count/QUESTS.length*100)+'%';
  if(progress)progress.textContent=count+' / '+QUESTS.length;
  if(badge)badge.textContent=count+'/'+QUESTS.length;
  if(launcherProgress)launcherProgress.textContent=count+'/'+QUESTS.length;
  const status=unlocked();
  if(achievementGrid)achievementGrid.innerHTML=ACHIEVEMENTS.map(a=>'<article class="dx-achievement '+(status[a[0]]?'done':'')+'"><span>'+(status[a[0]]?a[1]:'🔒')+'</span><b>'+(status[a[0]]?a[2]:'Undiscovered')+'</b><small>'+(status[a[0]]?a[3]:'Selesaikan misi untuk membuka achievement ini.')+'</small></article>').join('');
 }
 function markSignal(key){state.signals=unique(state.signals,key);save();render();}
 function award(key){
  if(!$points[key]||done(key))return;
  state.quests=unique(state.quests,key);save();render();
  const toast=document.querySelector('#toast');
  if(toast){toast.textContent='✦ QUEST COMPLETE · +'+$points[key]+' XP';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2600);}
 }
 function tab(name){
  room.querySelectorAll('[data-room-tab]').forEach(button=>button.classList.toggle('active',button.dataset.roomTab===name));
  room.querySelectorAll('[data-room-panel]').forEach(panel=>panel.hidden=panel.dataset.roomPanel!==name);
 }
 launcher.addEventListener('click',()=>{render();if(!room.open)room.showModal();});
 $('#dxRoomClose')?.addEventListener('click',()=>room.close());
 room.addEventListener('click',event=>{if(event.target===room)room.close();});
 room.querySelectorAll('[data-room-tab]').forEach(button=>button.addEventListener('click',()=>tab(button.dataset.roomTab)));
 room.querySelectorAll('[data-room-world]').forEach(button=>button.addEventListener('click',()=>{
  const world=button.dataset.roomWorld;
  if(!['onepiece','spider','zio'].includes(world))return;
  state.worlds=unique(state.worlds,world);save();award('first-theme');
  if(typeof window.applyTheme==='function')window.applyTheme(world,true);
  render();
 }));
 $('#dxOpenRoster')?.addEventListener('click',()=>{markSignal('character');document.querySelector('#dxR')?.click();});
 $('#dxOpenHub')?.addEventListener('click',()=>{markSignal('character');document.querySelector('#openCharacterHub')?.click();});
 document.querySelector('#openCharacterHub')?.addEventListener('click',()=>{markSignal('character');award('character-call');});
 document.querySelector('#themeButton')?.addEventListener('click',()=>award('first-theme'));
 document.querySelectorAll('[data-theme-choice]').forEach(button=>button.addEventListener('click',()=>award('first-theme')));
 document.querySelector('#openMemoryGame')?.addEventListener('click',()=>{markSignal('arcade');award('arcade-visit');});
 document.addEventListener('click',event=>{
  if(event.target.closest?.('.work-card')){markSignal('project');award('project-view');}
  if(event.target.closest?.('.social-grid a')){markSignal('social');award('social-visit');}
 });
 document.querySelectorAll('a[href="#contact"]').forEach(link=>link.addEventListener('click',()=>award('contact-visit')));
 const contact=document.querySelector('#contact');
 if(contact&&'IntersectionObserver'in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)award('contact-visit');}),{threshold:.2});
  observer.observe(contact);
 }
 document.addEventListener('danieru:secret',()=>{markSignal('secret');award('secret-found');});
 try{if(JSON.parse(localStorage.getItem('dx-eggs')||'[]').length){markSignal('secret');}}catch(error){}
 document.querySelector('#dxG')?.addEventListener('click',()=>{markSignal('arcade');award('arcade-visit');});
 render();tab('worlds');
})();
