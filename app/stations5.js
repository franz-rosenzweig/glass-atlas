// Stage-two instruments, part 4: the injection bench for Hadlima (adalimumab-bwwd). A medicine taken
// every other week doesn't fit the 24-hour planner, so it gets its own bench: the level in the blood
// over twelve weeks, where the injections go on the real skin (with rotation), when to call, and how
// it meets the patient's other conditions. Content and sources live in data.js (HADLIMA).
import * as THREE from 'three';
import { toggle, bindToggle, clamp, fmt, kit } from './kit.js';
import { lineChart } from './kit.js';
import { MEDS, HADLIMA } from './data.js';
import { cc } from './theme.js';
import { REFS } from './refs.js';

const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- the level model: one compartment, first-order absorption, label numbers (see HADLIMA.pk) */
export function levels({schedule='eow',mtx=false,ada=false,days=84,step=.5}={}){
  const P=HADLIMA.pk;
  let ke=Math.LN2/P.halfLifeDays;
  if(mtx)ke*=1-P.mtxClearanceDrop;
  if(ada)ke*=P.adaClearanceRise;
  const ka=P.ka;
  const every=schedule==='weekly'?7:14;
  let doses=[];for(let d=0;d<=days;d+=every)doses.push(d);
  if(schedule==='late')doses=doses.map(d=>d===42?49:d);
  const C=t=>doses.reduce((s,d)=>t<d?s:s+P.scale*ka/(ka-ke)*(Math.exp(-ke*(t-d))-Math.exp(-ka*(t-d))),0);
  const pts=[];for(let t=0;t<=days+1e-9;t+=step)pts.push([t,C(t)]);
  // steady state: the last full interval of a long run on the same schedule
  const long=[];for(let d=0;d<=364;d+=every)long.push(d);
  const Cs=t=>long.reduce((s,d)=>t<d?s:s+P.scale*ka/(ka-ke)*(Math.exp(-ke*(t-d))-Math.exp(-ka*(t-d))),0);
  const last=long[long.length-2];let lo=Infinity,hi=0;for(let t=last;t<last+every;t+=.25){const c=Cs(t);lo=Math.min(lo,c);hi=Math.max(hi,c);}
  let ss=null;for(const d of long){if(Cs(d+every-.01)>=.9*lo){ss=d+every;break;}}
  return {pts,doses,trough:lo,peak:hi,ss};
}

export function makeStations5(A){
  const K=kit(A);const V3=A.V3;
  let ui,group=null,cur=0,view='belly',lens=null;
  const v={schedule:'eow',mtx:false,ada:false};

  /* ---------- injection sites on the skin */
  // Sites follow the instructions for use: the belly at least 5 cm (2 in) from the navel, or the front of
  // the thighs; each injection at least 2.5 cm (1 in) from the last. Positions are found by casting a ray
  // at the real skin mesh, so the marks sit on this body.
  function skinPoint(x,y){
    const sk=A.MESH['Skin'].mesh;sk.updateWorldMatrix(true,false);
    const rc=new THREE.Raycaster();rc.set(V3(x,y,.6),V3(0,0,-1));
    const h=rc.intersectObject(sk,false)[0];if(!h)return null;
    const n=h.face?h.face.normal.clone().transformDirection(sk.matrixWorld):V3(0,0,1);
    return {p:h.point.clone().add(n.clone().multiplyScalar(.0015)),n};
  }
  const NAVEL_Y=.985;
  const SITES=HADLIMA.sites;   // [{id,label,area:'belly'|'right'|'left',x,y}] in the order they rotate
  function build(){
    if(group){group.visible=true;return;}
    group=new THREE.Group();A.scene.add(group);
    const dotGeo=new THREE.CircleGeometry(.0016,10);
    const zoneMat=A.tm(THREE.MeshBasicMaterial,{color:'#40C7AA',transparent:true,opacity:.55,depthWrite:false,side:THREE.DoubleSide});
    const navelMat=A.tm(THREE.MeshBasicMaterial,{color:'#F2705F',transparent:true,opacity:.9,depthWrite:false,side:THREE.DoubleSide});
    const pts=[];
    // the lower belly (the instructions say lower abdomen): from the navel's level down towards the hip
    // bones, leaving the 5 cm circle round the navel
    for(let y=.895;y<=1.003;y+=.012)for(let x=-.11;x<=.11;x+=.012){if(Math.hypot(x,(y-NAVEL_Y))<.05)continue;pts.push([x,y]);}
    // thighs: the front, from a hand below the groin to a hand above the knee
    for(const sx of [-1,1])for(let y=.5;y<=.74;y+=.012)for(let x=.06;x<=.12;x+=.012)pts.push([sx*x,y]);
    const im=new THREE.InstancedMesh(dotGeo,zoneMat,pts.length);im.renderOrder=50;im.frustumCulled=false;
    const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),one=V3(1,1,1);let k=0;
    for(const [x,y] of pts){const s=skinPoint(x,y);if(!s)continue;q.setFromUnitVectors(V3(0,0,1),s.n);m4.compose(s.p,q,one);im.setMatrixAt(k++,m4);}
    im.count=k;group.add(im);
    // the circle the needle stays out of
    const nv=skinPoint(0,NAVEL_Y);
    const ringPts=[];for(let i=0;i<=64;i++){const a=i/64*Math.PI*2;const s=skinPoint(Math.cos(a)*.05,NAVEL_Y+Math.sin(a)*.05);if(s)ringPts.push(s.p);}
    const ring=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ringPts,true),96,.0012,6,true),navelMat);ring.renderOrder=51;group.add(ring);
    const nd=new THREE.Mesh(new THREE.CircleGeometry(.004,16),navelMat);nd.position.copy(nv.p);nd.quaternion.setFromUnitVectors(V3(0,0,1),nv.n);nd.renderOrder=51;group.add(nd);
    // one marker per rotation site
    for(const site of SITES){const s=skinPoint(site.x,site.y);if(!s){site.mesh=null;continue;}
      const mat=A.tm(THREE.MeshBasicMaterial,{color:'#ECE6DA',transparent:true,opacity:.9,depthWrite:false,side:THREE.DoubleSide});
      const mk=new THREE.Mesh(new THREE.RingGeometry(.0085,.0115,32),mat);mk.position.copy(s.p);mk.quaternion.setFromUnitVectors(V3(0,0,1),s.n);mk.renderOrder=52;
      const dot=new THREE.Mesh(new THREE.CircleGeometry(.0055,24),mat);dot.position.copy(s.p);dot.quaternion.copy(mk.quaternion);dot.renderOrder=52;
      group.add(mk,dot);site.mesh=mk;site.dot=dot;site.mat=mat;}
  }
  function paintSites(){
    SITES.forEach((s,i)=>{if(!s.mesh)return;const age=(cur-i+SITES.length)%SITES.length;
      // this dose bright, the last three fading, the rest faint
      const col=age===0?'#F29A55':age<=3?'#ECE6DA':'#7E8E90';A.themed(s.mat,col);
      s.mat.opacity=age===0?1:age<=3?.85-.2*age:.35;s.dot.visible=age===0;s.mesh.scale.setScalar(age===0?1.25:1);});
  }
  function flyTo(area){
    view=area;
    const T=area==='belly'?{target:[0,.97,.1],dist:.85,azim:0,elev:4}:{target:[area==='right'?-.085:.085,.64,.06],dist:.85,azim:area==='right'?-14:14,elev:2};
    A.flyTo(T);
  }

  /* ---------- the chart */
  function chart(){
    const L=levels(v);const top=Math.max(8,Math.ceil(Math.max(...L.pts.map(p=>p[1]))*1.12/4)*4);
    const P=HADLIMA.pk;
    const {svg}=lineChart({W:330,H:170,x0:0,x1:89,y0:0,y1:top,left:30,
      xticks:[0,14,28,42,56,70,84],xfmt:d=>d?'wk '+d/7:'start',yticks:[0,4,8,12,16,20,24,28,32].filter(y=>y<=top),
      label:'Adalimumab level in the blood over twelve weeks, illustrative',
      extra:(px,py)=>`<line x1="${px(0)}" x2="${px(84)}" y1="${py(P.troughMono)}" y2="${py(P.troughMono)}" stroke="var(--dim)" stroke-dasharray="3 3"/>
        <text x="${px(.6)}" y="${py(P.troughMono)-4}">${fmt(P.troughMono,0)} µg/mL</text>
        ${L.doses.filter(d=>d<=84).map(d=>`<path d="M${px(d)} ${py(0)}l-4 7h8z" fill="var(--immune)"/>`).join('')}
        ${v.schedule==='late'?`<text x="${px(42)}" y="${py(top)+12}" text-anchor="middle">missed</text><line x1="${px(42)}" x2="${px(42)}" y1="${py(top)+16}" y2="${py(0)}" stroke="var(--alert)" stroke-dasharray="2 3"/>`:''}`,
      series:[{pts:L.pts,stroke:'var(--immune)',width:2.2}]});
    return {svg,L};
  }
  function render(){
    const {svg,L}=chart();
    ui.querySelector('#hd-chart').innerHTML=svg;
    ui.querySelector('#hd-lo').textContent=fmt(L.trough,1)+' µg/mL';
    ui.querySelector('#hd-hi').textContent=fmt(L.peak,1)+' µg/mL';
    ui.querySelector('#hd-ss').textContent=L.ss?'about week '+Math.round(L.ss/7):'—';
    ui.querySelector('#hd-note').innerHTML=HADLIMA.scenario[v.ada?'ada':v.schedule==='late'?'late':v.schedule==='weekly'?'weekly':v.mtx?'mtx':'eow'];
    ui.querySelectorAll('[data-sch]').forEach(b=>b.setAttribute('aria-checked',b.dataset.sch===v.schedule));
  }
  function renderSite(){
    const s=SITES[cur];
    ui.querySelector('#hd-site').textContent=s.label;
    ui.querySelector('#hd-prev').textContent=[1,2,3].map(k=>SITES[(cur-k+SITES.length)%SITES.length].label).join(' · ');
    ui.querySelectorAll('[data-area]').forEach(b=>b.setAttribute('aria-checked',b.dataset.area===view));
    paintSites();
  }
  function renderLens(){
    ui.querySelectorAll('[data-lens]').forEach(b=>b.setAttribute('aria-checked',b.dataset.lens===lens));
    const box=ui.querySelector('#hd-lens');
    // the injection marks belong to the bench's own view and the skin lens; other lenses light their organs
    if(group)group.visible=!lens||lens==='skin';
    if(!lens){box.innerHTML='';K.setMode({layers:{skin:.55,skeleton:.12,organs:.25,vessels:.2},focus:A.resolve(['#righthand','#lefthand']),focusColor:'#F29A55',dim:.4});return;}
    const L=HADLIMA.lenses[lens];
    box.innerHTML=`<p class="regtext" style="--c:${cc(L.col)}">${L.text}</p>`+(L.refs?`<p class="srcline">Sources: ${L.refs.map(k=>`<button type="button" data-src="${k}">${esc(REFS[k]?.s||k)}</button>`).join(' · ')}</p>`:'');
    if(L.parts?.length){K.setMode({layers:{skin:.3,skeleton:.08,organs:.35,vessels:.4},focus:A.resolve(L.parts),focusColor:L.col,dim:.25});if(L.cam)A.flyTo(L.cam);}
    else{K.setMode({layers:{skin:.55,skeleton:.15,organs:.3,vessels:.25}});if(lens==='skin')flyTo(view);else A.flyTo({target:[0,.95,0],dist:3.0,azim:16,elev:4});}
  }

  return {hadlima:{
    id:'hadlima',title:'Injection bench',fig:'Two weeks, one injection',
    enter(panel){
      K.resetRig();build();cur=0;view='belly';lens=null;Object.assign(v,{schedule:'eow',mtx:false,ada:false});
      const m=MEDS.find(x=>x.id==='hadlima');
      panel.innerHTML=`<p class="lede-s"><b>${m.name}.</b> ${m.text}</p>${m.warn?`<div class="warn"><b>For any provider</b>${m.warn}</div>`:''}
        <p class="eyebrow">The level in the blood</p>
        <div class="seg" role="radiogroup" aria-label="Schedule">${[['eow','Every other week'],['weekly','Weekly'],['late','One dose late']].map(([k,l])=>`<button type="button" role="radio" data-sch="${k}" aria-checked="${k===v.schedule}">${l}</button>`).join('')}</div>
        <div id="hd-chart"></div>
        <div class="tgs two">${toggle('hd-mtx','With methotrexate',false,'clears it more slowly')}${toggle('hd-ada','Antibodies to the drug',false,'clear it faster')}</div>
        <div class="readouts">
          <div class="ro"><span>Lowest level, steady state</span><b id="hd-lo">—</b></div>
          <div class="ro"><span>Highest level, steady state</span><b id="hd-hi">—</b></div>
          <div class="ro"><span>Steady state by</span><b id="hd-ss" class="sm">—</b></div>
        </div>
        <p class="regtext" id="hd-note"></p>
        <p class="fine">${HADLIMA.modelNote}</p>
        <p class="eyebrow">Where it goes</p>
        <div class="seg" role="radiogroup" aria-label="Area">${[['belly','Belly'],['right','Right thigh'],['left','Left thigh']].map(([k,l])=>`<button type="button" role="radio" data-area="${k}" aria-checked="${k===view}">${l}</button>`).join('')}</div>
        <div class="readouts">
          <div class="ro"><span>This dose</span><b id="hd-site" class="sm">—</b></div>
          <div class="ro"><span>The last three</span><b id="hd-prev" class="sm">—</b></div>
        </div>
        <div class="btns"><button class="btn" id="hd-next" type="button">Next dose</button></div>
        <ul class="rules">${HADLIMA.siteRules.map(t=>`<li>${t}</li>`).join('')}</ul>
        <p class="eyebrow">Call the same day</p>
        <ul class="em">${HADLIMA.call.map(([t,sig,act])=>`<li><b>${esc(t)}</b><i>${esc(sig)}</i><span>${esc(act)}</span></li>`).join('')}</ul>
        <p class="eyebrow">With the patient's other conditions</p>
        <div class="seg" role="radiogroup" aria-label="Lens">${Object.entries(HADLIMA.lenses).map(([k,l])=>`<button type="button" role="radio" data-lens="${k}" aria-checked="false">${l.label}</button>`).join('')}</div>
        <div id="hd-lens"></div>`;
      ui=panel;
      panel.querySelectorAll('[data-sch]').forEach(b=>b.onclick=()=>{v.schedule=b.dataset.sch;render();});
      bindToggle(panel,'hd-mtx',on=>{v.mtx=on;if(ui===panel)render();});
      bindToggle(panel,'hd-ada',on=>{v.ada=on;if(ui===panel)render();});
      panel.querySelectorAll('[data-area]').forEach(b=>b.onclick=()=>{flyTo(b.dataset.area);renderSite();});
      panel.querySelector('#hd-next').onclick=()=>{cur=(cur+1)%SITES.length;const a=SITES[cur].area;if(a!==view)flyTo(a);renderSite();};
      panel.querySelectorAll('[data-lens]').forEach(b=>b.onclick=()=>{lens=lens===b.dataset.lens?null:b.dataset.lens;renderLens();if(!lens)flyTo(view);});
      render();renderSite();renderLens();flyTo('belly');
    },
    exit(){ui=null;if(group)group.visible=false;}
  }};
}
