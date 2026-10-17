// Stage-two instruments, part 1: MCAS, iron, brain (seizure threshold after encephalitis).
import * as THREE from 'three';
import { damp } from './core.js';
import { slider, toggle, bindSlider, bindToggle, clamp, fmt, lerp, kit, lineChart } from './kit.js';

export function makeStations2(A){
  const {MESH,V3}=A;const K=kit(A);const all=[];

  /* ==================================================================== MCAS */
  const mcas=(()=>{
    // [key,label,sub,load,systems it leans on]
    const TR=[
      ['heat','Heat','hot shower, hot weather',22,{skin:1.3,cv:1.2}],
      ['exercise','Exercise','',20,{cv:1.4,skin:1}],
      ['scent','Fragrance or smoke','',18,{air:1.6}],
      ['food','One of the patient\'s trigger foods','trigger foods differ from person to person',20,{gut:1.6}],
      ['alcohol','Alcohol','',18,{skin:1.2,gut:1.1}],
      ['nsaid','Ibuprofen','an NSAID, a trigger for some people',18,{gut:1.1,skin:1.1,air:1}],
      ['stress','Stress or short sleep','',16,{brain:1.5}],
      ['friction','Pressure or friction on the skin','',14,{skin:1.5}],
    ];
    const SYSL=[['skin','Skin','flushing, itch, hives'],['gut','Gut','cramps, nausea, diarrhoea'],['air','Airways','throat tightness, wheeze'],['cv','Heart and circulation','fast pulse, lightheaded'],['brain','Brain','fog, fatigue: real, but not counted by the criteria']];
    const ORG={skin:['Skin'],gut:['Stomach','Duodenum','Jejunum','Ileum','colon, nsn','Rectum'],
      air:['Trachea','Upper lobe of right lung','Middle lobe of right lung','Lower lobe of right lung','Upper lobe of left lung','Lower lobe of left lung'],
      cv:['Ascending aorta','Arch of aorta','Descending aorta','Inferior vena cava','Superior vena cava']};
    let cells=null,cellPts=[],cellSys=[],med,MP=[],tickOff,ui;const on={};const tx={h1:false,h2:false,cro:false};const lab={base:5,draw:1.5};
    const cur={skin:0,gut:0,air:0,cv:0,brain:0,s:0};
    const KA=1.5,KD=Math.LN2/2; // tryptase: peak about 1.3 h after onset, half-life about 2 h
    let PKN=0;for(let t=0;t<6;t+=.01)PKN=Math.max(PKN,Math.exp(-KD*t)-Math.exp(-KA*t));
    const tryp=(t,rise)=>lab.base+(t<=0?0:rise*(Math.exp(-KD*t)-Math.exp(-KA*t))/PKN);
    function build(){
      for(const [k,n] of [['skin',240],['gut',150],['air',90],['cv',50]])for(const p of K.samplePts(ORG[k],n)){cellPts.push(p);cellSys.push(k);}
      cells=K.dots(cellPts.length,new THREE.SphereGeometry(.0032,8,6),A.tm(THREE.MeshBasicMaterial,{color:'#F29A55',transparent:true,opacity:.9,depthWrite:false}));
      med=K.dots(260,new THREE.SphereGeometry(.0015,6,4),A.tm(THREE.MeshBasicMaterial,{color:'#FFE0B8',transparent:true,opacity:.85,depthWrite:false}));
      for(let i=0;i<260;i++)MP.push({life:0,p:V3(),v:V3()});
    }
    function model(){
      let load=24;const w={skin:0,gut:0,air:0,cv:0,brain:0};
      for(const [k,,,L,sy] of TR)if(on[k]){load+=L;for(const s in sy)w[s]+=sy[s];}
      const thr=70+(tx.cro?8:0);
      const s=clamp((load-thr)/45,0,1);
      const sym={};for(const [k] of SYSL)sym[k]=s*(0.5+0.5*Math.min(1,w[k]/1.5));
      if(tx.h1){sym.skin*=.45;sym.air*=.95;sym.cv*=.95;sym.brain*=.9;} // H1 helps skin; not airway or circulation (WAO 2020)
      if(tx.h2){sym.gut*=.55;sym.skin*=.85;sym.cv*=.85;}
      if(tx.cro){sym.gut*=.6;}
      return {load,thr,s,sym};
    }
    function labHTML(s){
      const rise=s>0?1.5+9*s:0;const need=lab.base*1.2+2;const got=tryp(lab.draw,rise);
      const ymax=Math.max(lab.base+rise,need)*1.25+1;
      const {svg}=lineChart({W:300,H:150,x0:0,x1:8,y0:0,y1:ymax,xticks:[0,1,2,4,6,8],yticks:[0,Math.round(ymax/2),Math.round(ymax)],xfmt:v=>v+' h',label:'Serum tryptase after the flare starts',
        extra:(px,py)=>`<rect x="${px(1)}" y="${py(ymax)}" width="${px(2)-px(1)}" height="${py(0)-py(ymax)}" fill="var(--ok)" opacity=".10"/><rect x="${px(2)}" y="${py(ymax)}" width="${px(4)-px(2)}" height="${py(0)-py(ymax)}" fill="var(--ok)" opacity=".04"/>
          <line x1="${px(0)}" x2="${px(8)}" y1="${py(need)}" y2="${py(need)}" stroke="var(--alert)" stroke-dasharray="4 3"/><text x="${px(8)}" y="${py(need)-4}" text-anchor="end" fill="var(--alert)">needed ${fmt(need,1)}</text>
          <line x1="${px(0)}" x2="${px(8)}" y1="${py(lab.base)}" y2="${py(lab.base)}" stroke="var(--dim)" stroke-dasharray="2 3"/>`,
        series:[{pts:Array.from({length:161},(_,i)=>[i/20,tryp(i/20,rise)]),stroke:'var(--immune)',width:2.2}],
        after:(px,py)=>`<line x1="${px(lab.draw)}" x2="${px(lab.draw)}" y1="${py(ymax)}" y2="${py(0)}" stroke="var(--bone)"/><circle cx="${px(lab.draw)}" cy="${py(got)}" r="4" fill="var(--bone)"/>`});
      return {svg,need,got,rise};
    }
    return {
      id:'mcas',title:'Mast cell bench',fig:'Triggers, the bucket and the tryptase test',
      enter(panel){
        K.resetRig();if(!cells)build();cells.visible=med.visible=true;
        K.setMode({layers:{skin:.8,skeleton:.08,organs:.45,vessels:.6}});
        panel.innerHTML=`<div class="readouts">
            <div class="ro"><span>Trigger load</span><b id="m-load" class="sm">low</b><span class="note">the "bucket": triggers add up, and a flare starts when it overflows</span><span class="bar"><i id="m-loadBar"></i><em id="m-thr"></em></span></div>
            ${SYSL.map(([k,l,n])=>`<div class="ro"><span>${l}</span><b id="m-${k}">quiet</b><span class="note">${n}</span><span class="bar"><i id="m-${k}Bar"></i></span></div>`).join('')}
          </div>
          <p class="eyebrow">What's happening today</p>
          <div class="tgs two">${TR.map(([k,l,sub])=>toggle('m-t-'+k,l,false,sub)).join('')}</div>
          <p class="eyebrow">Treatment</p>
          <div class="tgs">${toggle('m-h1','H1 antihistamine',false,'cetirizine, loratadine, fexofenadine: itch, hives, flushing, runny nose. Not enough for throat or breathing trouble: that needs epinephrine.')}${toggle('m-h2','H2 blocker',false,'famotidine: stomach acid and gut symptoms')}${toggle('m-cro','Oral cromolyn',false,'steadies mast cells in the gut lining; barely absorbed; shown as it works after 2–3 weeks')}</div>
          <p class="eyebrow">The lab test that confirms a flare</p>
          <div class="readouts">
            <div class="ro"><span>Tryptase needed to count</span><b id="m-need"></b><span class="note">baseline × 1.2 + 2 ng/mL (the 20% + 2 rule)</span></div>
            <div class="ro"><span>Tryptase in this sample</span><b id="m-got"></b></div>
            <div class="ro"><span>Result</span><b id="m-verdict" class="sm"></b></div>
          </div>
          <div id="m-chart"></div>
          <p class="legend"><span><i class="sw" style="background:var(--immune)"></i>Tryptase</span> <span><i class="sw" style="background:var(--ok);height:8px;opacity:.5"></i>Ideal draw 1–2 h; no later than 4 h</span></p>
          ${slider('m-draw','Blood drawn, hours after the flare starts',0,8,.25,1.5,' h')}
          ${slider('m-base','Baseline tryptase (example; not on the patient\'s chart)',2,15,.5,5,' ng/mL')}
          <p class="fine" id="m-hat" hidden style="margin-top:0!important">A baseline of 8 ng/mL or more is worth asking about: about 4–6% of people inherit extra copies of a tryptase gene (hereditary alpha-tryptasemia), found in a 2016 study alongside flushing, dysautonomia and hypermobility.</p>
          <div class="warn" id="m-em"><b>Emergency signs</b><span id="m-emx" hidden><strong>This pattern needs epinephrine, not more antihistamine.</strong> </span>Throat tightness, trouble breathing or swallowing, fainting or feeling faint, or hives together with vomiting or severe cramps: <strong>give epinephrine first, then call 911.</strong> Lay the patient flat with legs raised (sitting up if breathing is hard); don't let her stand or walk, which matters even more with POTS. Give a second dose after 5–15 minutes if there's no clear improvement. The patient's propranolol can blunt epinephrine, <strong>which is a reason to give it promptly, not to skip it</strong>; the team has a backup (glucagon) and needs to know she takes it. Symptoms can come back hours later, so she should still be checked.</div>
          <p class="fine">The orange dots are mast cells, sampled on the real skin, gut, airways and great vessels where they concentrate. The triggers, the bucket and the treatment effects are a teaching picture with illustrative sizes; the patient's own triggers and doses aren't on the chart. The tryptase rule is the consensus one (Valent 2012) and is one of three criteria, alongside multi-system symptoms and response to treatment. Tryptase peaks about 1–2 hours after a reaction and has a half-life of about 2 hours, so UK guidance (NICE) advises drawing it within 1–2 hours of onset and no later than 4. A baseline is drawn when the patient is well, at least a day or two after symptoms have fully settled (Valent 2019). Many flares raise it only modestly, which is why timing decides the result.</p>`;
        ui=panel;
        for(const [k] of TR)bindToggle(panel,'m-t-'+k,v=>on[k]=v);
        bindToggle(panel,'m-h1',v=>tx.h1=v);bindToggle(panel,'m-h2',v=>tx.h2=v);bindToggle(panel,'m-cro',v=>tx.cro=v);
        let lastKey='';
        const drawLab=(s)=>{const L=labHTML(s);panel.querySelector('#m-chart').innerHTML=L.svg;panel.querySelector('#m-need').textContent=fmt(L.need,1)+' ng/mL';panel.querySelector('#m-got').textContent=fmt(L.got,1)+' ng/mL';
          const late=lab.draw>4,early=lab.draw<.75&&L.rise>0;
          panel.querySelector('#m-verdict').textContent=L.rise===0?'No flare, no rise':L.got>=L.need?'Meets the tryptase rule (one of three criteria)':late?'Missed: drawn too late':early?'Early sample: may not have peaked yet; guidance asks for another at 1–2 h':'Rise too small to count';};
        bindSlider(panel,'m-draw',x=>{lab.draw=x;lastKey='';},x=>x+' h');bindSlider(panel,'m-base',x=>{lab.base=x;lastKey='';panel.querySelector('#m-hat').hidden=x<8;},x=>x+' ng/mL');
        A.flyTo({target:[0,1.02,0],dist:3.1,azim:22,elev:4});
        const organs={};for(const k in ORG)organs[k]=K.recs(ORG[k]).filter(r=>r.group!=='skin');
        const fillF=new THREE.Color('#D0505E'),rimF=new THREE.Color('#FF8E8A');
        let t=0;
        tickOff=A.onTick(dt=>{
          t+=dt;const M=model();
          cur.s=damp(cur.s,M.s,2.5,dt);for(const [k] of SYSL)cur[k]=damp(cur[k],M.sym[k],2.5,dt);
          // bucket and systems
          ui.querySelector('#m-load').textContent=M.load>M.thr?'overflowing':M.load>M.thr*.75?'near the line':'low';const em=M.sym.air>=.7||M.sym.cv>=.7;ui.querySelector('#m-em').classList.toggle('hot',em);ui.querySelector('#m-emx').hidden=!em;const lb=ui.querySelector('#m-loadBar');lb.style.width=clamp(M.load/170*100,0,100)+'%';lb.classList.toggle('over',M.load>M.thr);
          ui.querySelector('#m-thr').style.left=M.thr/170*100+'%';
          for(const [k] of SYSL){const x=M.sym[k];ui.querySelector('#m-'+k).textContent=x<.05?'quiet':x<.35?'mild':x<.7?'moderate':'strong';const b=ui.querySelector('#m-'+k+'Bar');b.style.width=x*100+'%';b.classList.toggle('over',x>=.7);}
          const key=M.s.toFixed(3);if(key!==lastKey){lastKey=key;drawLab(M.s);}
          // skin flush
          A.skinUniforms.uFill.value.copy(A.skinBase.fill).lerp(fillF,cur.skin*.9);A.skinUniforms.uBody.value=A.light?.5+cur.skin*1.4:1;A.skinUniforms.uRim.value.copy(A.skinBase.rim).lerp(A.light?fillF:rimF,cur.skin*.8);
          for(const k in organs)for(const r of organs[k]){r.tgt.em=.06+cur[k]*.9;r.hi.set('#F29A55');}
          // mast cells pulse; flaring ones release mediators
          for(let i=0;i<cellPts.length;i++){const a=cur[cellSys[i]];K.put(cells,i,cellPts[i],1+a*(.6+.6*Math.sin(t*7+i*1.7)));}
          cells.instanceMatrix.needsUpdate=true;
          let spawn=cur.s*180*dt;
          for(const m of MP){
            if(m.life<=0&&spawn>0&&Math.random()<spawn){spawn--;const i=Math.floor(Math.random()*cellPts.length);if(Math.random()<cur[cellSys[i]]+.05){m.p.copy(cellPts[i]);m.v.set(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize().multiplyScalar(.02+Math.random()*.02);m.life=1.2;}}
            if(m.life>0){m.life-=dt;m.p.addScaledVector(m.v,dt);}
          }
          MP.forEach((m,i)=>K.put(med,i,m.p,m.life>0?m.life/1.2:0));med.instanceMatrix.needsUpdate=true;
        });
      },
      exit(){tickOff?.();cells.visible=med.visible=false;A.skinUniforms.uFill.value.copy(A.skinBase.fill);A.skinUniforms.uRim.value.copy(A.skinBase.rim);A.skinUniforms.uBody.value=A.light?.5:1;}
    };
  })();all.push(mcas);

  /* ==================================================================== IRON */
  const iron=(()=>{
    let rbc=null,loops=[],RB=[],tickOff,ui,series=null,month=0,playing=false;const v={f0:25,mbl:60,sup:'none'};
    const liverRecs=()=>K.recs(['Liver','Spleen']);
    function simulate(){
      // Calibrated so 100 mg daily for 90 days from ferritin ~18 gives ~45 ng/mL at day 180 (von Siebenthal 2023 median 43.8)
      let ferr=v.f0,Hb=13-clamp((12-v.f0)/7,0,1)*.6;const pts=[];let prev=false,abs=0,nd=0;
      for(let d=0;d<=365;d++){
        if(d%3===0)pts.push([d/30.44,ferr,Hb]);
        let stores=ferr*8;                         // about 8 mg of storage iron per ng/mL of ferritin
        const perMl=Hb*0.0347;                     // mg iron per mL of blood
        const loss=1.0+(d%28<5?v.mbl/5*perMl:0);    // basal losses plus the period
        let gain=0.9+1.1*(1-clamp(ferr/50,0,1));   // food iron, 0.9–2 mg/day; absorption rises as stores fall
        const dose=v.sup==='daily'||(v.sup==='alt'&&d%2===0);
        if(dose){let f=0.22*clamp(Math.pow(20/Math.max(ferr,5),2),0.01,1.3);if(prev)f*=0.75;gain+=60*f;if(d<14){abs+=60*f;nd++;}} // fractional absorption falls as stores fill; next-day dose ×0.75 (Stoffel 2017, Moretti 2015)
        prev=dose;stores+=gain-loss;
        if(Hb<13&&stores>40){const use=Math.min(0.05*156,stores-40);Hb+=use/156;stores-=use;}   // ~156 mg iron per g/dL of haemoglobin
        if(stores<40){Hb-=(40-stores)/156;stores=40;}
        ferr=stores/8;
      }
      return {pts,perDose:nd?abs/nd:0};
    }
    const at=m=>{const P=series.pts;const i=clamp(Math.floor(m/12*(P.length-1)),0,P.length-2);const f=m/12*(P.length-1)-i;return [lerp(P[i][1],P[i+1][1],f),lerp(P[i][2],P[i+1][2],f)];};
    function stage(ferr,Hb){
      if(Hb<12)return ['Iron-deficiency anaemia','over'];
      if(ferr<15)return ['Stores empty; red-cell production likely short of iron','warn'];
      if(ferr<30)return ['Iron deficient: stores low','warn'];
      return ['Stores adequate','ok'];
    }
    function build(){
      const h=K.centre('Wall of heart');
      const legLoop=s=>[h,V3(.012,1.33,0),V3(.016,1.2,-.035),V3(.012,1.0,-.012),V3(s*.006,.95,.02),V3(s*.045,.88,.02),V3(s*.075,.62,.03),V3(s*.085,.42,-.015),V3(s*.07,.14,-.03),V3(s*.062,.14,-.05),V3(s*.08,.42,-.04),V3(s*.07,.66,.0),V3(s*.035,.9,.0),V3(-.012,1.0,.02),V3(-.01,1.18,.022)];
      const headLoop=[h,V3(.012,1.33,0),V3(.02,1.42,.012),V3(.022,1.5,.0),V3(.02,1.58,.0),V3(-.02,1.58,.0),V3(-.025,1.48,.0),V3(-.03,1.4,.012),V3(-.015,1.29,.02)];
      const armLoop=s=>[h,V3(.012,1.33,0),V3(s*.06,1.38,.0),V3(s*.16,1.36,-.01),V3(s*.2,1.12,-.02),V3(s*.23,.9,.02),V3(s*.22,.88,.0),V3(s*.19,1.12,-.04),V3(s*.15,1.35,-.03),V3(s*.05,1.36,.01),V3(-.015,1.29,.02)];
      loops=[legLoop(-1),legLoop(1),headLoop,armLoop(-1),armLoop(1)].map(p=>new THREE.CatmullRomCurve3(p,true));
      const g=new THREE.CylinderGeometry(.0042,.0042,.0014,14);
      rbc=K.dots(320,g,new THREE.MeshStandardMaterial({color:'#C42F3F',roughness:.4,emissive:'#5A0E16',emissiveIntensity:.4}),A.root,8);
      for(let i=0;i<320;i++)RB.push({c:i%5===2?2:i%5>2?3+(i%2):i%2,u:Math.random(),sp:.8+Math.random()*.4,q:new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.random()*6,Math.random()*6,0))});
    }
    function chart(){
      const P=series.pts;
      return lineChart({W:300,H:160,x0:0,x1:12,y0:0,y1:100,xticks:[0,3,6,9,12],yticks:[0,15,30,60,100],xfmt:v=>v+' mo',label:'Ferritin and haemoglobin over twelve months',
        extra:(px,py)=>`<rect x="${px(0)}" y="${py(15)}" width="${px(12)-px(0)}" height="${py(0)-py(15)}" fill="var(--alert)" opacity=".07"/>`,
        series:[{pts:P.map(p=>[p[0],Math.min(p[1],100)]),stroke:'#D9A441',width:2.2},{pts:P.map(p=>[p[0],(p[2]-8)/6*100]),stroke:'#E0566A',width:1.8,dash:'5 3'}],
        after:(px,py)=>`<text x="${px(12)}" y="${py(100)+10}" text-anchor="end" fill="#E0566A">Hb 14</text><text x="${px(12)}" y="${py(66.7)-3}" text-anchor="end" fill="#E0566A">Hb 12</text><line x1="${px(0)}" x2="${px(12)}" y1="${py(66.7)}" y2="${py(66.7)}" stroke="#E0566A" opacity=".35"/><line id="i-ph" x1="${px(month)}" x2="${px(month)}" y1="${py(100)}" y2="${py(0)}" stroke="var(--bone)"/>`}).svg;
    }
    return {
      id:'iron',title:'Iron ledger',fig:'Stores, red cells and the heart',
      enter(panel){
        K.resetRig();if(!rbc)build();rbc.visible=true;month=0;playing=false;
        K.setMode({layers:{skin:.25,skeleton:.08,organs:.25,vessels:.9},focus:new Set(liverRecs()),focusColor:'#D9A441',dim:.6});
        panel.innerHTML=`<div class="readouts">
            <div class="ro"><span>Ferritin in this example</span><b id="i-f"></b><span class="note">under 15: stores empty (WHO); under 30: a common clinical cut-off. With inflammation such as active RA, ferritin reads falsely high: WHO uses under 70</span><span class="bar"><i id="i-fBar"></i><em style="left:15%"></em><em style="left:30%"></em></span></div>
            <div class="ro"><span>Haemoglobin</span><b id="i-hb"></b><span class="note">anaemia below 12 g/dL in women (WHO)</span></div>
            <div class="ro"><span>Stage in this example</span><b id="i-st" class="sm"></b></div>
            <div class="ro"><span>Extra work for the heart at rest</span><b id="i-hr" class="sm"></b><span class="note">only once haemoglobin falls into anaemia; simplified</span></div>
          </div>
          <div id="i-chart"></div>
          <p class="legend"><span><i class="sw" style="background:#D9A441"></i>Ferritin, ng/mL</span><span><i class="sw sw-n" style="border-color:#E0566A"></i>Haemoglobin</span></p>
          ${slider('i-m','Months from now',0,12,.1,0,'')}
          <div class="btns"><button class="btn primary" id="i-play" type="button">Play a year</button></div>
          ${slider('i-f0','Ferritin at the start (example)',5,80,1,25,' ng/mL')}
          ${slider('i-mbl','Blood lost per period',20,150,5,60,' mL')}
          <p class="fine" style="margin-top:0!important">About 30–40 mL is typical; 80 mL or more is the research definition of heavy. In practice doctors go by impact: flooding, changing protection every hour or two, clots, or bleeding that disrupts daily life (NICE).</p>
          <div class="seg" role="radiogroup" aria-label="Iron supplement">${[['none','No supplement'],['daily','60 mg daily'],['alt','60 mg every other day']].map(([k,l])=>`<button role="radio" data-s="${k}" aria-checked="${k===v.sup}">${l}</button>`).join('')}</div>
          <div class="ro" id="i-dose" hidden><span>Absorbed per 60 mg tablet, first two weeks</span><b id="i-pd"></b><span class="note">a dose raises hepcidin for about a day, so the next day's tablet is absorbed less well; absorption falls further as stores fill</span></div>
          <p class="fine" style="margin-top:0!important">60 mg of elemental iron (a 325 mg ferrous sulfate tablet has about 65 mg). The dose and schedule are for the patient's doctor to choose.</p>
          <div class="warn"><b>For any provider</b>Iron and levothyroxine at least four hours apart.</div>
          <p class="fine">The golden glow in the liver and spleen is stored iron; red cells shrink and pale as iron runs out, the small, pale (microcytic, hypochromic) cells of iron-deficiency anaemia. The ledger is an illustrative model built on real constants: about 8 mg of stored iron per ng/mL of ferritin, about 156 mg of iron per g/dL of haemoglobin, about 1 mg lost daily plus each period. In 40 iron-depleted women, fractional absorption from 60 mg was 16.3% on consecutive days and 21.8% on alternate days (Stoffel 2017): more <em>per tablet</em> on alternate days, though daily dosing still delivers more iron per week. In a 2023 trial at the same total dose, both schedules gave the same ferritin at six months, with fewer stomach side effects on alternate days (von Siebenthal 2023); the model's rise is calibrated to that trial. Ferritin is only a guide to stores when there's no inflammation. The patient's own labs and period history aren't on the chart.</p>`;
        ui=panel;
        const run=()=>{series=simulate();panel.querySelector('#i-chart').innerHTML=chart();const pd=panel.querySelector('#i-dose');pd.hidden=v.sup==='none';panel.querySelector('#i-pd').textContent=fmt(series.perDose,1)+' mg';};
        const ms=bindSlider(panel,'i-m',x=>{month=x;playing=false;},x=>fmt(x,1)+' mo');
        bindSlider(panel,'i-f0',x=>{v.f0=x;run();},x=>x+' ng/mL');bindSlider(panel,'i-mbl',x=>{v.mbl=x;run();},x=>x+' mL');
        panel.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{v.sup=b.dataset.s;panel.querySelectorAll('[data-s]').forEach(x=>x.setAttribute('aria-checked',x===b));run();});
        panel.querySelector('#i-play').onclick=()=>{if(month>11.9)month=0;playing=true;};
        run();
        A.flyTo({target:[0,1.0,0],dist:3.0,azim:-20,elev:4});
        const c0=new THREE.Color('#C42F3F'),cP=new THREE.Color('#E7A3A3');
        tickOff=A.onTick(dt=>{
          if(playing){month=Math.min(12,month+dt*12/18);ms.value=month;panel.querySelector('#i-m-v').textContent=fmt(month,1)+' mo';if(month>=12)playing=false;}
          const [ferr,Hb]=at(month);const k=clamp((13-Hb)/3.5,0,1),kf=clamp((15-ferr)/10,0,1);
          rbc.material.color.copy(c0).lerp(cP,Math.max(k,kf*.35));
          const n=Math.round(320*clamp(Hb/13.5,.4,1));const sc=1-.28*Math.max(k,kf*.4);
          for(let i=0;i<RB.length;i++){const R=RB[i];R.u=(R.u+dt*.06*R.sp)%1;const p=loops[R.c].getPointAt(R.u);K.put(rbc,i,p,i<n?sc:0,R.q);}
          rbc.instanceMatrix.needsUpdate=true;
          for(const r of liverRecs()){r.tgt.em=.04+clamp(ferr/80,0,1)*.75;r.hi.set('#D9A441');}
          const [st,cls]=stage(ferr,Hb);
          ui.querySelector('#i-f').textContent=fmt(ferr,0)+' ng/mL';const fb=ui.querySelector('#i-fBar');fb.style.width=clamp(ferr,0,100)+'%';fb.classList.toggle('over',ferr<15);
          ui.querySelector('#i-hb').textContent=fmt(Hb,1)+' g/dL';ui.querySelector('#i-st').textContent=st;
          ui.querySelector('#i-hr').textContent=Hb>=12?'none':'about +'+fmt(Math.max(0,(12/Hb-1))*60,0)+'%';
          const ph=ui.querySelector('#i-ph');if(ph){const x=30+month/12*(300-40);ph.setAttribute('x1',x);ph.setAttribute('x2',x);}
        });
      },
      exit(){tickOff?.();if(rbc)rbc.visible=false;}
    };
  })();all.push(iron);

  /* ==================================================================== BRAIN: encephalitis and the seizure threshold */
  const brain=(()=>{
    const REG={
      memory:{label:'Memory',parts:['Right hippocampus proper','Left hippocampus proper','Right parahippocampal gyrus','Left parahippocampal gyrus'],
        text:'The hippocampi turn experience into lasting memory. They sit deep in the temporal lobes, the region herpes simplex encephalitis most often strikes and the main target of autoimmune limbic encephalitis. Trouble holding on to new information is one of the most common lasting effects.'},
      language:{label:'Word finding',parts:['Posterior part of left superior temporal gyrus','Left middle temporal gyrus','Left inferior temporal gyrus','Left angular gyrus','Left supramarginal gyrus'],
        text:'In most people language lives in the left hemisphere (about 95% of right-handers). The left temporal and parietal areas lit here link words to meaning; speaking itself also relies on a frontal area (Broca\'s) that this model doesn\'t include. Tip-of-the-tongue pauses after encephalitis often trace back to the temporal part of this network.'},
      attention:{label:'Attention and planning',parts:['Right superior frontal gyrus','Left superior frontal gyrus','Right middle frontal gyrus','Left middle frontal gyrus','Right cingulate gyrus','Left cingulate gyrus'],
        text:'The frontal lobes and the cingulate run attention, planning and switching between tasks. These often feel slower after brain inflammation, and much slower when tired.'},
      feeling:{label:'Mood and body sense',parts:['Right insula','Left insula','Right cingulate gyrus','Left cingulate gyrus','Right hippocampus proper','Left hippocampus proper'],
        text:'The insula and cingulate, which herpes encephalitis often reaches along with the temporal lobes, tie emotion to body signals such as heartbeat and gut sensation. The amygdala, just in front of the hippocampus and not in this model, links emotion to memory. Mood and anxiety changes are common after encephalitis. They are part of the illness, not a weakness.'},
    };
    const MEDQ=[
      ['Hydroxychloroquine','Label: “can lower the seizure threshold.”'],
      ['Adderall XR','Label: stimulants “may lower the convulsive threshold in patients with prior history of seizures”, and “in the presence of seizures, ADDERALL XR should be discontinued.”'],
      ['Lexapro','Label: “should be introduced with care in patients with a history of seizure disorder.”'],
    ];
    let sparks=null,SP=[],tickOff,ui,region='memory';const v={sleep:7,ill:false,stress:false,alc:false,meal:false};
    // Drives the picture only. No number is shown: nobody's seizure threshold can be measured.
    function load(){let L=30;if(v.sleep<7)L+=(7-v.sleep)*8;if(v.ill)L+=18;if(v.stress)L+=8;if(v.alc)L+=14;if(v.meal)L+=6;return L;}
    function strains(){const s=[];if(v.sleep<6.5)s.push('short sleep');if(v.ill)s.push('fever or illness');if(v.alc)s.push('alcohol');if(v.stress)s.push('stress');if(v.meal)s.push('missed meals');return s;}
    function build(){
      const gyri=A.recs.filter(r=>r.group==='brain'&&/gyrus|lobe|insula/i.test(r.name)).map(r=>r.name);
      for(const p of K.samplePts(gyri,320))SP.push({p,ph:Math.random()*10,f:2+Math.random()*5});
      sparks=K.dots(SP.length,new THREE.SphereGeometry(.0018,6,4),A.tm(THREE.MeshBasicMaterial,{color:'#B9CCFF',transparent:true,opacity:.95,depthWrite:false}),A.N.head,12);
      sparks.position.copy(A.N.head.userData.pivot).negate();
    }
    const setRegion=()=>{K.setMode({layers:{skin:.08,skeleton:.06,organs:.5,vessels:.05},focus:A.resolve(REG[region].parts),focusColor:'#78A0F4',dim:.35});
      for(const r of A.tagged('brain'))if(!A.mode.focus.has(r))r.tgt.op=.35;};
    return {
      id:'brain',title:'Seizure threshold',fig:'The brain after encephalitis',
      enter(panel){
        K.resetRig();if(!sparks)build();sparks.visible=true;setRegion();
        panel.innerHTML=`<div class="readouts">
            <div class="ro"><span>Things pushing the threshold down today</span><b id="b-l" class="sm"></b><span class="bar band"><i id="b-lBar"></i></span><span class="note">the shaded end is where risk rises (a picture only)</span></div>
            <div class="ro"><span>Strains stacking up</span><b id="b-m" class="sm"></b></div>
          </div>
          <p class="fine" style="margin-top:2px!important">Nobody's seizure threshold can be measured, including the patient's. Stacking strains doesn't mean a seizure will happen, and avoiding them doesn't guarantee one won't. The point is which everyday things are worth protecting: sleep above all.</p>
          ${slider('b-sleep','Sleep last night',3,9,.5,7,' h')}
          <div class="tgs two">${toggle('b-ill','Fever or illness')}${toggle('b-stress','High stress')}${toggle('b-alc','Heavy drinking or withdrawal')}${toggle('b-meal','Skipped meals (low blood sugar)')}</div>
          <p class="eyebrow">The patient's medicines: label cautions</p>
          <ul class="quotes">${MEDQ.map(([n,q])=>`<li><b>${n}</b> ${q}</li>`).join('')}</ul>
          <p class="fine" style="margin-top:4px!important">None of this means the patient shouldn't take them. It means the seizure history belongs in every prescribing decision. Bupropion is not used with a seizure disorder, and tramadol is a double concern with her Lexapro: it raises seizure risk and, with an SSRI, the risk of serotonin syndrome.</p>
          <div class="warn"><b>If the patient has a seizure</b>Stay with her and time it. Move hard things away, cushion the head, and once the jerking stops roll her onto her side. Nothing in the mouth; don't hold her down. <strong>Call 911</strong> if it lasts more than 5 minutes, another starts before she comes round, she's hurt, has trouble breathing, doesn't wake up afterwards, or it happens in water. A faint can include a few seconds of jerking too: note what came before and how fast she came round, and tell her doctors.</div>
          <p class="eyebrow">What can linger: choose a network</p>
          <div class="seg" role="radiogroup" aria-label="Brain network">${Object.entries(REG).map(([k,r])=>`<button role="radio" data-r="${k}" aria-checked="${k===region}">${r.label}</button>`).join('')}</div>
          <p class="regtext" id="b-rt"></p>
          <p class="fine">Every brain structure here is real anatomy. The blue sparks are a picture of excitability, not a recording. The direction of each factor is well established: sleep loss, fever and illness, alcohol and its withdrawal all lower the threshold; significant low blood sugar does too, though a missed meal rarely gets that low. For scale: in a long-term population study, people who had seizures during encephalitis had about a 1 in 10 chance of a later unprovoked seizure within five years and about 1 in 5 over twenty (Annegers 1988); many never have another. The chart doesn't say which type of encephalitis the patient had, so the networks shown are the ones most often affected.</p>`;
        ui=panel;
        bindSlider(panel,'b-sleep',x=>v.sleep=x,x=>x+' h');for(const k of ['ill','stress','alc','meal'])bindToggle(panel,'b-'+k,on=>v[k]=on);
        const rt=()=>{panel.querySelector('#b-rt').textContent=REG[region].text;};rt();
        panel.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{region=b.dataset.r;panel.querySelectorAll('[data-r]').forEach(x=>x.setAttribute('aria-checked',x===b));setRegion();rt();});
        const c=K.centre('Corpus callosum');A.flyTo({target:[c.x,c.y-0.015,c.z],dist:.62,azim:-38,elev:10});
        let t=0,Ls=30;
        tickOff=A.onTick(dt=>{
          t+=dt;const L=load();Ls=damp(Ls,L,3,dt);
          const S=strains();ui.querySelector('#b-l').textContent=S.length?S.join(', '):'nothing extra';const lb=ui.querySelector('#b-lBar');lb.style.width=clamp((L-20)/90*100,4,100)+'%';
          ui.querySelector('#b-m').textContent=S.length===0?'none':S.length===1?'one':S.length===2?'two: worth easing what can be eased':S.length+': protect sleep, treat fever, skip the drink';
          const act=clamp((Ls-20)/70,0,1);const n=Math.round(SP.length*(.15+.85*act));
          for(let i=0;i<SP.length;i++){const S=SP[i];const fl=Math.max(0,Math.sin(t*S.f*(1+act*2)+S.ph));K.put(sparks,i,S.p,i<n?Math.pow(fl,6)*(1.1+act):0);}
          sparks.instanceMatrix.needsUpdate=true;
        });
      },
      exit(){tickOff?.();if(sparks)sparks.visible=false;}
    };
  })();all.push(brain);

  return Object.fromEntries(all.map(s=>[s.id,s]));
}
