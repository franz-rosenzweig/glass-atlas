// Stage-two instruments, part 3: the medicines bench. A 24-hour planner with spacing rules,
// and "lenses" that light up where the patient's medicines share an effect.
import * as THREE from 'three';
import { toggle, bindToggle, clamp, fmt, kit } from './kit.js';
import { MEDS } from './data.js';

export function makeStations4(A){
  const K=kit(A);
  const ROWS=[
    {id:'levothyroxine',label:'Levothyroxine',t:6.5},
    {id:'hcq',label:'Hydroxychloroquine',t:7.5},
    {id:'propranolol',label:'Propranolol XR',t:8},
    {id:'lexapro',label:'Lexapro',t:8},
    {id:'adderall',label:'Adderall XR',t:8},
    {id:'iron',label:'Iron',t:11},
    {id:'ldn',label:'Naltrexone (LDN)',t:22},
    {id:'ondansetron',label:'Zofran',t:13,prn:true},
    {id:'tizanidine',label:'Tizanidine',t:21,prn:true},
    {id:'ibuprofen',label:'Ibuprofen',t:13,prn:true},
  ];
  const MEALS=[{id:'b',label:'Breakfast',t:7.5},{id:'l',label:'Lunch',t:12.5},{id:'d',label:'Dinner',t:18.5}];
  const LENS={
    timing:{label:'Timing',parts:[],meds:[],text:'Drag the dots to match a real schedule. The checks below update as you go.'},
    qt:{label:'Heart rhythm (QT)',parts:['Wall of heart'],col:'#EE6F82',meds:['hcq','lexapro','ondansetron'],
      text:'Three of the patient\'s medicines (hydroxychloroquine, Lexapro, Zofran) can lengthen the QT interval, the heart\'s electrical reset. The hydroxychloroquine label goes further and says it isn\'t recommended alongside other QT-lengthening drugs, so the combination is a deliberate prescriber decision, often backed by an ECG. Her own risk factors are worth knowing: vomiting can drain potassium and magnesium, and a very slow pulse adds risk. A baseline ECG is a reasonable thing to ask about, and any new antibiotic (ciprofloxacin, azithromycin), antinausea drug or antihistamine deserves a QT check.'},
    bp:{label:'Blood pressure and pulse',parts:['Wall of heart','#vessels'],col:'#EE6F82',meds:['propranolol','tizanidine','adderall'],
      text:'Propranolol slows the pulse and lowers pressure. Tizanidine lowers pressure and can slow the pulse too, on top of POTS: stand up slowly after a dose, especially from lying down. Adderall pushes pulse and pressure up; the two pull in opposite directions, and the patient\'s prescribers balance them.'},
    seizure:{label:'Seizure threshold',parts:['#brain'],col:'#78A0F4',meds:['hcq','adderall','lexapro'],
      text:'With a seizure history after encephalitis, three of the patient\'s medicines carry seizure cautions on their labels: hydroxychloroquine "can lower the seizure threshold", stimulants "may lower the convulsive threshold" with a seizure history, and escitalopram "should be introduced with care". None is forbidden; all belong in the conversation. If a seizure ever happens, the Adderall label says to stop it, so the prescriber needs to know right away. Serotonin syndrome and, rarely, very low sodium from an SSRI can also cause seizures.'},
    opioid:{label:'Pain relief in an emergency',parts:['#brain'],col:'#F2705F',meds:['ldn'],
      text:'Low-dose naltrexone partly blocks opioid receptors for roughly a day after a dose, so opioid painkillers may work less well and need careful dosing in surgery or the ER. Pain can still be treated; the team just needs to know. For planned surgery the prescriber usually pauses it a few days beforehand, and a wallet card helps. Pair it with the hEDS note: many people with EDS report that local anaesthetics work poorly too.'},
    gut:{label:'Stomach and absorption',parts:['Stomach','Duodenum','Esophagus'],col:'#DDB741',meds:['ibuprofen','ondansetron','levothyroxine','iron','hcq'],
      text:'With gastroparesis, every tablet waits in the stomach before it can be absorbed, so timing effects stretch out. Ibuprofen irritates the stomach lining and, with Lexapro, raises the risk of stomach bleeding; it is also a mast-cell trigger for some people. Zofran eases nausea but can constipate, and iron tablets constipate too. Levothyroxine and iron need their four hours apart regardless. Any new acid reducer or antacid affects levothyroxine, hydroxychloroquine (keep 4 hours apart) and Adderall.'},
    serotonin:{label:'Serotonin',parts:['#brain'],col:'#B193E3',meds:['lexapro','adderall','ondansetron'],
      text:'Lexapro, Adderall and Zofran all raise serotonin activity, and each label warns about combining them. Problems are uncommon. Watch for a cluster that comes on within hours of a new dose or a Zofran: agitation or confusion, shivering or sweating, twitching or jerky muscles, fever, diarrhoea. That cluster needs same-day medical help. Tramadol, triptans and some cough medicines (dextromethorphan) belong to the same family.'},
  };
  const T=Object.fromEntries(ROWS.map(r=>[r.id,r.t]));const M=Object.fromEntries(MEALS.map(m=>[m.id,m.t]));const prnOn={ondansetron:false,tizanidine:false,ibuprofen:false};
  let lens='timing',focus=null,ui;
  const gap=(a,b)=>{const d=Math.abs(a-b)%24;return Math.min(d,24-d);};
  const hhmm=t=>{const h=Math.floor(t),m=Math.round((t-h)*60);return `${String(h%24).padStart(2,'0')}:${String(m).padStart(2,'0')}`;};
  const nextMealAfter=t=>Math.min(...MEALS.map(m=>((M[m.id]-t)%24+24)%24));
  const lastMealBefore=t=>Math.min(...MEALS.map(m=>((t-M[m.id])%24+24)%24));
  const nearMeal=t=>Math.min(...MEALS.map(m=>gap(t,M[m.id])));
  function rules(){
    const out=[];const L=T.levothyroxine;
    const after=nextMealAfter(L),before=lastMealBefore(L);
    out.push(after>=.5&&before>=3?['ok',`Levothyroxine at ${hhmm(L)}: empty stomach, ${fmt(after*60,0)} min before food. Fits the label's timing advice (water only; coffee waits too).`]:
      ['warn',after<.5?`Levothyroxine needs 30–60 minutes before food; the next meal comes ${fmt(after*60,0)} min after it.`:`Levothyroxine ${fmt(before,1)} h after a meal. It needs an empty stomach: 30–60 minutes before food, or 3–4 hours after the last meal if taken at bedtime.`]);
    const gi=gap(L,T.iron);out.push(gi>=4?['ok',`Iron and levothyroxine ${fmt(gi,1)} h apart.`]:['warn',`Iron and levothyroxine only ${fmt(gi,1)} h apart. Iron binds levothyroxine in the gut: keep 4 h.`]);
    out.push(T.adderall<12?['ok',`Adderall XR at ${hhmm(T.adderall)}: fits the label's advice to take it on waking.`]:['warn',`Adderall XR at ${hhmm(T.adderall)}: the label advises against afternoon doses because of insomnia, and lost sleep lowers the patient's seizure threshold.`]);
    out.push(nearMeal(T.hcq)<=.5?['ok','Hydroxychloroquine with a meal: fits the label (with food or milk).']:['note','The hydroxychloroquine label says to take it with food or milk.']);
    if(prnOn.ibuprofen){out.push(nearMeal(T.ibuprofen)<=.5?['ok','Ibuprofen with food.']:['warn','Ibuprofen on an empty stomach irritates the lining; take it with food.']);out.push(['note','Ibuprofen with Lexapro raises the risk of stomach bleeding; food helps the stomach but not the bleeding risk.']);}
    if(prnOn.tizanidine)out.push(['note','Tizanidine plus propranolol plus POTS: blood pressure and pulse can both drop. Stand up slowly. Never with ciprofloxacin.']);
    if(prnOn.ondansetron)out.push(['note','Zofran adds a third QT-lengthening medicine and a third serotonin-active one (with Lexapro and Adderall).']);
    return out;
  }
  function svg(){
    const W=330,L0=104,L1=320,rh=22,top=26;const px=t=>L0+t/24*(L1-L0);
    const rows=ROWS.filter(r=>!r.prn||prnOn[r.id]);const H=top+rh*(rows.length+1)+18;
    const inLens=id=>LENS[lens].meds.includes(id);
    let s=`<svg viewBox="0 0 ${W} ${H}" class="planner" role="img" aria-label="The patient's medicines across 24 hours">`;
    for(const h of [0,6,12,18,24])s+=`<line x1="${px(h)}" x2="${px(h)}" y1="${top-6}" y2="${H-14}" stroke="var(--line)"/><text x="${px(h)}" y="${H-3}" text-anchor="middle">${String(h%24).padStart(2,'0')}:00</text>`;
    s+=`<rect x="${px(22)}" y="${top-6}" width="${px(24)-px(22)}" height="${H-top-8}" fill="#78A0F4" opacity=".07"/><rect x="${px(0)}" y="${top-6}" width="${px(6.5)-px(0)}" height="${H-top-8}" fill="#78A0F4" opacity=".07"/>`;
    s+=`<text x="4" y="${top+4}" class="pl">Meals</text>`;
    for(const m of MEALS)s+=`<g class="hd" data-k="meal:${m.id}" transform="translate(${px(M[m.id])},${top})"><rect x="-6" y="-6" width="12" height="12" rx="2" fill="#DDB741"/><circle r="13" fill="transparent"/></g>`;
    rows.forEach((r,i)=>{const y=top+rh*(i+1);const hi=inLens(r.id),f=focus===r.id;
      s+=`<text x="4" y="${y+4}" class="pl${hi||f?' hi':''}">${r.label}</text><line x1="${L0}" x2="${L1}" y1="${y}" y2="${y}" stroke="var(--line)" stroke-dasharray="2 3"/>`;
      s+=`<g class="hd" data-k="med:${r.id}" transform="translate(${px(T[r.id])},${y})"><circle r="${f?7:6}" fill="${hi?LENS[lens].col:f?'var(--bone)':'var(--bone-2)'}" stroke="var(--void)" stroke-width="1.5"/><circle r="13" fill="transparent"/></g>`;
      s+=`<text x="${clamp(px(T[r.id])+10,L0,L1-30)}" y="${y-7}" class="tm">${hhmm(T[r.id])}</text>`;});
    return s+'</svg>';
  }
  function render(){
    ui.querySelector('#p-svg').innerHTML=svg();
    ui.querySelector('#p-rules').innerHTML=rules().map(([k,t])=>`<li class="${k}">${t}</li>`).join('');
    const Ls=LENS[lens];ui.querySelector('#p-lens').innerHTML=`<p class="regtext">${Ls.text}</p>${Ls.meds.length?`<p class="fine" style="margin-top:0!important">Lit on the body: ${Ls.parts.map(p=>p==='#brain'?'brain':p==='#vessels'?'great vessels':p.replace('Wall of heart','heart').toLowerCase()).join(', ')}.</p>`:''}`;
    ui.querySelectorAll('[data-lens]').forEach(b=>b.setAttribute('aria-checked',b.dataset.lens===lens));
    if(Ls.parts.length){K.setMode({layers:{skin:.3,skeleton:.08,organs:.35,vessels:.5},focus:A.resolve(Ls.parts),focusColor:Ls.col,dim:.25});}
    else K.setMode({layers:{skin:.5,skeleton:.25,organs:.6,vessels:.6}});
  }
  function lensFor(id){for(const [k,l] of Object.entries(LENS))if(l.meds.includes(id))return k;return 'timing';}
  return {meds:{
    id:'meds',title:'Medicines bench',fig:'The patient\'s day, hour by hour',
    enter(panel,opt={}){
      K.resetRig();focus=opt.focus||null;lens=focus?lensFor(focus):'timing';if(focus&&prnOn[focus]===false)prnOn[focus]=true;
      const m=focus&&MEDS.find(x=>x.id===focus);
      panel.innerHTML=`${m?`<p class="lede-s"><b>${m.name}.</b> ${m.text}</p>${m.warn?`<div class="warn"><b>For any provider</b>${m.warn}</div>`:''}`:''}
        <div id="p-svg"></div>
        <div class="tgs three">${['ondansetron','tizanidine','ibuprofen'].map(k=>toggle('p-'+k,ROWS.find(r=>r.id===k).label+' today',prnOn[k],'as needed')).join('')}</div>
        <ul class="rules" id="p-rules"></ul>
        <p class="eyebrow">Where the patient's medicines overlap</p>
        <div class="seg" role="radiogroup" aria-label="Lens">${Object.entries(LENS).map(([k,l])=>`<button role="radio" data-lens="${k}" aria-checked="${k===lens}">${l.label}</button>`).join('')}</div>
        <div id="p-lens"></div>
        <p class="fine">The times are a starting template, not a real schedule, and this is not a dosing plan: the patient's prescribers and pharmacist set the timing. The spacing rules come from the medicines' labels and standard guidance: levothyroxine 30–60 minutes before breakfast, or at bedtime 3–4 hours after eating; iron and levothyroxine 4 hours apart; Adderall XR on waking. The iron row is a supplement, not one of the nine listed medicines; its dose and timing are for her doctor to choose.</p>`;
      ui=panel;
      for(const k of Object.keys(prnOn))bindToggle(panel,'p-'+k,on=>{prnOn[k]=on;if(ui===panel)render();});
      panel.querySelectorAll('[data-lens]').forEach(b=>b.onclick=()=>{lens=b.dataset.lens;render();});
      render();
      // drag handles
      const host=panel.querySelector('#p-svg');let drag=null;
      const toT=e=>{const svgEl=host.querySelector('svg');const r=svgEl.getBoundingClientRect();const x=(e.clientX-r.left)/r.width*330;return clamp(Math.round((x-104)/(320-104)*24*4)/4,0,23.75);};
      host.addEventListener('pointerdown',e=>{const g=e.target.closest('.hd');if(!g)return;drag=g.dataset.k;try{host.setPointerCapture(e.pointerId);}catch(_){}e.preventDefault();});
      host.addEventListener('pointermove',e=>{if(!drag)return;const t=toT(e);const [kind,id]=drag.split(':');if(kind==='meal')M[id]=t;else T[id]=t;render();});
      const end=()=>{drag=null;};host.addEventListener('pointerup',end);host.addEventListener('pointercancel',end);
      A.flyTo({target:[0,1.0,0],dist:3.0,azim:18,elev:4});
    },
    exit(){ui=null;}
  }};
}
