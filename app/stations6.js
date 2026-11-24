// Stage-two instruments, part 5: the daily bench for Zyrtec (cetirizine). A week of daily doses and what
// the dose and the kidneys change; weeks, months and years of use, including stopping; what it helps and
// what it doesn't; when to call; and how it meets the patient's other conditions. Content and sources
// live in data.js (ZYRTEC).
import { toggle, bindToggle, fmt, kit, lineChart } from './kit.js';
import { ZYRTEC } from './data.js';
import { cc } from './theme.js';
import { REFS } from './refs.js';

const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const srcs=keys=>keys?.length?`<p class="srcline">Sources: ${keys.map(k=>`<button type="button" data-src="${k}">${esc(REFS[k]?.s||k)}</button>`).join(' · ')}</p>`:'';

/* ---------- the level model: one compartment, first-order absorption (see ZYRTEC.pk) */
const P=ZYRTEC.pk,KE0=Math.LN2/P.halfLifeH;
// absorption rate that puts the peak at the label's one hour: solve ln(ka/ke)/(ka-ke)=tmax
const KA=(()=>{let lo=KE0*1.01,hi=50;for(let i=0;i<80;i++){const m=(lo+hi)/2;Math.log(m/KE0)/(m-KE0)>P.tmaxH?lo=m:hi=m;}return (lo+hi)/2;})();
const unit=(ke,t)=>t<0?0:KA/(KA-ke)*(Math.exp(-ke*t)-Math.exp(-KA*t));
const daily=(ke,t,days)=>{let s=0;for(let d=0;d<days;d++)s+=unit(ke,t-24*d);return s;};
// scale so 10 mg a day peaks at the label's 311 ng/mL once settled (healthy kidneys)
const SCALE=(()=>{let hi=0;for(let t=216;t<240;t+=.1)hi=Math.max(hi,daily(KE0,t,11));return P.peak10/hi/10;})();
export function zyLevels({dose=10,kidney=false,days=7,step=.25}={}){
  const ke=kidney?KE0/P.kidneyX:KE0;const C=t=>dose*SCALE*daily(ke,t,days);
  const pts=[];for(let t=0;t<=24*days+1e-9;t+=step)pts.push([t,C(t)]);
  const peakIn=d=>{let hi=0;for(let t=24*d;t<24*d+24;t+=.1)hi=Math.max(hi,C(t));return hi;};
  const lowBefore=d=>C(24*d-.01);
  return {pts,first:peakIn(0),last:peakIn(days-1),low:lowBefore(days-1)};
}

export function makeStations6(A){
  const K=kit(A);
  let ui,lens=null;
  const v={dose:10,kidney:false,month:'keep'};

  function chart(){
    const L=zyLevels(v);const top=Math.max(400,Math.ceil(L.last*1.15/200)*200);
    const {svg}=lineChart({W:330,H:170,x0:0,x1:170,y0:0,y1:top,left:34,
      xticks:[0,24,48,72,96,120,144],xfmt:h=>'day '+(h/24+1),yticks:[0,top/4,top/2,top*3/4,top].map(Math.round),
      label:'Cetirizine level in the blood over a week of daily doses, illustrative',
      extra:(px,py)=>`<rect x="${px(1)}" y="${py(top)}" width="${px(170)-px(1)}" height="6" fill="var(--immune)" opacity=".35"/>
        <text x="${px(2)}" y="${py(top)+16}">skin test blocked from about an hour on</text>
        ${[0,1,2,3,4,5,6].map(d=>`<path d="M${px(24*d)} ${py(0)}l-4 7h8z" fill="var(--immune)"/>`).join('')}`,
      series:[{pts:L.pts,stroke:'var(--immune)',width:2.2}]});
    return {svg,L};
  }
  function render(){
    const {svg,L}=chart();
    ui.querySelector('#zy-chart').innerHTML=svg;
    ui.querySelector('#zy-hi').textContent=fmt(L.last,0)+' ng/mL';
    ui.querySelector('#zy-lo').textContent=fmt(L.low,0)+' ng/mL';
    // a one-compartment model dosed daily always rises a little (about 1.2×); the label measured no build-up at 10 mg
    const r=L.last/L.first;ui.querySelector('#zy-acc').textContent=r<1.3?'barely; the label saw none':'yes, to '+fmt(r,1)+'× day one';
    const b=ZYRTEC.brain[v.dose];ui.querySelector('#zy-br').textContent=b?'about '+fmt(b,0)+'%':'not measured';
    ui.querySelector('#zy-note').innerHTML=ZYRTEC.scenario[v.kidney?'kidney':'d'+v.dose];
    ui.querySelectorAll('[data-dose]').forEach(b=>b.setAttribute('aria-checked',+b.dataset.dose===v.dose));
  }
  // weeks, months, years: a timeline in months, with the days that matter drawn larger than life
  function timeline(){
    const W=330,H=100,L0=16,L1=306,px=m=>L0+(m+1)/37*(L1-L0);const k=v.month;
    let s=`<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Weeks, months and years on cetirizine">`;
    s+=`<line x1="${L0}" x2="${L1}" y1="52" y2="52" stroke="var(--line-2)"/>`;
    for(const m of [0,6,12,24,36])s+=`<line x1="${px(m)}" x2="${px(m)}" y1="48" y2="56" stroke="var(--dim)"/><text x="${px(m)}" y="68" text-anchor="middle">${m?m+' mo':'start'}</text>`;
    // the evidence: the skin block held in small studies to about six months; beyond that, little data
    s+=`<rect x="${px(0)}" y="40" width="${px(6)-px(0)}" height="7" fill="var(--immune)" opacity=".55"/><rect x="${px(6)}" y="40" width="${px(36)-px(6)}" height="7" fill="none" stroke="var(--immune)" stroke-dasharray="3 3" opacity=".7"/>`;
    s+=`<text x="${px(0)}" y="30">held in studies</text><text x="${px(6)+4}" y="30">little data after 6 mo</text>`;
    const stop=(m,a,b)=>`<line x1="${px(m)}" x2="${px(m)}" y1="36" y2="58" stroke="var(--alert)" stroke-width="2"/><text x="${m>20?px(m)-5:px(m)+5}" y="84" text-anchor="${m>20?'end':'start'}" fill="var(--alert)">${a}</text><text x="${m>20?px(m)-5:px(m)+5}" y="95" text-anchor="${m>20?'end':'start'}" fill="var(--alert)">${b}</text>`;
    if(k==='stop2w')s+=stop(.5,'stopped at two weeks','itch rarely reported this early');
    if(k==='stop3y')s+=stop(33,'stopped at 33 months (the median)','itch from day 1 to 5');
    if(k==='skin')s+=stop(24,'stopped 2–7 days','before the skin test');
    return s+'</svg>';
  }
  function renderMonths(){
    ui.querySelector('#zy-tl').innerHTML=timeline();
    ui.querySelector('#zy-mo').innerHTML=ZYRTEC.months[v.month];
    ui.querySelectorAll('[data-mo]').forEach(b=>b.setAttribute('aria-checked',b.dataset.mo===v.month));
  }
  function home(){K.setMode({layers:{skin:.55,skeleton:.12,organs:.2,vessels:.2},focus:A.resolve(['Skin']),focusColor:'#F29A55',dim:.35});A.flyTo({target:[0,1.05,0],dist:2.6,azim:16,elev:4});}
  function renderLens(){
    ui.querySelectorAll('[data-lens]').forEach(b=>b.setAttribute('aria-checked',b.dataset.lens===lens));
    const box=ui.querySelector('#zy-lens');
    if(!lens){box.innerHTML='';home();return;}
    const L=ZYRTEC.lenses[lens];
    box.innerHTML=`<p class="regtext" style="--c:${cc(L.col)}">${L.text}</p>`+srcs(L.refs);
    if(L.parts.length){K.setMode({layers:{skin:L.parts.includes('Skin')?.6:.25,skeleton:.08,organs:.35,vessels:.3},focus:A.resolve(L.parts),focusColor:L.col,dim:.25});if(L.cam)A.flyTo(L.cam);}
    else{K.setMode({layers:{skin:.5,skeleton:.15,organs:.35,vessels:.3}});A.flyTo({target:[0,.95,0],dist:3,azim:16,elev:4});}
  }

  return {zyrtec:{
    id:'zyrtec',title:'Daily bench',fig:'One tablet a day, for months',
    enter(panel){
      K.resetRig();lens=null;Object.assign(v,{dose:10,kidney:false,month:'keep'});
      panel.innerHTML=`<p class="illus">Illustrative · not the patient's numbers</p>
        <p class="eyebrow">Blood level</p>
        <div class="seg" role="radiogroup" aria-label="Dose">${[[10,'10 mg'],[20,'20 mg (2×)'],[40,'40 mg (4×)']].map(([d,l])=>`<button type="button" role="radio" data-dose="${d}" aria-checked="${d===v.dose}">${l}</button>`).join('')}</div>
        <div id="zy-chart"></div>
        <div class="tgs">${toggle('zy-kid','Kidneys working less well',false,'moderate impairment: the half-life triples')}</div>
        <div class="readouts">
          <div class="ro"><span>Highest level, day seven</span><b id="zy-hi">—</b></div>
          <div class="ro"><span>Low point before the next tablet</span><b id="zy-lo">—</b></div>
          <div class="ro"><span>Builds up over the week</span><b id="zy-acc" class="sm">—</b></div>
          <div class="ro"><span>Brain H1 receptors filled</span><b id="zy-br" class="sm">—</b></div>
        </div>
        <p class="regtext" id="zy-note"></p>
        <p class="fine">${ZYRTEC.modelNote} ${ZYRTEC.sleepy} Brain figures: PET scans, Tashiro 2009.</p>
        <p class="eyebrow">Weeks, months, years</p>
        <div class="seg" role="radiogroup" aria-label="How long">${[['keep','Taking it daily'],['stop2w','Stopping after weeks'],['stop3y','Stopping after years'],['skin','Before skin tests']].map(([k,l])=>`<button type="button" role="radio" data-mo="${k}" aria-checked="${k===v.month}">${l}</button>`).join('')}</div>
        <div id="zy-tl"></div>
        <p class="regtext" id="zy-mo"></p>
        <p class="eyebrow">Helps, and doesn’t</p>
        <ul class="rules zy-helps">${ZYRTEC.helps.map(([k,t])=>`<li class="${k}"><b>${k==='yes'?'Helps':k==='no'?'Doesn’t':'Some'}</b> ${t}</li>`).join('')}</ul>
        <p class="eyebrow">When to call</p>
        <ul class="em">${ZYRTEC.call.map(([t,sig,act])=>`<li><b>${esc(t)}</b><i>${esc(sig)}</i><span>${esc(act)}</span></li>`).join('')}</ul>
        <p class="eyebrow">Other conditions</p>
        <div class="seg" role="radiogroup" aria-label="Topic">${Object.entries(ZYRTEC.lenses).map(([k,l])=>`<button type="button" role="radio" data-lens="${k}" aria-checked="false">${l.label}</button>`).join('')}</div>
        <div id="zy-lens"></div>`;
      ui=panel;
      panel.querySelectorAll('[data-dose]').forEach(b=>b.onclick=()=>{v.dose=+b.dataset.dose;render();});
      bindToggle(panel,'zy-kid',on=>{v.kidney=on;if(ui===panel)render();});
      panel.querySelectorAll('[data-mo]').forEach(b=>b.onclick=()=>{v.month=b.dataset.mo;renderMonths();});
      panel.querySelectorAll('[data-lens]').forEach(b=>b.onclick=()=>{lens=lens===b.dataset.lens?null:b.dataset.lens;renderLens();});
      render();renderMonths();renderLens();
    },
    exit(){ui=null;}
  }};
}
