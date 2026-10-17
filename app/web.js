// The connection web: glowing threads through the body between conditions that feed each other.
import * as THREE from 'three';
import { CONDS, SYS } from './data.js';
import { kit, clamp } from './kit.js';
import { cc } from './theme.js';

// Two separate questions per thread: how strong is the evidence in general, and is it known to apply to the patient?
export const STRENGTH={
  strong:{label:'Strong evidence',c:'#ECE6DA',note:'consistent large studies, or an established mechanism'},
  moderate:{label:'Moderate',c:'#40C7AA',note:'repeated observational studies; cause not proven'},
  limited:{label:'Limited',c:'#62BED3',note:'small, single-centre or expert-opinion evidence'},
  contested:{label:'Contested',c:'#B193E3',note:'strict-criteria studies have not confirmed it'},
  med:{label:'Medicine link',c:'#F2A65A',note:'from a medicine label or guideline'},
  alike:{label:'Look-alike',c:'#DDB741',note:'two causes that can look the same'},
};
export const APPLIES={yes:'On the patient\'s chart',unknown:'Depends on something not yet known for the patient'};
export const LINKS=[
  {a:'heds',b:'pots',s:'moderate',h:'yes',t:'Stretchy tissue, pooling blood',x:'POTS is commonly reported alongside hEDS: in one specialist clinic, 31% of POTS patients met the 2017 hEDS criteria (Miller 2020, single centre, no control group). One idea is that more elastic connective tissue in vein walls lets more blood pool on standing; the mechanism is still a hypothesis.'},
  {a:'heds',b:'carth',s:'limited',h:'yes',t:'Loose ligaments, early wear?',x:'One proposed explanation: lax ligaments let neck joints move more than they should, so joints and discs take loads at odd angles. It is a reasonable idea, but there are no controlled studies of neck arthritis in hEDS yet.'},
  {a:'heds',b:'c67',s:'limited',h:'yes',t:'Extra motion, extra disc strain?',x:'Excess motion is thought to load the discs. No study has yet linked hEDS to neck disc herniation, and one lumbar MRI study even found less disc wear in hypermobile adults. A herniated disc can happen to anyone.'},
  {a:'heds',b:'lspurs',s:'contested',h:'yes',t:'Spurs as scaffolding?',x:'One idea is that spurs form where joints move too much, as the body tries to steady them. But a study of over 5,000 people found hypermobility was not linked to lumbar spine arthritis (Goode 2019), so for the patient the spurs may be ordinary wear.'},
  {a:'heds',b:'gastro',s:'limited',h:'yes',t:'The gut is connective tissue too',x:'Gut symptoms are common in hEDS. Slow emptying specifically "may be more common", according to a 2025 American Gastroenterological Association practice update based on expert opinion rather than a systematic review.'},
  {a:'heds',b:'mcas',s:'contested',h:'yes',t:'The "triad"',x:'hEDS, POTS and MCAS are often described together. A 2025 systematic review found no studies using strict diagnostic criteria that confirm the link (Farley 2025; see also Kucharik 2020), so it remains an open question.'},
  {a:'mcas',b:'pots',s:'contested',h:'yes',t:'Flares that look like POTS',x:'Mast-cell mediators can speed the heart and widen vessels, so a flare can look like POTS. Whether the two truly travel together is unconfirmed. One practical overlap is certain: the patient\'s propranolol can make epinephrine work less well in a severe reaction. Epinephrine is still given first, straight away; the ER has glucagon as a backup.'},
  {a:'pots',b:'gastro',s:'moderate',h:'yes',t:'One nervous system runs both',x:'The autonomic nervous system controls the gut as well as the heart and vessels. Gut symptoms are among the commonest POTS complaints (Mehr 2018 review); slow emptying is found in some patients and fast emptying in others.'},
  {a:'endo',b:'iron',s:'strong',h:'unknown',t:'Heavy periods drain iron',x:'Heavy menstrual bleeding is one of the commonest causes of iron deficiency in women. Whether it applies to the patient is unknown: endometriosis is only suspected, it is mainly a pain condition, and her period history isn\'t on the chart.'},
  {a:'iron',b:'pots',s:'limited',h:'unknown',t:'Low iron and a racing heart',x:'Low iron stores were common in two small studies of teenagers with POTS (Jarjour 2013, 24 patients; Antiel 2011), though in the larger one the heart-rate rise didn\'t track ferritin. Whether correcting iron improves POTS is being tested. If iron falls far enough to cause anaemia, the heart does have to work harder. POTS specialists commonly check ferritin.'},
  {a:'ra',b:'iron',s:'strong',h:'yes',t:'Inflammation locks iron away',x:'RA inflammation raises IL-6, which raises hepcidin, the hormone that shuts iron\'s exit door. That is anaemia of inflammation, and it can stack on top of true iron deficiency. Inflammation also raises ferritin, so the patient\'s iron test can look better than her stores really are.'},
  {a:'hashi',b:'ra',s:'strong',h:'yes',t:'Autoimmune conditions cluster',x:'In one large clinic study about 4 in 100 people with autoimmune thyroid disease also had RA, against roughly 1 in 200 people overall (Boelaert 2010); meta-analyses find thyroid disease about twice as often in RA. They co-occur; neither is shown to cause the other.'},
  {a:'hashi',b:'gastro',s:'limited',h:'unknown',t:'A slow thyroid can slow the gut',x:'Untreated hypothyroidism can slow the gut, and it is listed among the causes of gastroparesis. In the patient\'s case the stomach problem came first (2018, Hashimoto\'s in 2023), and on levothyroxine with a normal TSH the thyroid shouldn\'t be slowing it. The practical link runs the other way: a slow stomach can make levothyroxine absorption less predictable, so TSH is worth watching.'},
  {a:'iron',b:'hashi',s:'med',h:'yes',t:'Four hours apart, and a shared gut',x:'Iron tablets bind levothyroxine in the gut, so they go at least four hours apart (label). Separately, autoimmune thyroid disease travels with coeliac disease and autoimmune gastritis, which can cause iron deficiency that resists tablets and make levothyroxine absorb poorly; a coeliac blood test is worth asking about. (TPO, the enzyme that builds thyroid hormone, also contains iron.)'},
  {a:'ra',b:'enceph',s:'med',h:'yes',t:'A label caution',x:'Hydroxychloroquine\'s label says it can lower the seizure threshold. After encephalitis with seizures, that belongs in every prescribing decision; it does not mean the patient can\'t take it.'},
  {a:'c67',b:'ra',s:'alike',h:'yes',t:'Why won\'t the hand open?',x:'A hand that won\'t open can come from RA stiffness or from weakness of the C7 nerve, which powers the finger extensors. One-sided tingling down the back of the arm points to the neck; long morning stiffness in both hands points to RA.'},
  {a:'ra',b:'lsil',s:'med',h:'unknown',t:'If Humira starts',x:'Cervical screening guidance treats RA on immunosuppressive treatment like HIV: more frequent screening, and any LSIL goes to colposcopy whatever the HPV result. Hydroxychloroquine on its own usually doesn\'t count; Humira does. If Humira starts, ask whether the patient\'s Pap schedule and LSIL follow-up should change, and whether HPV vaccination (an option up to age 45) makes sense first.'},
  {a:'endo',b:'gastro',s:'alike',h:'unknown',t:'Cyclical gut symptoms',x:'Endometriosis on or near the bowel can cause bloating, pain and bowel changes that rise and fall with the cycle, overlapping with gastroparesis symptoms. Noting whether the patient\'s gut symptoms follow her cycle helps tell them apart.'},
];
const ANCHOR={pots:['Wall of heart'],heds:['Right patella'],mcas:['Jejunum'],hashi:['#thyroid'],enceph:['Corpus callosum'],iron:['Liver'],gastro:['Stomach'],
  carth:['Fourth cervical vertebra'],c67:['Intervertebral disk of sixth cervical vertebra'],lspurs:['Fourth lumbar vertebra'],lsil:['Cervix'],ra:['#righthand'],endo:['Left ovary','Uterus']};

export function makeWeb(A){
  const K=kit(A);const {V3}=A;let G=null,arcs=[],labels=null,tickOff,ui,sel=null,node=null;const byId=Object.fromEntries(CONDS.map(c=>[c.id,c]));
  const pos={};
  function anchor(id){const box=new THREE.Box3();for(const r of A.resolve(ANCHOR[id])){r.geo.computeBoundingBox();box.union(r.geo.boundingBox);}return box.getCenter(V3());}
  function build(){
    G=new THREE.Group();A.root.add(G);
    for(const id in ANCHOR)pos[id]=anchor(id);
    pos.ra=A.hand.right.fingers[2][1].pivot.clone();
    LINKS.forEach((L,i)=>{
      const p0=pos[L.a],p1=pos[L.b];const mid=p0.clone().add(p1).multiplyScalar(.5);const d=p0.distanceTo(p1);
      const bow=V3(((i%3)-1)*.04,0,.16+d*.32);const c=new THREE.QuadraticBezierCurve3(p0,mid.add(bow),p1);
      const col=new THREE.Color(STRENGTH[L.s].c);
      const mat=A.tm(THREE.MeshBasicMaterial,{color:STRENGTH[L.s].c,transparent:true,opacity:.55,depthWrite:false,blending:THREE.AdditiveBlending});
      const m=new THREE.Mesh(new THREE.TubeGeometry(c,60,L.s==='contested'||L.s==='limited'?.0014:.0022,6,false),mat);m.renderOrder=30;G.add(m);
      const pulses=[];for(let k=0;k<3;k++){const s=new THREE.Mesh(new THREE.SphereGeometry(.0065,10,8),A.tm(THREE.MeshBasicMaterial,{color:STRENGTH[L.s].c,transparent:true,opacity:.95,depthWrite:false,blending:THREE.AdditiveBlending}));s.renderOrder=31;G.add(s);pulses.push({m:s,u:k/3});}
      arcs.push({L,curve:c,mesh:m,pulses,col});
    });
    for(const id in pos){const s=new THREE.Mesh(new THREE.SphereGeometry(.011,16,12),A.tm(THREE.MeshBasicMaterial,{color:SYS[byId[id].sys].c,transparent:true,opacity:.95,depthWrite:false}));s.position.copy(pos[id]);s.renderOrder=32;G.add(s);}
    labels=document.createElement('div');labels.className='web-labels';document.getElementById('app').appendChild(labels);
    labels.innerHTML=Object.keys(pos).map(id=>`<button class="wl" data-n="${id}" style="--c:${cc(SYS[byId[id].sys].c)}">${byId[id].short}</button>`).join('');
    labels.addEventListener('click',e=>{const b=e.target.closest('[data-n]');if(b)pickNode(b.dataset.n);});
  }
  function listHTML(){
    const show=LINKS.map((L,i)=>[L,i]).filter(([L])=>!node||L.a===node||L.b===node);
    return show.map(([L,i])=>`<button class="wlink${sel===i?' on':''}" data-i="${i}" style="--s:${cc(STRENGTH[L.s].c)}"><span class="wl-pair">${byId[L.a].short} <i>↔</i> ${byId[L.b].short}</span><span class="wl-t">${L.t}</span><span class="wl-s">${STRENGTH[L.s].label}${L.h==='unknown'?' · not yet known for the patient':''}</span>${sel===i?`<span class="wl-x">${L.x}</span>`:''}</button>`).join('');
  }
  function render(){ui.querySelector('#w-list').innerHTML=listHTML();ui.querySelector('#w-node').innerHTML=node?`Showing links for <b>${byId[node].name}</b> <button class="btn" id="w-all" type="button">Show all</button>`:'Tap a condition label on the body to filter.';
    const all=ui.querySelector('#w-all');if(all)all.onclick=()=>{node=null;sel=null;render();frame();};
    ui.querySelectorAll('.wlink').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;sel=sel===i?null:i;render();frame();ui.querySelector('.wlink.on')?.scrollIntoView({block:'nearest',behavior:'smooth'});});}
  function frame(){
    if(sel!=null){const L=LINKS[sel];const a=pos[L.a],b=pos[L.b];const c=a.clone().add(b).multiplyScalar(.5);const d=a.distanceTo(b);
      A.flyTo({target:[c.x,c.y,c.z+.05],dist:Math.max(1.7,d*2.4),azim:18,elev:6});}
    else if(node){const p=pos[node];A.flyTo({target:[p.x*.5,p.y*.6+.35,0],dist:2.6,azim:16,elev:4});}
    else A.flyTo({target:[0,0.95,0.05],dist:3.2,azim:14,elev:6});
  }
  function pickNode(id){node=node===id?null:id;sel=null;render();frame();}
  const v=V3();const OFF={c67:'translate(-112%,-50%)',hashi:'translate(14%,-50%)',mcas:'translate(-112%,-50%)',lspurs:'translate(14%,-50%)',endo:'translate(-50%,70%)',lsil:'translate(14%,-20%)',gastro:'translate(14%,-50%)',iron:'translate(-112%,-50%)'};
  return {id:'web',title:'Connections',fig:'How the patient\'s conditions feed each other',
    enter(panel){
      K.resetRig();if(!G)build();G.visible=true;labels.hidden=false;sel=null;node=null;
      K.setMode({layers:{skin:.35,skeleton:.12,organs:.18,vessels:.12}});
      panel.innerHTML=`<p class="lede-s">Several of the patient's diagnoses are linked; a few are separate stories. Each thread is a link researchers have described, coloured by how strong the evidence is, and marked when it isn't yet known whether it applies to her.</p>
        <div class="w-legend">${Object.values(STRENGTH).map(s=>`<span title="${s.note}"><i style="background:${cc(s.c)}"></i>${s.label}</span>`).join('')}</div>
        <p class="fine" id="w-node" style="margin:6px 0!important"></p>
        <div id="w-list"></div>
        <p class="fine">Links are drawn from published reviews, guidelines and medicine labels. Strong: consistent large studies or an established mechanism. Moderate: repeated observational studies. Limited: small, single-centre or expert-opinion evidence. Contested: studies using strict criteria haven't confirmed it. Co-occurring doesn't prove one condition causes the other, and a well-proven link in general can still be unknown for the patient. LSIL and encephalitis have few links because their causes (HPV, the original brain inflammation) are separate stories.</p>`;
      ui=panel;render();frame();
      tickOff=A.onTick(dt=>{
        arcs.forEach((a,i)=>{const on=(sel==null||sel===i)&&(!node||a.L.a===node||a.L.b===node);const dim=sel!=null&&sel!==i||(node&&!on);
          a.mesh.material.opacity=dim?.06:sel===i?.95:.5;for(const p of a.pulses){p.u=(p.u+dt*(a.L.s==='contested'?.1:a.L.s==='limited'?.15:.22))%1;a.curve.getPointAt(p.u,p.m.position);p.m.visible=!dim;p.m.scale.setScalar(sel===i?1.5:1);}});
        // labels follow their anchors on screen
        const r=A.renderer.domElement.getBoundingClientRect();
        labels.querySelectorAll('.wl').forEach(b=>{const id=b.dataset.n;v.copy(pos[id]);A.root.localToWorld(v);v.project(A.camera);
          const x=(v.x*.5+.5)*r.width,y=(-v.y*.5+.5)*r.height;b.style.transform=`translate(${x}px,${y}px) ${OFF[id]||'translate(-50%,-160%)'}`;b.style.opacity=v.z<1?1:0;
          b.classList.toggle('dim',!!node&&id!==node&&!LINKS.some(L=>(L.a===node&&L.b===id)||(L.b===node&&L.a===id)));b.classList.toggle('on',id===node);});
      });
    },
    exit(){tickOff?.();if(G)G.visible=false;if(labels)labels.hidden=true;},
    show(v){if(!G){build();labels.hidden=true;}G.visible=v;}
  };
}
