// Glass Atlas · the Suggest box. It only appears in a browser that opened a private link with a key
// (?key=...); everywhere else (claude.ai, a GitHub clone, visitors without the link) nothing shows.
// Requests go to /api on the same site, where the stuffs requests service files them as GitHub
// issues, and the list below the form follows them: new, being worked on, waiting for an answer, live.
// Files (screenshots, notes, documents) go to the same service but stay private on the server; they
// never reach GitHub, whose issues are public.
const KEY='glass-atlas-key',SEEN='glass-atlas-req-seen',APP='body-atlas-1',POLL=30000;
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const STATUS={new:['New','var(--dim)'],working:['Being worked on','var(--digestive)'],'needs-info':['Needs your answer','var(--alert)'],
  shipped:['Live','var(--ok)'],closed:['Set aside','var(--dim)']};

const CSS=`
.chip.suggest{position:relative}
.chip.suggest i{position:absolute;top:-3px;right:-3px;width:8px;height:8px;border-radius:50%;background:var(--digestive);display:none;animation:rq-pulse 1.4s ease-in-out infinite}
.chip.suggest.busy i{display:block}
@keyframes rq-pulse{50%{opacity:.35}}
.rq-banner{position:absolute;left:50%;transform:translateX(-50%);top:calc(64px + env(safe-area-inset-top,0px));z-index:35;display:flex;align-items:center;gap:10px;
  max-width:min(560px,calc(100% - 32px));padding:7px 8px 7px 12px;border:1px solid var(--line-2);border-radius:999px;background:var(--vitrine);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);font-size:13px;color:var(--bone-2)}
.rq-banner[hidden]{display:none}
.rq-banner>span{white-space:nowrap}
.rq-banner b{color:var(--bone);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.rq-banner .dot{width:8px;height:8px;border-radius:50%;flex:none;background:var(--c);animation:rq-pulse 1.4s ease-in-out infinite}
.rq-banner button{font:10px var(--mono);letter-spacing:.08em;text-transform:uppercase;padding:6px 10px;border:1px solid var(--line-2);border-radius:999px;white-space:nowrap}
.rq-banner button.go{background:var(--bone);color:var(--void);border-color:var(--bone)}
.rq-form textarea{width:100%;min-height:110px;background:var(--input);color:var(--bone);border:1px solid var(--line-2);border-radius:3px;padding:9px 10px;font:14.5px/1.5 var(--body);resize:vertical}
.rq-form textarea:focus{outline:2px solid var(--glass);outline-offset:1px}
.rq-ctx{font-size:12px!important;color:var(--dim)!important;margin:6px 0 0!important}
.rq-msg{font-size:13px!important;margin:8px 0 0!important}
.rq-list{list-style:none;margin:6px 0 0;padding:0}
.rq-list>li{border-top:1px solid var(--line);padding:10px 0}
.rq-top{display:flex;align-items:center;gap:8px;font:10px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--dim)}
.rq-top .st{color:var(--c)}.rq-top .st::before{content:"";display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--c);margin-right:6px;vertical-align:1px}
.rq-top a{margin-left:auto;color:var(--dim)}
.rq-t{font-size:14.5px;color:var(--bone);margin:4px 0 0}
.rq-r{font-size:13px!important;color:var(--bone-2)!important;border-left:2px solid var(--line-2);padding-left:9px;margin:6px 0 0!important}
.rq-r.theirs{border-left-color:var(--c)}
.rq-ans textarea{min-height:64px;margin-top:8px}
.rq-drop{margin-top:8px;border:1px dashed var(--line-2);border-radius:3px;padding:10px 12px;font-size:13px;color:var(--dim);display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.rq-drop.over{border-color:var(--glass);background:color-mix(in srgb,var(--glass) 8%,transparent)}
.rq-drop label{cursor:pointer;color:var(--glass);text-decoration:underline;text-underline-offset:2px}
.rq-drop input{position:absolute;width:1px;height:1px;opacity:0}
.rq-file{display:inline-flex;align-items:center;gap:6px;font:11px var(--mono);padding:4px 6px 4px 9px;border:1px solid var(--line-2);border-radius:999px;color:var(--bone-2);max-width:100%}
.rq-file span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px}
.rq-file button{font:12px var(--mono);color:var(--dim);padding:0 3px}
@media (max-width:860px){.rq-banner{top:calc(96px + env(safe-area-inset-top,0px))}.chip.suggest{order:1;margin-left:auto}.chip.suggest+.chip.theme{margin-left:0}}
`;

export function makeRequests({context,onOpen}){
  // the key arrives once in the link, then lives in this browser
  let key=null;
  try{const u=new URL(location.href),k=u.searchParams.get('key');
    if(k){localStorage.setItem(KEY,k);u.searchParams.delete('key');history.replaceState(null,'',u.pathname+u.search+u.hash);}
    key=localStorage.getItem(KEY);}catch(_){}
  if(!key)return null;

  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  const chip=document.createElement('button');chip.className='chip suggest';chip.type='button';chip.innerHTML='Suggest<i></i>';
  chip.title='Suggest a change or report something broken';
  const themeBtn=document.getElementById('themeBtn');themeBtn.parentNode.insertBefore(chip,themeBtn);
  const banner=document.createElement('div');banner.className='rq-banner';banner.hidden=true;banner.setAttribute('role','status');
  document.getElementById('app').appendChild(banner);

  let data={items:[]},body=null,ctxAtOpen=null,kind='idea',timer=0,dismissed='',files=[];
  const OK=/\.(png|jpe?g|webp|gif|heic|pdf|txt|md|csv|docx|pptx|xlsx)$/i,MAX=15*1024*1024;
  const size=n=>n>1048576?(n/1048576).toFixed(1)+' MB':Math.max(1,Math.round(n/1024))+' KB';
  const seen=(()=>{try{return JSON.parse(localStorage.getItem(SEEN)||'{}');}catch(_){return {};}})();
  const saveSeen=()=>{try{localStorage.setItem(SEEN,JSON.stringify(seen));}catch(_){}};

  async function api(path,opt={}){
    const r=await fetch('/api/'+path,{...opt,headers:{'X-Stuffs-Key':key,'Content-Type':'application/json'}});
    const j=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(j.error||'Something went wrong. Try again in a minute.');
    return j;
  }
  async function refresh(){
    try{data=await api('requests?app='+APP);}catch(_){return;}
    chip.classList.toggle('busy',data.working.length>0);
    showBanner();if(body?.isConnected)renderList();
  }
  function showBanner(){
    // remember every status this browser has seen, except a "live" it hasn't acknowledged yet
    const pending=i=>i.status==='shipped'&&seen[i.number]&&seen[i.number]!=='shipped';
    for(const i of data.items)if(!pending(i))seen[i.number]=i.status;
    saveSeen();
    // something that went live since she last looked beats something being worked on
    const live=data.items.find(pending);
    const work=data.working[0];
    if(live&&dismissed!=='live'+live.number){
      banner.style.setProperty('--c','var(--ok)');
      banner.innerHTML=`<span class="dot" style="animation:none"></span><span>Now live:</span><b>${esc(live.title)}</b><button class="go" type="button" data-reload>Reload</button><button type="button" data-x>Later</button>`;
      banner.querySelector('[data-reload]').onclick=()=>{seen[live.number]='shipped';saveSeen();location.reload();};
      banner.querySelector('[data-x]').onclick=()=>{dismissed='live'+live.number;seen[live.number]='shipped';saveSeen();showBanner();};
      banner.hidden=false;return;
    }
    if(work&&dismissed!=='work'+work.number){
      banner.style.setProperty('--c','var(--digestive)');
      banner.innerHTML=`<span class="dot"></span><span>Being worked on:</span><b>${esc(work.title)}</b>${data.working.length>1?`<span>+${data.working.length-1}</span>`:''}<button type="button" data-open>See</button><button type="button" data-x aria-label="Hide">✕</button>`;
      banner.querySelector('[data-open]').onclick=()=>chip.click();
      banner.querySelector('[data-x]').onclick=()=>{dismissed='work'+work.number;showBanner();};
      banner.hidden=false;return;
    }
    banner.hidden=true;
  }
  function poll(){clearTimeout(timer);if(document.visibilityState==='visible')refresh();timer=setTimeout(poll,POLL);}
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')poll();});

  function when(iso){const d=new Date(iso);return isNaN(d)?'':d.toLocaleDateString(undefined,{month:'short',day:'numeric'});}
  function renderList(){
    const box=body.querySelector('#rq-list');if(!box)return;
    if(!data.items.length){box.innerHTML='<p class="fine">Nothing sent yet. Your requests and their answers will show up here.</p>';return;}
    box.innerHTML=`<ul class="rq-list">${data.items.map(i=>{const [label,c]=STATUS[i.status]||STATUS.new;
      return `<li style="--c:${c}"><div class="rq-top"><span class="st">${label}</span><span>#${i.number} · ${{bug:'fix',topic:'to learn'}[i.kind]||'idea'} · ${when(i.created)}</span><a href="${esc(i.url)}" target="_blank" rel="noopener">GitHub</a></div>
        <p class="rq-t">${esc(i.title)}</p>${i.reply?`<p class="rq-r${i.reply_mine?'':' theirs'}">${i.reply_mine?'You: ':''}${esc(i.reply)}</p>`:''}
        ${i.status==='needs-info'||i.status==='new'||i.status==='working'?`<div class="rq-ans" data-n="${i.number}"><button class="btn" type="button" data-ans>${i.status==='needs-info'?'Answer':'Add a note'}</button></div>`:''}</li>`;}).join('')}</ul>`;
    box.querySelectorAll('[data-ans]').forEach(b=>b.onclick=()=>{const wrap=b.parentElement,n=+wrap.dataset.n;
      wrap.innerHTML=`<div class="rq-form"><textarea aria-label="Your answer"></textarea></div><div class="rq-drop"><span><label>Attach files<input type="file" multiple accept="image/*,.pdf,.txt,.md,.csv,.docx,.pptx,.xlsx"></label></span><span class="rq-picked"></span></div><div class="btns"><button class="btn primary" type="button" data-send>Send</button><button class="btn" type="button" data-cancel>Cancel</button></div><p class="rq-msg"></p>`;
      const ta=wrap.querySelector('textarea'),pick=wrap.querySelector('input[type=file]'),out=wrap.querySelector('.rq-msg');ta.focus();
      pick.onchange=()=>{wrap.querySelector('.rq-picked').textContent=[...pick.files].map(f=>f.name+' ('+size(f.size)+')').join(', ');};
      wrap.querySelector('[data-cancel]').onclick=renderList;
      wrap.querySelector('[data-send]').onclick=async e=>{const t=ta.value.trim(),fs=[...pick.files].filter(f=>f.size<=MAX);
        if(!t&&!fs.length)return ta.focus();e.target.disabled=true;
        try{if(t||fs.length)await api('reply',{method:'POST',body:JSON.stringify({app:APP,number:n,text:t||`(attached ${fs.length} file${fs.length>1?'s':''})`})});
          for(const [i,f] of fs.entries()){out.textContent=`Sending file ${i+1} of ${fs.length}…`;
            const up=await fetch(`/api/upload?app=${APP}&number=${n}&name=${encodeURIComponent(f.name)}`,{method:'POST',headers:{'X-Stuffs-Key':key},body:f});
            if(!up.ok)throw new Error((await up.json().catch(()=>({}))).error||'A file didn\'t go through.');}
          await refresh();}
        catch(err){out.textContent=err.message;e.target.disabled=false;}};});
  }

  const HINT={idea:'For example: let me compare two medicines side by side',bug:'What happened, and what did you expect?',
    topic:'For example: explain how heart failure leads to swollen ankles, with a picture of the fluid shifts'};
  function addFiles(list){const msg=body.querySelector('#rq-msg');let bad='';
    for(const f of list){if(!OK.test(f.name)&&!/^image\//.test(f.type)){bad='Images, PDFs, notes and Office files work.';continue;}
      if(f.size>MAX){bad='Files can be up to 15 MB.';continue;}if(files.length>=10){bad='Up to 10 files at a time.';break;}
      files.push(f.name&&OK.test(f.name)?f:new File([f],'pasted-'+Date.now()+'.png',{type:f.type||'image/png'}));}
    msg.textContent=bad;showFiles();}
  function showFiles(){const box=body.querySelector('#rq-files');
    box.innerHTML=files.map((f,i)=>`<span class="rq-file"><span title="${esc(f.name)}">${esc(f.name)}</span> ${size(f.size)}<button type="button" data-rm="${i}" aria-label="Remove ${esc(f.name)}">✕</button></span>`).join('');
    box.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{files.splice(+b.dataset.rm,1);showFiles();});}
  function render(b){
    body=b;const c=ctxAtOpen||{};
    b.innerHTML=`<p class="tldr">What would you like added, changed, fixed or explained?</p>
      <div class="seg" role="radiogroup" aria-label="Kind"><button type="button" role="radio" data-k="idea" aria-checked="${kind==='idea'}">An idea</button><button type="button" role="radio" data-k="topic" aria-checked="${kind==='topic'}">Help me learn this</button><button type="button" role="radio" data-k="bug" aria-checked="${kind==='bug'}">Something's broken</button></div>
      <div class="rq-form"><textarea id="rq-text" aria-label="Your request" placeholder="${HINT[kind]}"></textarea></div>
      <div class="rq-drop" id="rq-drop"><span>Add screenshots, notes or documents: drop them here, paste a screenshot, or <label>choose files<input type="file" id="rq-pick" multiple accept="image/*,.pdf,.txt,.md,.csv,.docx,.pptx,.xlsx"></label>.</span><span id="rq-files"></span></div>
      <p class="rq-ctx">Files stay private on Nathan's server and don't go on GitHub. Please leave out anything with a patient's name or details.</p>
      <p class="rq-ctx">Sent along with it: you were on ${esc(c.screen||'the main view')}, ${esc(c.theme)} mode, on a ${esc(c.device)}.</p>
      <div class="btns"><button class="btn primary" id="rq-send" type="button">Send</button></div><p class="rq-msg" id="rq-msg" role="status"></p>
      <h3>Your requests</h3><div id="rq-list"><p class="fine">Loading…</p></div>`;
    b.querySelectorAll('[data-k]').forEach(x=>x.onclick=()=>{kind=x.dataset.k;const t=b.querySelector('#rq-text').value;render(b);b.querySelector('#rq-text').value=t;});
    const send=b.querySelector('#rq-send'),msg=b.querySelector('#rq-msg'),ta=b.querySelector('#rq-text'),drop=b.querySelector('#rq-drop');
    showFiles();
    b.querySelector('#rq-pick').onchange=e=>{addFiles([...e.target.files]);e.target.value='';};
    ta.addEventListener('paste',e=>{const imgs=[...(e.clipboardData?.files||[])];if(imgs.length){e.preventDefault();addFiles(imgs);}});
    drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('over');});
    drop.addEventListener('dragleave',()=>drop.classList.remove('over'));
    drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('over');addFiles([...e.dataTransfer.files]);});
    send.onclick=async()=>{const text=ta.value.trim();if(text.length<3){msg.textContent='Write a few words first.';return ta.focus();}
      send.disabled=true;msg.textContent='Sending…';
      try{const r=await api('request',{method:'POST',body:JSON.stringify({app:APP,kind,text,context:c,files:files.length})});
        let failed=0;
        for(const [i,f] of files.entries()){msg.textContent=`Sending file ${i+1} of ${files.length}…`;
          const up=await fetch(`/api/upload?app=${APP}&number=${r.number}&name=${encodeURIComponent(f.name)}`,{method:'POST',headers:{'X-Stuffs-Key':key},body:f}).catch(()=>null);
          if(!up?.ok)failed++;}
        ta.value='';files=[];showFiles();
        msg.textContent=`Sent. It's #${r.number} in the list below.`+(failed?` ${failed} file${failed>1?'s':''} didn't go through; try adding ${failed>1?'them':'it'} again with "Add a note".`:'');
        // GitHub's list can lag a moment behind, so show it right away
        if(!data.items.some(i=>i.number===r.number)){data.items.unshift({number:r.number,title:text.split('\n')[0],kind,status:'new',created:new Date().toISOString(),url:r.url,reply:''});renderList();}
        seen[r.number]='new';saveSeen();setTimeout(refresh,4000);}
      catch(err){msg.textContent=err.message;}
      send.disabled=false;};
    renderList();refresh();
  }

  chip.onclick=()=>{ctxAtOpen=context();onOpen(render);};
  poll();
  return {render,refresh};
}
