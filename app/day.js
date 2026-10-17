// A day in the patient's body: scrub 24 hours and watch the body respond. An imagined, typical day built from the patient's chart.
import * as THREE from 'three';
import { kit, clamp, lerp, fmt } from './kit.js';

const EV=[
  {t:6.5,k:'wake',title:'Waking up stiff',parts:['#righthand','#lefthand'],col:'#F29A55',cam:'hands',
    x:'RA stiffness is worst after rest. Lasting an hour or more is the inflammatory pattern; stiffness from hypermobility or wear usually eases within half an hour.'},
  {t:6.6,k:'levo',title:'Levothyroxine, empty stomach',parts:['#thyroid','Stomach'],col:'#40C7AA',cam:'neck',
    x:'Taken first, with water only, 30–60 minutes before food or coffee, so nothing in the stomach binds it.'},
  {t:7.0,k:'stand',title:'Standing up',parts:['Wall of heart','#legveins'],col:'#EE6F82',cam:'body',
    x:'Half a litre to a litre of blood heads for the patient\'s legs and belly. The heart races to compensate: the POTS rise, often 30 bpm or more, and usually at its worst in the first hours of the morning.'},
  {t:7.5,k:'breakfast',title:'Breakfast and hydroxychloroquine',parts:['Stomach','Duodenum'],col:'#DDB741',cam:'gut',
    x:'Hydroxychloroquine with food is gentler on the stomach. With gastroparesis, breakfast is still partly there at lunch.'},
  {t:8.0,k:'meds',title:'Propranolol, Lexapro, Adderall',parts:['Wall of heart','#brain'],col:'#EE6F82',cam:'body',
    x:'Propranolol XR works steadily across the day (each slow-release capsule peaks around six hours later, and yesterday\'s is still working). Adderall nudges heart rate the other way; Lexapro works quietly in the brain. Taking the stimulant on waking keeps it from stealing sleep.'},
  {t:10.0,k:'desk',title:'Head down at a desk',parts:['Sixth cervical vertebra','Seventh cervical vertebra','Intervertebral disk of sixth cervical vertebra','#c7nerve'],col:'#B193E3',cam:'neck',force:['#c7nerve'],
    x:'Long periods looking down tire the neck muscles and load the lower discs: a deep ache in the neck or between the shoulder blades. Arm tingling from the C6/C7 disc is more often set off by tipping the head back or turning toward the sore side, like checking a blind spot. Resting a hand on top of the head often eases it.'},
  {t:11.0,k:'iron',title:'Iron, four hours after levothyroxine',parts:['Duodenum'],col:'#D9A441',cam:'gut',
    x:'Spaced four hours from levothyroxine. Taken every other day, each tablet is absorbed a little better; the patient\'s doctor chooses the schedule.'},
  {t:12.5,k:'lunch',title:'Lunch, and nausea',parts:['Stomach','Esophagus'],col:'#DDB741',cam:'gut',
    x:'Small, low-fat meals of soft, well-chewed or blended food empty fastest, and liquids often empty normally even when solids don\'t. Zofran can take the edge off nausea; it doesn\'t speed the stomach.'},
  {t:15.0,k:'slump',title:'The afternoon slump',parts:['Wall of heart','#vessels','#brain'],col:'#EE6F82',cam:'body',
    x:'POTS fatigue, low iron, and thyroid levels that drift off target all point the same way. Fluids, salt, compression and sitting before the patient has to are not laziness; they are treatment.'},
  {t:17.0,k:'mcas',title:'A hot day, a warm shower',parts:['Skin'],col:'#F29A55',cam:'body',
    x:'Heat is a common mast-cell trigger. Flushing, itch or a racing heart after a hot shower can be MCAS, POTS, or both.'},
  {t:18.5,k:'dinner',title:'Dinner',parts:['Stomach','Duodenum'],col:'#DDB741',cam:'gut',
    x:'The day\'s third meal joins whatever is left of lunch.'},
  {t:20.0,k:'flare',title:'Evening pain',parts:['#righthand','#lefthand','Fourth cervical vertebra','Fifth cervical vertebra','Sixth cervical vertebra'],col:'#F2705F',cam:'body',
    x:'Joints and neck ache after a full day. Ibuprofen goes with food, and with Lexapro it raises stomach-bleeding risk, so lowest dose, shortest time. Tizanidine relaxes muscles but lowers blood pressure, so the patient stands slowly.'},
  {t:22.0,k:'ldn',title:'Low-dose naltrexone',parts:['#brain'],col:'#78A0F4',cam:'head',
    x:'Commonly taken at bedtime; if it brings vivid dreams or broken sleep, morning dosing is an option to ask about. It partly blocks opioid receptors, which is why any ER or surgical team needs to know.'},
  {t:22.5,k:'ice',title:'Ice packs',parts:['#righthand','#lefthand','Right patella','Left patella'],col:'#71C6FF',cam:'hands',
    x:'Cold numbs pain and can calm a hot, swollen joint. 15–20 minutes at a time, with a cloth between the pack and the skin; falling asleep on an ice pack can injure skin and nerves. For morning stiffness many people find warmth helps more, and if ice ever brings on hives or flushing (cold is a mast-cell trigger for some), switch to warmth.'},
  {t:23.0,k:'sleep',title:'Protecting sleep',parts:['#brain'],col:'#78A0F4',cam:'head',
    x:'After encephalitis with seizures, sleep is protective: short nights lower the seizure threshold. Pain and a racing heart are the usual thieves.'},
];
// smooth illustrative curves across the day (hours 6 → 30)
const gp=(t,c,w)=>Math.exp(-((t-c)**2)/(2*w*w));
function curves(h){
  const H=h<6?h+24:h;
  const stiff=clamp((H>=6.5?Math.exp(-(H-6.5)/0.9):.6)+.35*gp(H,20.5,1.4)+(H>23?.25:0),0,1);
  // Propranolol XR at steady state: a fairly flat effect with a mild trough before the morning capsule.
  // The standing rise is largest in the early morning (Brewster 2012); Adderall adds a few bpm.
  const up=H>=7&&H<22.5?1:0;const prop=H<8?.8:H<10?lerp(.8,.68,(H-8)/2):.68;
  const hr=Math.round(66+up*(14+20*prop+8*gp(H,7.6,.9))+(H>=8.5&&H<22?3:0)+6*gp(H,17.2,.5));
  const meal=(c)=>H>=c?Math.exp(-Math.pow((H-c)/3.3,1.25)):0;
  const stomach=clamp(meal(7.5)*.8+meal(12.5)+meal(18.5),0,1.6)/1.6;
  const pain=clamp(.28+.45*gp(H,20.5,1.3)+.25*stiff*(H<9?1:0)-(H>21?.2:0)-(H>22.5?.12:0),0,1);
  const energy=clamp(.75-.35*gp(H,15.2,1.6)-.25*(H>21?1:0)+.1*gp(H,10,1.5),0,1);
  return {stiff,hr,stomach,pain,energy};
}

export function makeDay(A){
  const K=kit(A);const {V3}=A;let tickOff,ui,h=6,playing=false,cur=-1,curveSVG='';
  const hhmm=x=>{const v=((x%24)+24)%24;const H=Math.floor(v),M=Math.round((v-H)*60)%60;return `${String(H).padStart(2,'0')}:${String(M).padStart(2,'0')}`;};
  function curl(k){for(const s of ['right','left']){const H=A.hand[s];if(!H)continue;for(let f=1;f<5;f++){const ch=H.fingers[f];const ang=[0,40,55,22];for(let b=1;b<ch.length;b++){ch[b].node.quaternion.setFromAxisAngle(ch[b].axis,(ang[b]||0)*k*Math.PI/180);}}}}
  function cam(which){const H=A.hand.right;
    if(which==='hands'){const p=H.wrist;A.flyTo({target:[0,p.y+.05,p.z+.05],dist:1.6,azim:8,elev:10});}
    else if(which==='neck')A.flyTo({target:[0,1.42,0],dist:.8,azim:-30,elev:6});
    else if(which==='gut')A.flyTo({target:[.03,1.1,.04],dist:.9,azim:24,elev:6});
    else if(which==='head')A.flyTo({target:[0,1.53,0],dist:.75,azim:30,elev:8});
    else A.flyTo({target:[0,.95,0],dist:3.1,azim:16,elev:4});}
  function setEvent(i){if(i===cur)return;cur=i;const e=EV[i];
    K.setMode({layers:{skin:.45,skeleton:.3,organs:.35,vessels:.4},focus:A.resolve(e.parts),focusColor:e.col,dim:.35,forceShow:e.force?A.resolve(e.force):null});
    cam(e.cam);if(ui){ui.querySelectorAll('.dy-ev').forEach((b,j)=>b.classList.toggle('on',j===i));
      ui.querySelector('#dy-now').innerHTML=`<b>${hhmm(e.t)} · ${e.title}</b>${e.x}`;}}
  function eventAt(h){const H=h<6?h+24:h;let i=0;for(let j=0;j<EV.length;j++)if(EV[j].t<=H+1e-6)i=j;return H<EV[0].t?EV.length-1:i;}
  function dial(){const R=86,C=100;const pt=(hh,r)=>{const a=(hh/24)*Math.PI*2-Math.PI/2;return [C+Math.cos(a)*r,C+Math.sin(a)*r];};
    let s=`<svg viewBox="0 0 200 200" class="dy-dial" role="img" aria-label="24-hour clock"><circle cx="100" cy="100" r="${R}" fill="none" stroke="var(--line-2)" stroke-width="10"/>`;
    // night arc
    const arc=(a0,a1,col)=>{const [x0,y0]=pt(a0,R),[x1,y1]=pt(a1,R);const large=((a1-a0+24)%24)>12?1:0;return `<path d="M${x0} ${y0} A${R} ${R} 0 ${large} 1 ${x1} ${y1}" stroke="${col}" stroke-width="10" fill="none"/>`;};
    s+=arc(23,6.5,'rgba(120,160,244,.35)');
    for(const e of EV){const [x,y]=pt(e.t%24,R);s+=`<circle cx="${x}" cy="${y}" r="3.5" fill="${e.col}"/>`;}
    for(const hh of [0,6,12,18]){const [x,y]=pt(hh,R-22);s+=`<text x="${x}" y="${y+3}" text-anchor="middle">${String(hh).padStart(2,'0')}</text>`;}
    const [hx,hy]=pt(h%24,R-4);s+=`<line id="dy-hand" x1="100" y1="100" x2="${hx}" y2="${hy}" stroke="var(--bone)" stroke-width="2.5" stroke-linecap="round"/><circle cx="100" cy="100" r="4" fill="var(--bone)"/>`;
    s+=`<text id="dy-clock" x="100" y="128" text-anchor="middle" class="big">${hhmm(h)}</text></svg>`;return s;}
  function chart(){const W=300,Hh=120,x0=6,x1=30;const px=t=>10+(t-x0)/(x1-x0)*(W-20),py=v=>Hh-14-v*(Hh-28);
    const ser=(fn,col,dash)=>{let d='';for(let t=x0;t<=x1;t+=.1){const v=fn(curves(t%24));d+=(t===x0?'M':'L')+px(t).toFixed(1)+' '+py(v).toFixed(1);}return `<path d="${d}" fill="none" stroke="${col}" stroke-width="1.8" ${dash?'stroke-dasharray="4 3"':''}/>`;};
    return `<svg viewBox="0 0 ${W} ${Hh}" class="chart" role="img" aria-label="How the day's measures move">${[6,12,18,24,30].map(t=>`<text x="${px(t)}" y="${Hh-2}" text-anchor="middle">${String(t%24).padStart(2,'0')}</text>`).join('')}
      ${ser(c=>c.stiff,'#F29A55')}${ser(c=>(c.hr-60)/50,'#EE6F82')}${ser(c=>c.stomach,'#DDB741')}${ser(c=>c.pain,'#F2705F',true)}${ser(c=>c.energy,'#7FD3A3',true)}
      <line id="dy-ph" x1="${px(h<6?h+24:h)}" x2="${px(h<6?h+24:h)}" y1="6" y2="${Hh-12}" stroke="var(--bone)"/></svg>`;}
  return {id:'day',title:'A day in the patient\'s body',fig:'Twenty-four hours, hour by hour',
    enter(panel){K.resetRig();cur=-1;h=6.4;playing=false;
      panel.innerHTML=`<p class="lede-s">An imagined but typical day, built from the patient's chart. Drag the clock or press play and watch the body through it.</p>
        <div class="dy-top"><div id="dy-dial"></div><div class="dy-meters">
          <div class="ro"><span>Heart rate (model)</span><b id="dy-hr"></b></div><div class="ro"><span>Hand stiffness</span><b id="dy-st"></b></div>
          <div class="ro"><span>Food still in the stomach</span><b id="dy-sm"></b></div><div class="ro"><span>Pain</span><b id="dy-pn"></b></div><div class="ro"><span>Energy</span><b id="dy-en"></b></div></div></div>
        <input id="dy-r" type="range" min="6" max="30" step=".05" value="${h}" aria-label="Time of day" style="width:100%;accent-color:var(--bone)">
        <div class="btns"><button class="btn primary" id="dy-play" type="button">Play the day</button></div>
        <p class="dy-now" id="dy-now"></p>
        <div id="dy-chart"></div>
        <p class="legend"><span><i class="sw" style="background:#F29A55"></i>Stiffness</span><span><i class="sw" style="background:#EE6F82"></i>Heart rate</span><span><i class="sw" style="background:#DDB741"></i>Stomach</span><span><i class="sw sw-n" style="border-color:#F2705F"></i>Pain</span><span><i class="sw sw-n" style="border-color:#7FD3A3"></i>Energy</span></p>
        <div class="dy-list">${EV.map((e,i)=>`<button class="dy-ev" data-i="${i}" style="--c:${e.col}"><span>${hhmm(e.t)}</span>${e.title}</button>`).join('')}</div>
        <p class="fine">A model, not a diary: the times, meals and medicine schedule are a plausible template, and the curves are illustrative shapes drawn from the patterns in the patient's diagnoses (RA morning stiffness, POTS on standing, a moderately slow stomach). Real days vary, and in real care medicine timing is set by the prescriber.</p>`;
      ui=panel;panel.querySelector('#dy-dial').innerHTML=dial();panel.querySelector('#dy-chart').innerHTML=chart();
      const r=panel.querySelector('#dy-r');r.oninput=()=>{h=+r.value;playing=false;panel.querySelector('#dy-play').textContent='Play the day';};
      panel.querySelector('#dy-play').onclick=e=>{playing=!playing;if(playing&&h>=29.9)h=6;e.target.textContent=playing?'Pause':'Play the day';};
      panel.querySelectorAll('.dy-ev').forEach(b=>b.onclick=()=>{h=EV[+b.dataset.i].t;r.value=h;playing=false;panel.querySelector('#dy-play').textContent='Play the day';});
      let lastDraw=0;
      tickOff=A.onTick(dt=>{
        if(playing){h+=dt*24/96;if(h>=30){h=30;playing=false;panel.querySelector('#dy-play').textContent='Play the day';}r.value=h;}
        const hh=h%24;const c=curves(hh);setEvent(eventAt(hh));curl(c.stiff);
        const now=performance.now();if(now-lastDraw>120){lastDraw=now;
          const R=86,a=(hh/24)*Math.PI*2-Math.PI/2;const hd=panel.querySelector('#dy-hand');if(hd){hd.setAttribute('x2',100+Math.cos(a)*(R-4));hd.setAttribute('y2',100+Math.sin(a)*(R-4));}
          panel.querySelector('#dy-clock').textContent=hhmm(hh);
          const ph=panel.querySelector('#dy-ph');if(ph){const x=10+((h<6?h+24:h)-6)/24*280;ph.setAttribute('x1',x);ph.setAttribute('x2',x);}
          const lvl=v=>v<.2?'low':v<.5?'some':v<.75?'high':'very high';
          panel.querySelector('#dy-hr').textContent=(c.hr<82?'resting':c.hr<100?'raised':'racing')+' · ~'+Math.round(c.hr/5)*5;panel.querySelector('#dy-st').textContent=lvl(c.stiff);panel.querySelector('#dy-sm').textContent=c.stomach<.15?'little':c.stomach<.45?'some':'a lot';
          panel.querySelector('#dy-pn').textContent=lvl(c.pain);panel.querySelector('#dy-en').textContent=c.energy>.6?'okay':c.energy>.4?'fading':'low';}
        // ice: cool blue glow on hands and knees at night
        const icy=(hh>=22.5&&hh<22.85); // 15–20 minutes, not all nightfor(const r of A.resolve(['#righthand','#lefthand','Right patella','Left patella'])){if(icy&&cur>=0&&EV[cur].k!=='flare'){r.tgt.em=Math.max(r.tgt.em,.35);r.hi.set('#71C6FF');}}
        A.skinUniforms.uAlpha.value=Math.min(A.skinUniforms.uAlpha.value,1);
      });
    },
    exit(){tickOff?.();curl(0);K.resetRig();ui=null;}
  };
}
