(()=>{'use strict';
const root=document.querySelector('.dx-visual-studio');if(!root||root.dataset.ready)return;root.dataset.ready='1';
const $=s=>root.querySelector(s),canvas=$('#dxVsCanvas'),ctx=canvas.getContext('2d'),file=$('#dxVsMedia'),lyrics=$('#dxVsLyrics'),title=$('#dxVsTitle'),artist=$('#dxVsArtist'),accent=$('#dxVsAccent'),fit=$('#dxVsFit'),blur=$('#dxVsBlur'),duration=$('#dxVsDuration'),status=$('#dxVsStatus'),timeLabel=$('#dxVsTime'),recordBtn=$('#dxVsRecord');
const W=1920,H=1080,audio=document.querySelector('#audioPlayer');let media=null,objectUrl='',raf=0,recording=false,recorder=null,recordChunks=[],active=0,stopTimer=0,musicState=window.DanieruMusicState||{lines:[],time:0,paused:true};
const linesNow=()=>Array.isArray(musicState.lines)?musicState.lines:[];
const lineText=line=>typeof line==='string'?line:String(line?.text??'');
const lineTime=line=>Number(line?.time)||0;
function updateMusic(){
 musicState=window.DanieruMusicState||musicState;
 const activeTrack=document.querySelector('.track.active');
 if(activeTrack){const t=activeTrack.querySelector('.track-title');if(t){title.value=t.querySelector('b')?.textContent||title.value;artist.value=t.querySelector('small')?.textContent||artist.value;}}
 const lines=linesNow();lyrics.value=lines.length?lines.map(lineText).join('\n'):'Lirik akan muncul setelah lagu dipilih dan lirik tersinkronisasi ditemukan.';
 render();
}
window.addEventListener('danieru:music-state',updateMusic);
if(audio){['timeupdate','play','pause','seeked','loadedmetadata','loadeddata'].forEach(e=>audio.addEventListener(e,()=>{musicState=window.DanieruMusicState||musicState;render()}));}
function fitMedia(m,x,y,w,h){
 const mw=m.videoWidth||m.naturalWidth||m.width,mh=m.videoHeight||m.naturalHeight||m.height;if(!mw||!mh)return;
 const scale=fit.value==='contain'?Math.min(w/mw,h/mh):Math.max(w/mw,h/mh),sw=mw*scale,sh=mh*scale;
 ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.filter='blur('+Math.min(20,Number(blur.value)||0)+'px)';ctx.drawImage(m,x+(w-sw)/2,y+(h-sh)/2,sw,sh);ctx.restore();
}
function draw(){
 const lines=linesNow(),t=audio?.currentTime||0,per=Math.max(.8,Number(duration.value)||2.8);
 if(lines.length){let idx=-1;for(let i=0;i<lines.length;i++){if(lineTime(lines[i])<=t)idx=i;else break;}active=Math.max(0,idx);}else active=0;
 ctx.clearRect(0,0,W,H);
 const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#142a42');bg.addColorStop(.55,'#101827');bg.addColorStop(1,'#080d17');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
 const mx=100,my=240,mw=600,mh=600;
 ctx.save();ctx.beginPath();ctx.roundRect(mx,my,mw,mh,36);ctx.clip();
 if(media)fitMedia(media,mx,my,mw,mh);else{const g=ctx.createLinearGradient(mx,my,mx+mw,my+mh);g.addColorStop(0,'#38516b');g.addColorStop(.5,'#142d4c');g.addColorStop(1,'#080f1b');ctx.fillStyle=g;ctx.fillRect(mx,my,mw,mh);ctx.fillStyle='rgba(255,255,255,.08)';for(let i=0;i<12;i++){ctx.beginPath();ctx.arc(mx+85+i*40,my+160+(i%4)*110,42+i*4,0,Math.PI*2);ctx.fill();}}
 const shade=ctx.createLinearGradient(mx,my,mx,my+mh);shade.addColorStop(0,'rgba(0,0,0,.03)');shade.addColorStop(1,'rgba(0,0,0,.72)');ctx.fillStyle=shade;ctx.fillRect(mx,my,mw,mh);ctx.restore();
 ctx.fillStyle='rgba(255,255,255,.78)';ctx.font='700 23px Arial';ctx.fillText('DANIERU VISUAL STUDIO',mx,my+mh+55);
 ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(mx,my+mh-110,mw,110);ctx.fillStyle='#fff';ctx.font='700 36px Arial';ctx.fillText((title.value||'Untitled track').slice(0,30),mx+24,my+mh-62);ctx.fillStyle='rgba(255,255,255,.72)';ctx.font='24px Arial';ctx.fillText((artist.value||'Artist name').slice(0,34),mx+24,my+mh-25);
 const tx=830,tw=990;ctx.fillStyle='rgba(255,255,255,.58)';ctx.font='700 22px Arial';ctx.fillText('NOW PLAYING  /  SYNCHRONIZED LYRICS',tx,230);
 if(!lines.length){ctx.fillStyle='rgba(255,255,255,.7)';ctx.font='700 42px Arial';ctx.fillText('Play a track and find synced lyrics',tx,520);}
 for(let offset=-2;offset<=2;offset++){const idx=active+offset;if(idx<0||idx>=lines.length)continue;const y=540+offset*130;ctx.save();ctx.textAlign='left';ctx.font=(offset===0?'800 58px Arial':'700 45px Arial');ctx.fillStyle=offset===0?'#ffffff':'rgba(225,235,248,'+Math.max(.12,.40-Math.abs(offset)*.11)+')';ctx.shadowColor=offset===0?accent.value:'transparent';ctx.shadowBlur=offset===0?22:0;if(offset!==0)ctx.filter='blur('+(Math.abs(offset)*1.2)+'px)';let txt=lineText(lines[idx]);while(ctx.measureText(txt).width>tw&&txt.length>5)txt=txt.slice(0,-2)+'…';ctx.fillText(txt,tx,y);ctx.restore();}
 ctx.fillStyle='rgba(255,255,255,.4)';ctx.font='700 18px Arial';ctx.fillText('✦  '+(artist.value||'YOUR ARTIST').toUpperCase(),tx,930);
 ctx.fillStyle='rgba(255,255,255,.13)';ctx.beginPath();ctx.roundRect(tx,975,tw,7,4);ctx.fill();ctx.fillStyle=accent.value;ctx.beginPath();ctx.roundRect(tx,975,tw*(lines.length?((active+1)/lines.length):0),7,4);ctx.fill();
 if(recording){timeLabel.textContent=(audio?.currentTime||0).toFixed(1)+'s';raf=requestAnimationFrame(draw);}
}
function render(){draw();if(!recording)timeLabel.textContent='LIVE PREVIEW';}
function cleanup(){if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl='';}if(media&&media.tagName==='VIDEO'){media.pause();media.removeAttribute('src');media.load();}media=null;}
file.addEventListener('change',()=>{const f=file.files?.[0];if(!f)return;cleanup();objectUrl=URL.createObjectURL(f);if(f.type.startsWith('image/')){const img=new Image();img.onload=()=>{media=img;status.textContent='IMAGE READY · '+f.name;render();};img.onerror=()=>status.textContent='Could not load image';img.src=objectUrl;}else if(f.type.startsWith('video/')){const v=document.createElement('video');v.muted=true;v.loop=true;v.playsInline=true;v.addEventListener('loadeddata',()=>{media=v;v.play().catch(()=>{});status.textContent='VIDEO READY · '+f.name;render();},{once:true});v.addEventListener('error',()=>status.textContent='Could not load video');v.src=objectUrl;v.load();}else status.textContent='Choose an image or video file';});
[lyrics,title,artist,accent,fit,blur,duration].forEach(el=>el.addEventListener('input',render));
$('#dxVsReset').addEventListener('click',()=>{cleanup();file.value='';title.value='Untitled track';artist.value='Your artist';lyrics.value='Lirik akan muncul setelah lagu dipilih.';render();status.textContent='READY · ADD YOUR OWN MEDIA';});
$('#dxVsPng').addEventListener('click',()=>{render();canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='danieru-visual-fhd.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);},'image/png');});
async function convertToMp4(webmBlob){
 status.textContent='CONVERTING TO MP4 · PLEASE WAIT';
 const {FFmpeg}=await import('https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js');
 const ffmpeg=new FFmpeg();
 const toBlobURL=async(url,type)=>URL.createObjectURL(new Blob([await (await fetch(url)).arrayBuffer()],{type}));
 const core='https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js';
 const wasm='https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm';
 const coreURL=await toBlobURL(core,'text/javascript'),wasmURL=await toBlobURL(wasm,'application/wasm');
 await ffmpeg.load({coreURL,wasmURL});
 await ffmpeg.writeFile('input.webm',new Uint8Array(await webmBlob.arrayBuffer()));
 await ffmpeg.exec(['-i','input.webm','-c:v','libx264','-preset','ultrafast','-crf','21','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart','output.mp4']);
 const data=await ffmpeg.readFile('output.mp4');ffmpeg.terminate();URL.revokeObjectURL(coreURL);URL.revokeObjectURL(wasmURL);
 return new Blob([data.buffer],{type:'video/mp4'});
}
function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);}
async function finishRecording(stream){
 const blob=new Blob(recordChunks,{type:recorder?.mimeType||'video/webm'});stream.getTracks().forEach(t=>t.stop());
 if(!blob.size){status.textContent='EXPORT FAILED · EMPTY VIDEO';return;}
 try{const mp4=await convertToMp4(blob);downloadBlob(mp4,'danieru-lyrics-video-fhd.mp4');status.textContent='MP4 FULL HD · VIDEO + MUSIC EXPORTED';}
 catch(error){console.error(error);downloadBlob(blob,'danieru-lyrics-video-fhd.webm');status.textContent='MP4 CONVERSION FAILED · WEBM WITH AUDIO DOWNLOADED';}
}
function stopRecording(){if(!recording)return;recording=false;clearTimeout(stopTimer);cancelAnimationFrame(raf);recordBtn.textContent='RECORD MP4 FHD';status.textContent='FINALIZING VIDEO…';if(recorder&&recorder.state!=='inactive')recorder.stop();}
recordBtn.addEventListener('click',()=>{
 if(recording){stopRecording();return;}
 if(!audio||audio.paused||audio.ended){status.textContent='PLAY A SONG FIRST · AUDIO IS REQUIRED';return;}
 if(!canvas.captureStream||!window.MediaRecorder){status.textContent='VIDEO RECORDING NOT SUPPORTED IN THIS BROWSER';return;}
 let audioStream;try{const capture=audio.captureStream||audio.mozCaptureStream;if(!capture)throw new Error('Audio capture unsupported');audioStream=capture.call(audio);}catch(e){status.textContent='CANNOT CAPTURE TRACK AUDIO · CHECK CORS';return;}
 const audioTracks=audioStream.getAudioTracks();if(!audioTracks.length){status.textContent='NO AUDIO TRACK · RELOAD THE SONG WITH CORS ENABLED';return;}
 const videoStream=canvas.captureStream(30),stream=new MediaStream([...videoStream.getVideoTracks(),...audioTracks]);
 const mime=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));
 try{recorder=new MediaRecorder(stream,mime?{mimeType:mime,videoBitsPerSecond:12000000,audioBitsPerSecond:192000}:undefined);}catch(e){status.textContent='CANNOT START VIDEO ENCODER';stream.getTracks().forEach(t=>t.stop());return;}
 recordChunks=[];recorder.ondataavailable=e=>{if(e.data?.size)recordChunks.push(e.data);};recorder.onstop=()=>finishRecording(stream);
 const seconds=Math.max(5,Math.min(60,Number(duration.value)||15));recording=true;recordBtn.textContent='STOP & EXPORT';status.textContent='RECORDING FHD · MUSIC INCLUDED';draw();recorder.start(500);stopTimer=setTimeout(stopRecording,seconds*1000);
});
render();updateMusic();
})();