// Notes on the body: tap a spot, leave a note. Shared through the page's database when available;
// otherwise kept on this device only.
import * as THREE from 'three';
import { kit } from './kit.js';
import { cc } from './theme.js';

const KINDS={pain:{l:'Pain',c:'#F2705F'},note:{l:'Note',c:'#BFE6E1'},question:{l:'Question for a doctor',c:'#B193E3'},good:{l:'Better today',c:'#7FD3A3'}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

export function makeNotes(A){
  const K=kit(A);const {V3}=A;
  let db=null,user=null,me=null,mode='loading',notes=[],unsub=null,G=null,pins=new Map(),ui=null,pending=null,sel=null,profiles={},started=false;
  const LS='glass-atlas-notes';
  const local={read(){try{return JSON.parse(localStorage.getItem(LS)||'[]');}catch(_){return [];}},write(a){try{localStorage.setItem(LS,JSON.stringify(a));}catch(_){}}};
  async function start(){if(started)return;started=true;
    try{db=await window.claude?.use?.('db');user=await window.claude?.use?.('user');}catch(_){db=null;}
    if(user){try{me=await user.id();}catch(_){me=null;}}
    if(db&&me){mode='shared';unsub=db.collection('notes').orderBy('at','desc').limit(300).onSnapshot(async snap=>{notes=snap.docs.map(d=>({id:d.id,...d.data()}));await resolveNames();render();},e=>{mode='local';notes=local.read();render();});}
    else{mode='local';notes=local.read();}
    render();}
  async function resolveNames(){if(!user)return;const ids=[...new Set(notes.map(n=>n.author).filter(Boolean))];if(!ids.length)return;try{profiles=await user.profiles(ids);}catch(_){}}
  const who=n=>mode==='local'||(n.author&&n.author===me)?'you':(profiles[n.author]?.name||'Someone');
  function pinsSync(){if(!G){G=new THREE.Group();A.root.add(G);}
    const seen=new Set();for(const n of notes){if(!Array.isArray(n.p))continue;seen.add(n.id);let m=pins.get(n.id);
      if(!m){m=new THREE.Mesh(new THREE.SphereGeometry(.009,14,10),A.tm(THREE.MeshBasicMaterial,{color:KINDS[n.kind]?.c||'#BFE6E1',depthTest:false,transparent:true}));m.renderOrder=60;G.add(m);pins.set(n.id,m);}
      m.position.set(n.p[0],n.p[1],n.p[2]);A.themed(m.material,KINDS[n.kind]?.c||'#BFE6E1');}
    for(const [id,m] of pins)if(!seen.has(id)){G.remove(m);m.geometry.dispose();pins.delete(id);}
    if(pending){let m=pins.get('__pending');if(!m){m=new THREE.Mesh(new THREE.SphereGeometry(.011,14,10),A.tm(THREE.MeshBasicMaterial,{color:'#FFFFFF',depthTest:false,transparent:true}));m.renderOrder=61;G.add(m);pins.set('__pending',m);}m.position.copy(pending.p);}
    else if(pins.has('__pending')){const m=pins.get('__pending');G.remove(m);pins.delete('__pending');}}
  function ago(iso){const d=(Date.now()-Date.parse(iso))/1000;if(!isFinite(d))return '';if(d<60)return 'just now';if(d<3600)return Math.round(d/60)+' min ago';if(d<86400)return Math.round(d/3600)+' h ago';return new Date(iso).toLocaleDateString(undefined,{month:'short',day:'numeric'});}
  function render(){pinsSync();if(!ui)return;
    const status=mode==='shared'?'Shared: everyone this page is shared with can read these notes; people with Contributor access or above can add their own.':mode==='local'?'Saved on this device only. (Shared notes need the page opened inside Claude while signed in.)':'Connecting…';
    ui.querySelector('#n-status').textContent=status;
    const comp=ui.querySelector('#n-comp');
    if(pending){comp.hidden=false;comp.querySelector('#n-where').textContent=pending.where;}else comp.hidden=true;
    ui.querySelector('#n-list').innerHTML=notes.length?notes.map(n=>`<div class="note${sel===n.id?' on':''}" data-id="${esc(n.id)}" style="--c:${cc(KINDS[n.kind]?.c||'#BFE6E1')}">
        <div class="note-h"><span class="note-k">${esc(KINDS[n.kind]?.l||'Note')}${n.kind==='pain'&&n.level!=null?' · '+esc(n.level)+'/10':''}</span><span class="note-w">${esc(n.where||'')}</span></div>
        <p class="note-t"></p><div class="note-f"><span>${esc(who(n))} · ${esc(ago(n.at))}</span>${(n.author===me||mode==='local')?`<button class="note-del" data-del="${esc(n.id)}" type="button">Delete</button>`:''}</div></div>`).join(''):'<p class="fine">No notes yet. Tap any spot on the body to leave the first one.</p>';
    ui.querySelectorAll('.note').forEach(el=>{const n=notes.find(x=>x.id===el.dataset.id);el.querySelector('.note-t').textContent=n.text||'';
      el.onclick=e=>{if(e.target.closest('[data-del]'))return;sel=n.id;render();if(Array.isArray(n.p)){const v=V3(...n.p);A.flyTo({target:[v.x,v.y,v.z],dist:.9,azim:v.x<0?-25:25,elev:6});}};});
    ui.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>del(b.dataset.del));}
  async function save(){if(!pending)return;const text=ui.querySelector('#n-text').value.trim().slice(0,600);if(!text){ui.querySelector('#n-text').focus();return;}
    const kind=ui.querySelector('[data-kind][aria-checked="true"]')?.dataset.kind||'note';const level=kind==='pain'?+ui.querySelector('#n-lvl').value:null;
    const doc={text,kind,level,where:pending.where,mesh:pending.mesh,p:[+pending.p.x.toFixed(4),+pending.p.y.toFixed(4),+pending.p.z.toFixed(4)],at:new Date().toISOString(),author:me||null};
    const btn=ui.querySelector('#n-save');btn.disabled=true;
    try{if(mode==='shared')await db.collection('notes').add(doc);else{notes=[{id:'l'+Date.now(),...doc},...notes];local.write(notes);}
      pending=null;ui.querySelector('#n-text').value='';render();}
    catch(e){ui.querySelector('#n-err').textContent=e?.code==='invalid_argument'?'This view can read notes but not add them. Ask for Contributor access.':e?.code==='quota_exceeded'?'The notes store is full; delete some old notes first.':'Couldn\'t save just now. Try again in a moment.';}
    finally{btn.disabled=false;}}
  async function del(id){try{if(mode==='shared')await db.doc('notes/'+id).delete();else{notes=notes.filter(n=>n.id!==id);local.write(notes);render();}}catch(_){}}
  function place(hit){if(!hit)return;const p=A.root.worldToLocal(hit.point.clone());const name=hit.rec.group==='skin'?'Skin surface':hit.rec.name.replace(/, nsn$/,'');
    pending={p,mesh:hit.rec.name,where:name};render();ui?.querySelector('#n-text')?.focus();}
  return {id:'notes',title:'Notes on the body',fig:'Tap a spot, leave a note',
    enter(panel){K.resetRig();K.setMode({layers:{skin:.7,skeleton:.6,organs:.6,vessels:.6}});if(G)G.visible=true;
      panel.innerHTML=`<p class="lede-s">Tap anywhere on the body to pin a note there: where it hurts today, something to ask a doctor, a good day. Drag still turns the body.</p>
        <p class="fine" id="n-status" style="margin:0 0 8px!important"></p>
        <div id="n-comp" class="n-comp" hidden><p class="eyebrow">New note · <span id="n-where"></span></p>
          <div class="seg" role="radiogroup" aria-label="Kind">${Object.entries(KINDS).map(([k,v],i)=>`<button role="radio" data-kind="${k}" aria-checked="${i===0}">${v.l}</button>`).join('')}</div>
          <label class="ctl" id="n-lvlw"><span class="ctl-l">Pain level</span><span class="ctl-v" id="n-lvlv">5/10</span><input type="range" id="n-lvl" min="0" max="10" step="1" value="5"></label>
          <textarea id="n-text" rows="3" maxlength="600" placeholder="What's going on here?"></textarea>
          <p class="fine" id="n-err" style="color:var(--alert)!important;margin:4px 0!important"></p>
          <div class="btns"><button class="btn primary" id="n-save" type="button">Pin the note</button><button class="btn" id="n-cancel" type="button">Cancel</button></div></div>
        <div id="n-list"></div>
        <p class="fine">Health notes are personal. Share this page only with people you'd show them to; anyone with access can read them.</p>`;
      ui=panel;
      panel.querySelectorAll('[data-kind]').forEach(b=>b.onclick=()=>{panel.querySelectorAll('[data-kind]').forEach(x=>x.setAttribute('aria-checked',x===b));panel.querySelector('#n-lvlw').hidden=b.dataset.kind!=='pain';});
      const lv=panel.querySelector('#n-lvl');lv.oninput=()=>panel.querySelector('#n-lvlv').textContent=lv.value+'/10';
      panel.querySelector('#n-save').onclick=save;panel.querySelector('#n-cancel').onclick=()=>{pending=null;render();};
      A.onBodyTap=place;start();render();
      A.flyTo({target:[0,.95,0],dist:3.0,azim:12,elev:4});},
    exit(){A.onBodyTap=null;pending=null;ui=null;pinsSync();if(G)G.visible=false;},
    showPins(v){if(G)G.visible=v;},
    count:()=>notes.length,
  };
}
