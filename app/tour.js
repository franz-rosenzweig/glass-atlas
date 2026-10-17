// The narrated tour: plays recorded narration stop by stop while the camera and highlights follow.
import { kit } from './kit.js';

export function makeTour(A,{onStart,onEnd,showWeb}){
  const K=kit(A);let segs=null,i=0,audio=null,bar=null,playing=false,timer=null,useAudio=true;
  async function load(){if(segs)return;try{segs=await (await fetch('tour-script.json')).json();}catch(_){segs=[];}}
  function ui(){if(bar)return;bar=document.createElement('div');bar.className='tour';bar.innerHTML=`<div class="tour-top"><span class="tour-n" id="t-n"></span><b class="tour-t" id="t-t"></b><button class="tour-x" id="t-x" type="button" aria-label="End the tour">End tour</button></div>
      <p class="tour-c" id="t-c" aria-live="polite"></p>
      <div class="tour-ctl"><button id="t-prev" type="button" aria-label="Previous stop">‹</button><button id="t-play" type="button" class="tour-play">Pause</button><button id="t-next" type="button" aria-label="Next stop">›</button><div class="tour-dots" id="t-dots"></div></div>`;
    document.getElementById('app').appendChild(bar);
    bar.querySelector('#t-x').onclick=end;bar.querySelector('#t-prev').onclick=()=>go(Math.max(0,i-1));bar.querySelector('#t-next').onclick=()=>next();
    bar.querySelector('#t-play').onclick=()=>playing?pause():resume();
    addEventListener('keydown',e=>{if(!bar||bar.hidden)return;if(e.key==='Escape')end();if(e.key==='ArrowRight')next();if(e.key==='ArrowLeft')go(Math.max(0,i-1));});}
  function stage(s){
    K.resetRig();
    if(s.parts.length)K.setMode({layers:{skin:.45,skeleton:.4,organs:.45,vessels:.5},focus:A.resolve(s.parts),focusColor:s.col,dim:.3,forceShow:s.force?A.resolve(s.force):null});
    else K.setMode({layers:{skin:1,skeleton:1,organs:1,vessels:1}});
    showWeb?.(!!s.web);
    A.flyTo({target:s.cam.target,dist:s.cam.dist,azim:s.cam.azim,elev:s.cam.elev},{dur:1800});}
  function render(){const s=segs[i];bar.querySelector('#t-n').textContent=`${i+1} / ${segs.length}`;bar.querySelector('#t-t').textContent=s.title;bar.querySelector('#t-c').textContent=s.text;
    bar.querySelector('#t-dots').innerHTML=segs.map((_,j)=>`<i class="${j<i?'done':j===i?'on':''}"></i>`).join('');bar.querySelector('#t-play').textContent=playing?'Pause':'Play';}
  function clearT(){clearTimeout(timer);timer=null;}
  function go(j){i=j;clearT();const s=segs[i];stage(s);
    if(audio){audio.pause();audio=null;}
    if(useAudio){audio=new Audio(`tour/${String(i).padStart(2,'0')}.mp3`);audio.onended=()=>next();audio.onerror=()=>{useAudio=false;timed();};
      if(playing)audio.play().catch(()=>{useAudio=false;timed();});}
    else timed();
    render();}
  function timed(){clearT();if(!playing)return;const s=segs[i];timer=setTimeout(next,Math.max(8000,s.text.split(/\s+/).length/2.4*1000));}
  function next(){if(i>=segs.length-1){playing=false;render();return;}go(i+1);}
  function pause(){playing=false;audio?.pause();clearT();render();}
  function resume(){playing=true;if(audio&&useAudio)audio.play().catch(()=>{useAudio=false;timed();});else timed();render();}
  async function start(){await load();if(!segs.length)return;onStart?.();ui();bar.hidden=false;playing=true;useAudio=true;go(0);}
  function end(){pause();if(audio){audio.pause();audio=null;}if(bar)bar.hidden=true;showWeb?.(false);onEnd?.();}
  return {start,end,get active(){return bar&&!bar.hidden;}};
}
