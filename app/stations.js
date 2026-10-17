// Glass Atlas instruments. Each station: enter(panel) -> builds controls, drives the rig; exit() restores.
import * as THREE from 'three';
import { damp } from './core.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const D2R=Math.PI/180;
const fmt=(x,d=0)=>Number(x).toFixed(d);

/* ------------------------------------------------------------------ UI helpers */
function el(html){const t=document.createElement('template');t.innerHTML=html.trim();return t.content.firstElementChild;}
function slider(id,label,min,max,step,val,unit=''){return `<label class="ctl" for="${id}"><span class="ctl-l">${label}</span><span class="ctl-v" id="${id}-v">${val}${unit}</span><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"></label>`;}
function toggle(id,label,on=false,sub=''){return `<button type="button" class="tg" id="${id}" aria-pressed="${on}"><span class="tg-box"></span><span class="tg-t">${label}${sub?`<small>${sub}</small>`:''}</span></button>`;}
function bindSlider(root,id,fn,fmtv=v=>v){const i=root.querySelector('#'+id),o=root.querySelector('#'+id+'-v');const h=()=>{const v=+i.value;o.textContent=fmtv(v);fn(v);};i.addEventListener('input',h);h();return i;}
function bindToggle(root,id,fn){const b=root.querySelector('#'+id);b.addEventListener('click',()=>{const on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on);fn(on);});fn(b.getAttribute('aria-pressed')==='true');return b;}

export function makeStations(A){
  const {N,MESH,V3}=A;
  const all=[];
  const resetRig=()=>{A.root.traverse(o=>{if(o.isObject3D&&!o.isMesh&&o!==A.root)o.quaternion.identity();});};
  const toWorld=(node,p)=>node.localToWorld(p.clone().sub(node.userData.pivot));
  // camera from a view vector
  const viewAlong=(target,dir,dist,instant)=>{dir=dir.clone().normalize();const az=Math.atan2(dir.x,dir.z)/D2R,el=Math.asin(clamp(dir.y,-1,1))/D2R;A.flyTo({target:[target.x,target.y,target.z],dist,azim:az,elev:el},{instant});};

  /* ---------- goniometer: a protractor at a joint, fixed to the proximal bone ---------- */
  function goniometer(parent,pivot,u,m,{max,normal,thr,r=0.03}){
    const g=new THREE.Group();parent.add(g);g.position.copy(pivot).sub(parent.userData.pivot);
    u=u.clone().normalize();m=m.clone().normalize();const v=m.clone().cross(u).normalize();
    g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(u,v,m));
    const mk=(a0,a1,col,op,w=r*0.16)=>{const me=new THREE.Mesh(new THREE.RingGeometry(r,r+w,48,1,a0*D2R,(a1-a0)*D2R),A.tm(THREE.MeshBasicMaterial,{color:col,transparent:true,opacity:op,side:THREE.DoubleSide,depthTest:false}));me.renderOrder=40;g.add(me);return me;};
    mk(0,normal,'#7FD3A3',.55);mk(normal,thr,'#D8D2C2',.3);mk(thr,max,'#F2A65A',.75);
    for(let a=0;a<=max;a+=10){const len=a%30===0?r*.35:r*.2;const ln=new THREE.Line(new THREE.BufferGeometry().setFromPoints([V3(Math.cos(a*D2R)*(r+r*.16),Math.sin(a*D2R)*(r+r*.16),0),V3(Math.cos(a*D2R)*(r+r*.16+len),Math.sin(a*D2R)*(r+r*.16+len),0)]),A.tm(THREE.LineBasicMaterial,{color:'#ECE6DA',transparent:true,opacity:.8,depthTest:false}));ln.renderOrder=41;g.add(ln);}
    const fixedArm=new THREE.Mesh(new THREE.BoxGeometry(r*1.9,r*.07,r*.02).translate(r*.95,0,0),A.tm(THREE.MeshBasicMaterial,{color:'#ECE6DA',depthTest:false,transparent:true}));fixedArm.renderOrder=42;g.add(fixedArm);
    const needle=new THREE.Group();g.add(needle);const nm=new THREE.Mesh(new THREE.BoxGeometry(r*2.1,r*.09,r*.02).translate(r*1.05,0,0),A.tm(THREE.MeshBasicMaterial,{color:'#FFFFFF',depthTest:false,transparent:true}));nm.renderOrder=43;needle.add(nm);
    const hub=new THREE.Mesh(new THREE.CircleGeometry(r*.12,20),A.tm(THREE.MeshBasicMaterial,{color:'#FFFFFF',depthTest:false,transparent:true}));hub.renderOrder=44;g.add(hub);
    return {group:g,set:a=>{needle.rotation.z=a*D2R;},dispose:()=>{parent.remove(g);g.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}};
  }

  /* ==================================================================== TILT TABLE (POTS) */
  const tilt=(()=>{
    let built=false,tableVis,pedestal,needleG,theta=90,thetaT=90,tmin=0,running=false,prevTheta=90,ecg,ctx,ecgX=0,beatPhase=0,lastY=0;
    const st={comp:false,fluid:false,prop:false,iron:false};
    const ZB=-0.17,PIVOT_Y=0.9,TABLE_H=0.86; // board just behind the back; pivot at hip height
    let heartScaled=false,heart,heartC;
    let particles,PT=[];
    function build(){
      built=true;
      tableVis=new THREE.Group();A.tableGroup.add(tableVis);tableVis.position.set(0,-PIVOT_Y,-(ZB-0.075));
      const mat=A.tm(THREE.MeshStandardMaterial,{color:'#3B4B4F',roughness:.6,metalness:.2});
      const pad=A.tm(THREE.MeshStandardMaterial,{color:'#24363A',roughness:.9});
      const board=new THREE.Mesh(new THREE.BoxGeometry(.56,1.92,.035),pad);board.position.set(0,0.9,-0.163);tableVis.add(board);
      const frame=new THREE.Mesh(new THREE.BoxGeometry(.6,1.96,.02),mat);frame.position.set(0,0.9,-0.19);tableVis.add(frame);
      const foot=new THREE.Mesh(new THREE.BoxGeometry(.5,.025,.26),mat);foot.position.set(0,-0.012,-0.04);tableVis.add(foot);
      const hinge=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.66,24).rotateZ(Math.PI/2),mat);hinge.position.set(0,PIVOT_Y,ZB-0.075);tableVis.add(hinge);
      // pedestal and protractor stay fixed in the room
      pedestal=new THREE.Group();A.scene.add(pedestal);
      const col=new THREE.Mesh(new THREE.BoxGeometry(.16,TABLE_H,.16),mat);col.position.set(0,TABLE_H/2,ZB-0.075);pedestal.add(col);
      const base=new THREE.Mesh(new THREE.BoxGeometry(.7,.05,.5),mat);base.position.set(0,.025,-0.075+ZB);pedestal.add(base);
      const arcG=new THREE.Group();arcG.position.set(0.34,TABLE_H,ZB-0.075);arcG.rotation.y=Math.PI/2;pedestal.add(arcG);
      arcG.add(new THREE.Mesh(new THREE.RingGeometry(.2,.205,64,1,0,Math.PI/2),A.tm(THREE.MeshBasicMaterial,{color:'#7E8E90',side:THREE.DoubleSide})));
      for(let a=0;a<=90;a+=10){const L=a%30===0?.03:.015;arcG.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([V3(Math.cos(a*D2R)*.205,Math.sin(a*D2R)*.205,0),V3(Math.cos(a*D2R)*(.205+L),Math.sin(a*D2R)*(.205+L),0)]),A.tm(THREE.LineBasicMaterial,{color:a===70?'#F2A65A':'#B9B6AD'})));}
      needleG=new THREE.Group();arcG.add(needleG);needleG.add(new THREE.Mesh(new THREE.BoxGeometry(.23,.006,.004).translate(.115,0,0),A.tm(THREE.MeshBasicMaterial,{color:'#ECE6DA'})));
      // blood in the leg veins: particles that settle downward as the table rises
      const n=240;particles=new THREE.InstancedMesh(new THREE.SphereGeometry(.0042,8,6),new THREE.MeshBasicMaterial({color:'#6F8BE0'}),n);particles.renderOrder=6;A.root.add(particles);
      for(let i=0;i<n;i++)PT.push({c:i%4,u:Math.random(),sp:.7+Math.random()*.6});
      heart=MESH['Wall of heart'];
    }
    const setVisible=v=>{tableVis.visible=v;pedestal.visible=v;particles.visible=v;};
    function model(t){ // t = minutes upright
      const s=Math.sin(theta*D2R)/Math.sin(70*D2R);
      let dmax=44;if(st.fluid)dmax*=.8;if(st.comp)dmax*=.82;if(st.iron)dmax*=1.12;if(st.prop)dmax*=.72;
      const base=st.prop?66:72;
      const rise=1-Math.exp(-t/1.2);
      const dHR=dmax*Math.max(0,s)*rise;
      const healthy=12*Math.max(0,s)*rise;
      const sbp=112+4*s*rise-(st.prop?4:0),dbp=72+6*s*rise;
      const pooled=620*Math.max(0,Math.sin(theta*D2R))*(st.comp?.72:1);
      return {hr:base+dHR,dHR,healthy,sbp,dbp,pooled,s};
    }
    let ui,tickOff;
    return {
      id:'tilt',title:'Tilt table',fig:'Head-up tilt test',
      enter(panel){
        if(!built)build();setVisible(true);resetRig();
        if(!heartScaled){heart.geo.computeBoundingBox();heartC=heart.geo.boundingBox.getCenter(V3());heart.geo.translate(-heartC.x,-heartC.y,-heartC.z);heart.mesh.position.add(heartC);heartScaled=true;}
        A.mode.layers={skin:.55,skeleton:.25,organs:.25,vessels:1};A.mode.focus=A.resolve(['Wall of heart','#legveins']);A.mode.focusColor='#EE6F82';A.mode.dim=.45;A.refresh();
        theta=90;thetaT=0;tmin=0;running=false;
        panel.innerHTML=`
          <div class="inst-grid">
            <div class="mon">
              <div class="mon-sim">Simulated readings, not the patient's</div><div class="mon-top"><span class="mon-l">HR</span><span class="mon-hr" id="hr">72</span><span class="mon-u">bpm</span><span class="mon-bp"><span id="bp">112/72</span><small>mmHg</small></span></div>
              <canvas id="ecg" width="560" height="90" aria-hidden="true"></canvas>
              <div class="mon-row"><span>Rise since lying</span><b id="dhr">+0</b><span class="bar"><i id="dhrBar"></i><em style="left:${30/60*100}%"></em></span></div>
              <div class="mon-row"><span>Typical healthy rise</span><b id="hh">+0</b><span class="note">usually 10–20 bpm</span></div>
              <div class="mon-row"><span>Blood shifted to legs and belly</span><b id="pool">0 mL</b><span class="note">about 0.5–1 L on standing</span></div>
              <div class="mon-row"><span>Time upright</span><b id="tm">0:00</b><span class="note">test runs 10 min</span></div>
              <div class="verdict" id="verdict">Lying flat. Raise the table.</div>
            </div>
            ${slider('tiltA','Table angle',0,70,1,0,'°')}
            <div class="btns"><button class="btn primary" id="run" type="button">Run the 10-minute test</button><button class="btn" id="flat" type="button">Lay flat</button></div>
            <p class="eyebrow">What changes the response</p>
            <div class="tgs">${toggle('t-comp','Compression garments')}${toggle('t-fluid','2–3 L fluid and salt')}${toggle('t-prop','Propranolol (beta blocker)')}${toggle('t-iron','Iron deficient',false,'on the patient\'s chart; its effect on heart rate is unknown, so this uses an invented 12%')}</div>
            <p class="fine">The diagnostic rule is real: a sustained rise of 30 bpm or more within 10 minutes, without blood pressure falling by 20/10 or more. The patient's own tilt numbers aren't on the chart, so the size of the response and of each treatment's effect are illustrative; their directions follow the literature (propranolol: Raj 2009). The number alone isn't the diagnosis: some healthy young people also pass 30 bpm on a tilt, which is why symptoms are part of the rule.</p>
          </div>`;
        ui=panel;
        const tA=bindSlider(panel,'tiltA',v=>{thetaT=v;if(!running&&v<1)tmin=0;},v=>v+'°');
        panel.querySelector('#run').onclick=()=>{thetaT=70;tA.value=70;panel.querySelector('#tiltA-v').textContent='70°';tmin=0;running=true;};
        panel.querySelector('#flat').onclick=()=>{thetaT=0;tA.value=0;panel.querySelector('#tiltA-v').textContent='0°';tmin=0;running=false;};
        for(const k of ['comp','fluid','prop','iron'])bindToggle(panel,'t-'+k,on=>{st[k]=on;});
        ecg=panel.querySelector('#ecg');ctx=ecg.getContext('2d');ecgX=0;
        A.flyTo({target:[0,0.92,0.05],dist:4.3,azim:58,elev:12});
        tickOff=A.onTick((dt)=>{
          prevTheta=theta;theta=damp(theta,thetaT,2.2,dt);
          A.tableGroup.rotation.x=-(90-theta)*D2R;
          const pyT=theta>80?PIVOT_Y:TABLE_H;A.tableGroup.position.y=damp(A.tableGroup.position.y||PIVOT_Y,pyT,3,dt);A.tableGroup.position.z=ZB-0.075;A.bodyHolder.position.set(0,-PIVOT_Y,-(ZB-0.075));
          if(theta>5&&thetaT>5)tmin+=dt*(running?24:1)/60*(running?1:1); // running compresses 10 min into ~25 s
          if(running&&tmin>=10){running=false;}
          if(thetaT<1&&theta<2)tmin=0;
          const M=model(tmin);
          // heart beats at the modelled rate
          beatPhase+=dt*M.hr/60*Math.PI*2;const b=Math.pow(Math.max(Math.sin(beatPhase),0),6);heart.mesh.scale.setScalar(1+b*.06);
          // vein brightness with pooling
          const pool=M.pooled/620;for(const r of A.tagged('legveins')){r.col.set('#3F5DA8').lerp(new THREE.Color('#7F9BFF'),pool);r.tgt.em=.15+pool*.6;r.hi.set('#5F7FE8');}
          // particles slide toward the feet in proportion to sin(theta)
          const curves=A.legVeinCurves;const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),sc=V3(1,1,1),p=V3();
          for(let i=0;i<PT.length;i++){const P=PT[i];const g=Math.sin(theta*D2R);P.u+=dt*.12*P.sp*(.25+g*(P.u<.85?1:.15));if(P.u>1)P.u=g>.5&&Math.random()<.75?.75+Math.random()*.22:0;
            const ci=P.c;curves[ci].getPointAt(Math.min(P.u,1),p);sc.setScalar(1+pool*(P.u>.6?.7:.2));m4.compose(p,q,sc);particles.setMatrixAt(i,m4);}
          particles.instanceMatrix.needsUpdate=true;
          needleG.rotation.z=theta*D2R;
          // readouts
          ui.querySelector('#hr').textContent=Math.round(M.hr);ui.querySelector('#bp').textContent=`${Math.round(M.sbp)}/${Math.round(M.dbp)}`;
          ui.querySelector('#dhr').textContent='+'+Math.round(M.dHR);ui.querySelector('#dhrBar').style.width=clamp(M.dHR/60*100,0,100)+'%';
          ui.querySelector('#dhrBar').classList.toggle('over',M.dHR>=30);
          ui.querySelector('#hh').textContent='+'+Math.round(M.healthy);ui.querySelector('#pool').textContent=Math.round(M.pooled/10)*10+' mL';
          const mm=Math.floor(tmin),ss=Math.floor((tmin-mm)*60);ui.querySelector('#tm').textContent=`${mm}:${String(ss).padStart(2,'0')}`;
          const v=ui.querySelector('#verdict');
          if(theta<5)v.textContent='Lying flat. Raise the table.';
          else if(M.dHR>=30&&tmin>=1.5)v.innerHTML='<b>In this simulation, meets the POTS threshold:</b> sustained rise of 30+ bpm within 10 minutes, blood pressure holding.';
          else if(M.dHR>=30)v.textContent='Above 30 bpm. The rule needs it sustained.';
          else v.textContent=tmin<10?'Rising. Watch the change since lying flat.':(st.comp||st.fluid||st.prop)?'Under 30 bpm with these treatments. That\'s the goal of treatment; the diagnosis stays the same.':'Below the 30 bpm threshold at this setting.';
          drawECG(dt,M.hr);
        });
      },
      exit(){tickOff?.();setVisible(false);A.tableGroup.rotation.x=0;A.tableGroup.position.set(0,PIVOT_Y,ZB-0.075);A.bodyHolder.position.set(0,-PIVOT_Y,-(ZB-0.075));heart.mesh.scale.setScalar(1);
        for(const r of A.tagged('legveins')){r.col.set('#3F5DA8');}}
    };
    function drawECG(dt,hr){
      const W=ecg.width,H=ecg.height;const speed=110;const steps=Math.max(1,Math.round(dt*speed));
      for(let k=0;k<steps;k++){
        const ph=(performance.now()/1000*hr/60+k/speed*hr/60)%1;
        let y=0;const g=(c,w,a)=>a*Math.exp(-((ph-c)**2)/(2*w*w));
        y=g(.18,.025,.12)-g(.29,.008,.12)+g(.31,.01,1)-g(.335,.01,.25)+g(.55,.045,.3);
        const Y=H*.68-y*H*.55;
        ctx.fillStyle='#0D1517';ctx.fillRect(ecgX,0,4,H);
        ctx.strokeStyle='#7FD3A3';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(ecgX-1,lastY);ctx.lineTo(ecgX,Y);ctx.stroke();
        lastY=Y;ecgX=(ecgX+1)%W;if(ecgX===0)lastY=Y;
      }
    }
  })();all.push(tilt);

  /* ==================================================================== BEIGHTON (hEDS) */
  const beighton=(()=>{
    let tickOff,ui,gonio=null,active=0;const vals=[0,0,0,0,0];
    const TESTS=[
      {k:'Little finger bends back past 90°',max:110,normal:45,thr:90,pts:2},
      {k:'Thumb reaches the forearm',max:100,normal:40,thr:96,pts:2,unit:'%'},
      {k:'Elbow straightens past 10°',max:25,normal:5,thr:10,pts:2},
      {k:'Knee straightens past 10°',max:25,normal:5,thr:10,pts:2},
      {k:'Palms flat on the floor, knees straight',max:100,normal:50,thr:96,pts:1,unit:'%'},
    ];
    let geomCache=null;
    function geom(){
      if(geomCache)return geomCache;const G={};
      for(const s of ['right','left']){const H=A.hand[s];
        // little finger MCP: positive = extension (toward the back of the hand)
        const lf=H.fingers[4][1];G['lf'+s]={node:lf.node,parent:H.fingers[4][0].node,pivot:lf.pivot,u:lf.dir,m:lf.axis.clone().negate()};
        // wrist flexion axis (toward the palm), thumb CMC
        const wristAxis=H.dir.clone().cross(H.volar).normalize();
        G['wr'+s]={node:N['wrist'+s],axis:wristAxis,pivot:H.wrist};
        G['th'+s]={node:H.fingers[0][0].node,pivot:H.fingers[0][0].pivot};
        // elbow and knee: positive = hyperextension
        const fd=H.wrist.clone().sub(H.elbow).normalize();const post=V3(0,0,-1);
        G['el'+s]={node:N['elbow'+s],parent:N['shoulder'+s],pivot:H.elbow,u:fd,m:fd.clone().cross(post).normalize()};
        const kp=N['kneeP'+s],ap=N['ankleP'+s];const sd=ap.clone().sub(kp).normalize();
        G['kn'+s]={node:N['knee'+s],parent:N['hip'+s],pivot:kp,u:sd,m:sd.clone().cross(V3(0,0,1)).normalize()};
      }
      geomCache=G;return G;
    }
    function thumbTarget(s){ // point on the volar forearm, a third of the way up from the wrist
      const H=A.hand[s];const p=H.wrist.clone().lerp(H.elbow,.28).add(H.volar.clone().multiplyScalar(0.016));return p;}
    function apply(){
      const G=geom();
      for(const s of ['right','left']){
        G['lf'+s].node.quaternion.setFromAxisAngle(G['lf'+s].m,vals[0]*D2R);
        // thumb: wrist flexes up to 85°, then thumb swings toward the forearm
        const f=vals[1]/100;G['wr'+s].node.quaternion.setFromAxisAngle(G['wr'+s].axis,85*Math.min(1,f*1.4)*D2R);
        G['wr'+s].node.updateMatrixWorld(true);
        const th=G['th'+s];th.node.quaternion.identity();th.node.updateMatrixWorld(true);
        const chain=A.hand[s].fingers[0];const tipNode=chain[chain.length-1];
        const tipW=toWorld(tipNode.node,tipNode.pivot.clone().add(tipNode.tipLocal));const cmcW=toWorld(th.node,th.pivot);
        const tgtW=thumbTarget(s).clone();const tW=toWorld(N['elbow'+s],tgtW);
        const a=tipW.clone().sub(cmcW),b=tW.clone().sub(cmcW);
        let ang=Math.acos(clamp(a.clone().normalize().dot(b.clone().normalize()),-1,1));
        const axW=a.clone().cross(b).normalize();
        const qp=new THREE.Quaternion();th.node.parent.getWorldQuaternion(qp);const axL=axW.clone().applyQuaternion(qp.invert());
        // reach scales with the slider; past 70% the thumb closes the remaining gap to the forearm
        const reach=f<.7?f/.7*.75:.75+(f-.7)/.3*.25;ang*=reach;
        // keep the thumb clear of the forearm surface
        th.node.quaternion.setFromAxisAngle(axL,Math.min(ang,Math.acos(clamp(a.clone().normalize().dot(b.clone().normalize()),-1,1))-0.02));
        G['el'+s].node.quaternion.setFromAxisAngle(G['el'+s].m,vals[2]*D2R);
        G['kn'+s].node.quaternion.setFromAxisAngle(G['kn'+s].m,vals[3]*D2R);
      }
      // forward bend: trunk rotates at the hips; arms hang plumb; hands lay flat once fingertips touch
      const f5=vals[4]/100;const trunkA=f5*118;N.trunk.quaternion.setFromAxisAngle(V3(1,0,0),trunkA*D2R);
      for(const s of ['right','left']){N['shoulder'+s].quaternion.setFromAxisAngle(V3(1,0,0),-trunkA*D2R);}
      A.root.updateMatrixWorld(true);
      if(active===4){for(const s of ['right','left']){
        const chain=A.hand[s].fingers[2];const tip=chain[chain.length-1];
        let lo=0,hi=95,wax=A.hand[s].dir.clone().cross(A.hand[s].volar).normalize().negate();
        const tipY=e=>{N['wrist'+s].quaternion.setFromAxisAngle(wax,e*D2R);N['wrist'+s].updateMatrixWorld(true);return toWorld(tip.node,tip.pivot.clone().add(tip.tipLocal)).y;};
        if(tipY(0)<0.008){for(let k=0;k<14;k++){const mid=(lo+hi)/2;if(tipY(mid)<0.008)lo=mid;else hi=mid;}tipY(lo);A.hand[s].flat=lo;}else{A.hand[s].flat=0;}
      }}
    }
    function score(){
      const p=[vals[0]>90?2:0,vals[1]>=96?2:0,vals[2]>10?2:0,vals[3]>10?2:0,(A.hand.right.flat||0)>=70?1:0];
      return {p,total:p.reduce((a,b)=>a+b,0)};
    }
    function setGonio(i){
      gonio?.dispose();gonio=null;const G=geom();const s='right';
      if(i===0){const g=G['lf'+s];gonio=goniometer(g.parent,g.pivot,g.u,g.m,{max:110,normal:45,thr:90,r:0.028});}
      if(i===2){const g=G['el'+s];gonio=goniometer(g.parent,g.pivot,g.u,g.m,{max:25,normal:5,thr:10,r:0.09});}
      if(i===3){const g=G['kn'+s];gonio=goniometer(g.parent,g.pivot,g.u,g.m,{max:25,normal:5,thr:10,r:0.11});}
    }
    function camFor(i){
      const G=geom();
      const side=(m,away)=>m.dot(away)>=0?m.clone():m.clone().negate();
      if(i===0){const g=G.lfright;const ul=A.hand.right.radial.clone().negate();viewAlong(g.pivot,side(g.m,ul).add(V3(0,0.3,0.3)),0.36);}
      if(i===1){const H=A.hand.right;viewAlong(H.wrist.clone().add(V3(0,0.03,0)),H.volar.clone().add(V3(-0.6,0.2,0)).normalize(),0.62);}
      if(i===2){const g=G.elright;viewAlong(g.pivot.clone().add(V3(0,0.04,0)),side(g.m,V3(-1,0,0)).add(V3(0,0.12,0.1)),1.25);}
      if(i===3){const g=G.knright;viewAlong(g.pivot,side(g.m,V3(-1,0,0)).add(V3(0,0.1,0.08)),1.05);}
      if(i===4)A.flyTo({target:[0,0.62,0.25],dist:3.4,azim:-82,elev:8});
    }
    return {
      id:'beighton',title:'Beighton bench',fig:'Nine-point hypermobility score',
      enter(panel){
        resetRig();A.mode.layers={skin:0,skeleton:1,organs:0,vessels:0};A.mode.focus=null;A.mode.dim=.2;A.refresh();
        vals.fill(0);active=0;
        panel.innerHTML=`<div class="score"><span class="score-n" id="bs">0</span><span class="score-d">/ 9</span><span class="score-t" id="bst">Threshold for adults up to 50: <b>5 or more</b></span></div>
          <div class="tests" role="tablist">${TESTS.map((t,i)=>`<button class="test" role="tab" data-i="${i}" aria-selected="${i===0}"><span class="tn">${i+1}</span><span class="tk">${t.k}</span><span class="tp" id="tp${i}">0/${t.pts}</span></button>`).join('')}</div>
          ${slider('bv','Bend',0,110,1,0,'°')}
          <p class="fine" id="bnote"></p>
          <p class="fine">This shows how the test is scored on a real skeleton. It is not the patient's recorded score, which a clinician measured. Each side counts separately; here both sides move together.</p>`;
        ui=panel;
        const bv=panel.querySelector('#bv');
        const notes=['Passive extension of the little finger at the knuckle. Normal is roughly up to 45°; past 90° scores.','Wrist flexed, thumb drawn down until it touches the inside of the forearm. Touching scores.','Elbow extension beyond straight. More than 10° scores.','Knee extension beyond straight (genu recurvatum). More than 10° scores.','Bending forward with knees straight until both palms rest flat on the floor. Scores 1 point.'];
        const setActive=i=>{active=i;panel.querySelectorAll('.test').forEach(b=>b.setAttribute('aria-selected',+b.dataset.i===i));const t=TESTS[i];
          bv.max=t.max;bv.value=vals[i];panel.querySelector('#bv-v').textContent=vals[i]+(t.unit||'°');panel.querySelector('#bnote').textContent=notes[i];
          setGonio(i);camFor(i);};
        panel.querySelectorAll('.test').forEach(b=>b.onclick=()=>setActive(+b.dataset.i));
        bv.addEventListener('input',()=>{vals[active]=+bv.value;panel.querySelector('#bv-v').textContent=bv.value+(TESTS[active].unit||'°');});
        setActive(0);
        tickOff=A.onTick(()=>{apply();if(gonio)gonio.set(vals[active]);const sc=score();ui.querySelector('#bs').textContent=sc.total;
          sc.p.forEach((v,i)=>{const e=ui.querySelector('#tp'+i);e.textContent=v+'/'+TESTS[i].pts;e.classList.toggle('hit',v>0);});
          ui.querySelector('#bs').classList.toggle('hit',sc.total>=5);});
      },
      exit(){tickOff?.();gonio?.dispose();gonio=null;resetRig();}
    };
  })();all.push(beighton);

  /* ==================================================================== NECK (C6/C7, cervical arthritis) */
  const neck=(()=>{
    let tickOff,ui,bulge=null;const v={ext:0,lat:0,rot:0,hern:3};const cur={ext:0,lat:0,rot:0};
    return {
      id:'neck',title:'Cervical spine',fig:'C6/C7 and the C7 root',
      enter(panel){
        resetRig();
        if(!bulge){const d=MESH['Intervertebral disk of sixth cervical vertebra'];d.geo.computeBoundingBox();const bb=d.geo.boundingBox;const c=bb.getCenter(V3());
          const g=new THREE.SphereGeometry(1,22,16);bulge=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:'#F2A65A',emissive:'#F2A65A',emissiveIntensity:.35,roughness:.5}));
          const pos=V3(bb.min.x+0.004,c.y,bb.min.z+0.004);N.c7.add(bulge);bulge.position.copy(pos).sub(N.c7.userData.pivot);bulge.userData.base=pos;}
        bulge.visible=true;
        A.mode.layers={skin:0,skeleton:.35,organs:.05,vessels:.08};A.mode.forceShow=A.resolve(['#c7nerve']);
        A.mode.focus=A.resolve(['Third cervical vertebra','Fourth cervical vertebra','Fifth cervical vertebra','Sixth cervical vertebra','Seventh cervical vertebra','Intervertebral disk of sixth cervical vertebra','#c7nerve']);
        A.mode.focusColor='#B193E3';A.mode.dim=.3;A.refresh();
        panel.innerHTML=`<div class="readouts">
            <div class="ro"><span>Pressure on the C7 root (model)</span><b id="cmp">0%</b><span class="bar"><i id="cmpBar"></i></span></div>
            <div class="ro"><span>Arm pain or tingling</span><b id="pain" class="sm">none</b><span class="note">changes with head position</span></div>
            <div class="ro"><span>Triceps strength</span><b id="tri">5/5</b><span class="note">tracks how hard and how long the nerve has been squeezed, not head position</span></div>
            <div class="ro"><span>Triceps reflex</span><b id="ref">normal</b></div>
            <div class="ro"><span>Finger extensors (opening the hand)</span><b id="fe">5/5</b></div>
            <div class="ro"><span>Middle-finger sensation</span><b id="mf">normal</b></div>
          </div>
          ${slider('n-hern','Disc herniation',0,6,.5,3,' mm')}
          ${slider('n-ext','Extension (head back)',-30,30,1,0,'°')}
          ${slider('n-lat','Tilt toward the sore side (right here)',0,30,1,0,'°')}
          ${slider('n-rot','Turn toward the sore side',0,40,1,0,'°')}
          <div class="warn" id="n-wk" hidden><b>Worth acting on</b>Weakness that is new or getting worse needs to be seen promptly. Sudden weakness, or any bladder or bowel change, means the emergency department.</div>
          <div class="btns"><button class="btn primary" id="spur" type="button">Spurling's test</button><button class="btn" id="neu" type="button">Neutral</button><button class="btn" id="follow" type="button">Follow the nerve</button></div>
          <p class="fine">The vertebrae and the C6/C7 disc are real anatomy. The herniation (amber) and the nerve's course are drawn schematically. Spurling's test (head tipped back and toward the sore side, with gentle pressure down on the head) briefly narrows the exit hole. A positive test brings on the arm pain or tingling; it doesn't change strength or reflexes, which reflect how hard and how long the nerve has been squeezed. It's a clinician's test: please don't try it on the patient's neck, especially a hypermobile one. Strength grades use the 0–5 MRC scale (5 normal, 4 weaker than normal, 3 can just lift against gravity). The mapping from pressure to grades is illustrative.</p>`;
        ui=panel;
        bindSlider(panel,'n-hern',x=>v.hern=x,x=>x+' mm');bindSlider(panel,'n-ext',x=>v.ext=x,x=>x+'°');bindSlider(panel,'n-lat',x=>v.lat=x,x=>x+'°');bindSlider(panel,'n-rot',x=>v.rot=x,x=>x+'°');
        const set=(id,x)=>{const i=panel.querySelector('#'+id);i.value=x;i.dispatchEvent(new Event('input'));};
        panel.querySelector('#spur').onclick=()=>{set('n-ext',22);set('n-lat',25);set('n-rot',12);};
        panel.querySelector('#neu').onclick=()=>{set('n-ext',0);set('n-lat',0);set('n-rot',0);};
        let following=false;panel.querySelector('#follow').onclick=e=>{following=!following;e.target.textContent=following?'Back to the neck':'Follow the nerve';
          following?A.flyTo({target:[-0.17,1.05,0],dist:1.25,azim:-58,elev:6}):view();};
        const view=()=>{const d=MESH['Intervertebral disk of sixth cervical vertebra'];d.geo.computeBoundingBox();const c=d.geo.boundingBox.getCenter(V3());A.flyTo({target:[c.x-0.01,c.y+0.02,c.z],dist:0.66,azim:-128,elev:12});};
        view();
        tickOff=A.onTick(dt=>{
          for(const k of ['ext','lat','rot'])cur[k]=damp(cur[k],v[k],5,dt);
          const q=new THREE.Quaternion(),qe=new THREE.Quaternion(),ql=new THREE.Quaternion(),qr=new THREE.Quaternion();
          for(const nd of A.neckOrder){qe.setFromAxisAngle(V3(1,0,0),-cur.ext/6*D2R);ql.setFromAxisAngle(V3(0,0,1),cur.lat/6*D2R);qr.setFromAxisAngle(V3(0,-1,0),cur.rot/6*D2R);nd.quaternion.copy(q.copy(qe).multiply(ql).multiply(qr));}
          bulge.scale.set(0.002+v.hern*0.0011,0.0025+v.hern*0.0005,0.002+v.hern*0.001);
          const comp=clamp(v.hern/6*.62+Math.max(0,cur.ext)/30*.2+cur.lat/30*.24+cur.rot/40*.1,0,1);
          const nerve=A.tagged('c7nerve')[0];nerve.col.set('#F2C14E').lerp(new THREE.Color('#FF5A3C'),comp);nerve.tgt.em=.2+comp*.8;nerve.hi.set('#FF7A4C');
          ui.querySelector('#cmp').textContent=Math.round(comp*100)+'%';ui.querySelector('#cmpBar').style.width=comp*100+'%';ui.querySelector('#cmpBar').classList.toggle('over',comp>.55);
          const sev=v.hern/6; // severity proxy: strength and reflex follow the disc, not the head angle
          const grade=sev<.6?5:sev<.9?4:3;ui.querySelector('#tri').textContent=grade+'/5';ui.querySelector('#fe').textContent=Math.min(5,grade+(grade<5?1:0))+'/5';
          ui.querySelector('#ref').textContent=sev<.6?'normal':'reduced';ui.querySelector('#mf').textContent=comp<.35?'normal':(comp<.7||sev<.7)?'tingling':'numb';
          ui.querySelector('#pain').textContent=comp<.3?'none':comp<.5?'mild, back of the arm':comp<.75?'clear, down to the middle finger':'strong';
          ui.querySelector('#n-wk').hidden=grade>=5;
        });
      },
      exit(){tickOff?.();resetRig();if(bulge)bulge.visible=false;A.mode.forceShow=null;const n=A.tagged('c7nerve')[0];n.col.set('#F2C14E');}
    };
  })();all.push(neck);

  /* ==================================================================== HAND (RA) */
  const hand=(()=>{
    let tickOff,ui,caps=[],openCur=1,trigSnap=0;const v={open:30,awake:20,months:0,ster:false,trig:false,next:false};
    const CURL={mcp:52,pip:72,dip:34,tm:26,ti:28};
    function capsules(){
      if(caps.length){caps.forEach(c=>c.visible=true);return;}
      const H=A.hand.right;const mat=new THREE.MeshStandardMaterial({color:'#F29A55',emissive:'#F29A55',emissiveIntensity:.3,transparent:true,opacity:.3,roughness:.4,depthWrite:false});
      const add=(parent,p,r)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(1,20,14),mat);parent.add(m);m.position.copy(p).sub(parent.userData.pivot);m.userData.r=r;m.renderOrder=9;caps.push(m);};
      add(N.elbowright,H.wrist,0.013);
      for(const f of [1,2,3]){add(H.fingers[f][0].node,H.fingers[f][1].pivot,0.0075);add(H.fingers[f][1].node,H.fingers[f][2].pivot,0.0062);}
      add(H.fingers[4][0].node,H.fingers[4][1].pivot,0.0068);
    }
    // HCQ: little effect for the first month, mostly there by 4–6 months (sigmoid). Alone it is a partial response.
    // Steroids: short-term only, so their effect is shown for the first 3 months. Next step: methotrexate or a biologic.
    const sig=m=>{const e=x=>1/(1+Math.exp(-(x-2)/.6));return (e(m)-e(0))/(1-e(0));};
    function model(){
      const sterOn=v.ster&&v.months<3;
      let I=(1-0.4*sig(v.months))*(sterOn?.55:1);if(v.next)I*=.15+.85*(1-sig(v.months));
      const D=10+140*I;
      const S=I*Math.pow(clamp(1-v.awake/D,0,1),.8)*.5;
      return {I,D,S,max:1-S,sterOn};
    }
    const band=D=>D>=120?'over 2 hours':D>=90?'about 1½–2 hours':D>=60?'about 1–1½ hours':D>=30?'half an hour to an hour':'under half an hour';
    return {
      id:'hand',title:'Rheumatoid hand',fig:'Morning stiffness and treatment',
      enter(panel){
        resetRig();capsules();
        A.mode.layers={skin:0,skeleton:.25,organs:0,vessels:0};A.mode.focus=A.resolve(['#righthand']);A.mode.focusColor='#F29A55';A.mode.dim=.25;A.refresh();
        panel.innerHTML=`<div class="readouts">
          <div class="ro"><span>Hand opens to</span><b id="op">0%</b><span class="bar"><i id="opBar"></i></span></div>
          <div class="ro"><span>Morning stiffness lasts</span><b id="dur" class="sm">—</b><span class="note">RA pattern: an hour or more. Treatment aims for remission, about 15 minutes or less.</span></div>
          <div class="ro"><span>Joint-lining inflammation</span><b id="inf">high</b></div>
          <div class="ro"><span>Typical RA pattern</span><b class="sm">wrist, knuckles, middle joints</b><span class="note">fingertip joints spared</span></div>
        </div>
        ${slider('h-open','Try to open the hand',0,100,1,30,'%')}
        ${slider('h-awake','Minutes since waking',0,180,5,20,' min')}
        ${slider('h-months','Months on hydroxychloroquine',0,6,.5,0,' mo')}
        <div class="tgs">${toggle('h-ster','Steroid bridge (short-term)','covers the first weeks while the DMARD builds up')}${toggle('h-next','Next step: methotrexate or a biologic','what guidelines add if hydroxychloroquine isn\'t enough')}${toggle('h-trig','Trigger finger (middle)','a tendon that catches, then snaps free')}</div>
        <p class="fine" id="h-sn" hidden style="margin-top:0!important">Steroids are kept short; by three months the DMARD should be doing the work. If the joints flare when a bridge ends, that's a reason to call the rheumatologist and review the plan.</p>
        <p class="fine">Hand bones are real anatomy; joint-lining swelling is drawn schematically. Hydroxychloroquine usually takes two to three months to start helping and up to six for its full effect; on its own it is the gentlest DMARD, so the model leaves some stiffness. Treat-to-target care changes the plan if there's no clear improvement by about three months. In RA, making a full fist and gripping are often harder than opening. The stiffness curve is illustrative of the RA pattern, not the patient's measured response.</p>`;
        ui=panel;
        bindSlider(panel,'h-open',x=>v.open=x,x=>x+'%');bindSlider(panel,'h-awake',x=>v.awake=x,x=>x+' min');bindSlider(panel,'h-months',x=>v.months=x,x=>x+' mo');
        bindToggle(panel,'h-ster',on=>v.ster=on);bindToggle(panel,'h-next',on=>v.next=on);bindToggle(panel,'h-trig',on=>v.trig=on);
        const H=A.hand.right;const c=H.fingers[2][1].pivot.clone().lerp(H.wrist,.35);
        viewAlong(c,H.volar.clone().multiplyScalar(-1).add(V3(-0.55,0.15,0)).normalize(),0.5);
        tickOff=A.onTick(dt=>{
          const M=model();const want=v.open/100;const reach=Math.min(want,M.max);openCur=damp(openCur,reach,6,dt);
          for(let f=0;f<5;f++){const ch=H.fingers[f];let o=openCur;
            if(f===2&&v.trig){ if(want<.7&&o>.42){o=.42;trigSnap=0;} else if(want>=.7){trigSnap=Math.min(1,trigSnap+dt*9);o=.42+(openCur-.42)*trigSnap;} }
            const c=1-o;
            if(f===0){ch[1].node.quaternion.setFromAxisAngle(ch[1].axis,CURL.tm*c*D2R);ch[2].node.quaternion.setFromAxisAngle(ch[2].axis,CURL.ti*c*D2R);}
            else{ch[1].node.quaternion.setFromAxisAngle(ch[1].axis,CURL.mcp*c*D2R);ch[2].node.quaternion.setFromAxisAngle(ch[2].axis,CURL.pip*c*D2R);ch[3].node.quaternion.setFromAxisAngle(ch[3].axis,CURL.dip*c*D2R);}
          }
          for(const m of caps){const r=m.userData.r*(0.55+M.I*0.75);m.scale.setScalar(r);}
          ui.querySelector('#op').textContent=Math.round(openCur*100)+'%';ui.querySelector('#opBar').style.width=openCur*100+'%';
          ui.querySelector('#dur').textContent=band(M.D);ui.querySelector('#inf').textContent=M.I>.8?'high':M.I>.5?'moderate':M.I>.25?'lower':'low';
          ui.querySelector('#h-sn').hidden=!(v.ster&&v.months>=3);
        });
      },
      exit(){tickOff?.();resetRig();caps.forEach(c=>c.visible=false);}
    };
  })();all.push(hand);

  /* ==================================================================== STOMACH (gastroparesis) */
  const stomach=(()=>{
    let tickOff,ui,meal=null,pts=[],pyl,duoC,tH=0,playing=false,grade='moderate',med=false;
    const GR={normal:{r4:1.2,label:'Normal'},mild:{r4:16,label:'Mild (11–20%)'},moderate:{r4:28,label:'Moderate (21–35%)'},severe:{r4:43,label:'Severe (36–50%)'},vsevere:{r4:60,label:'Very severe (>50%)'}};
    // Normal: modified power exponential (Siegel/Elashoff) fitted to Tougas 2000 medians: 73/23/1.2% at 1/2/4 h
    const fNormal=t=>1-Math.pow(1-Math.exp(-1.518*Math.max(t,0)),5.29);
    const fGrade=(t,r4)=>{if(r4<2)return fNormal(t);const beta=1.25,tau=4/Math.pow(-Math.log(r4/100),1/beta);return Math.exp(-Math.pow(Math.max(t-0.15,0)/tau,beta));};
    const f=t=>fGrade(t,GR[grade].r4);
    function buildMeal(){
      const st=MESH['Stomach'];st.geo.computeBoundingBox();const bb=st.geo.boundingBox;
      const ray=new THREE.Raycaster();const tmpMesh=new THREE.Mesh(st.geo,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));
      const cand=[];for(let i=0;i<2600&&cand.length<320;i++){const p=V3(bb.min.x+Math.random()*(bb.max.x-bb.min.x),bb.min.y+Math.random()*(bb.max.y-bb.min.y),bb.min.z+Math.random()*(bb.max.z-bb.min.z));
        ray.set(p,V3(1,0.013,0.007).normalize());const n=ray.intersectObject(tmpMesh,false).length;if(n%2===1&&p.y<bb.max.y-0.03)cand.push(p);}
      // pylorus: stomach vertex closest to the duodenum
      const sp=st.geo.attributes.position.array,dg=MESH['Duodenum'].geo,dp=dg.attributes.position.array;let best=1e9;pyl=V3();
      for(let i=0;i<sp.length;i+=9)for(let j=0;j<dp.length;j+=9){const d=(sp[i]-dp[j])**2+(sp[i+1]-dp[j+1])**2+(sp[i+2]-dp[j+2])**2;if(d<best){best=d;pyl.set(sp[i],sp[i+1],sp[i+2]);}}
      dg.computeBoundingBox();duoC=dg.boundingBox.getCenter(V3());
      cand.sort((a,b)=>a.distanceTo(pyl)-b.distanceTo(pyl));
      pts=cand.map((p,i)=>({home:p,rank:i/cand.length}));
      meal=new THREE.InstancedMesh(new THREE.SphereGeometry(.0035,8,6),A.tm(THREE.MeshStandardMaterial,{color:'#F4E6A8',emissive:'#DDB741',emissiveIntensity:.35}),pts.length);meal.renderOrder=7;N.trunk.add(meal);meal.position.copy(N.trunk.userData.pivot).negate();
    }
    function chart(){
      const W=300,H=150,px=t=>28+t/4*(W-40),py=r=>10+(1-r/100)*(H-34);
      let path='',pathN='',pathM='';for(let i=0;i<=80;i++){const t=i/20;path+=(i?'L':'M')+px(t).toFixed(1)+' '+py(f(t)*100).toFixed(1);pathN+=(i?'L':'M')+px(t).toFixed(1)+' '+py(fNormal(t)*100).toFixed(1);
        if(med){const a=1-f(Math.max(t-.25,0));pathM+=(i?'L':'M')+px(t).toFixed(1)+' '+py(a*100).toFixed(1);}}
      const lim=[[1,90],[2,60],[4,10]].map(([t,r])=>`<circle cx="${px(t)}" cy="${py(r)}" r="3" fill="none" stroke="var(--dim)"/>`).join('');
      return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Percent of meal retained over four hours">
        ${[0,25,50,75,100].map(r=>`<line x1="28" x2="${W-12}" y1="${py(r)}" y2="${py(r)}" stroke="var(--line)"/><text x="22" y="${py(r)+3}" text-anchor="end">${r}</text>`).join('')}
        ${[0,1,2,3,4].map(t=>`<text x="${px(t)}" y="${H-8}" text-anchor="middle">${t} h</text>`).join('')}
        <rect x="${px(3.85)}" y="${py(100)}" width="${px(4)-px(3.85)+6}" height="${py(10)-py(100)}" fill="var(--alert)" opacity=".12"/>
        <path d="${pathN}" fill="none" stroke="var(--dim)" stroke-width="1.5" stroke-dasharray="4 3"/>
        ${med?`<path d="${pathM}" fill="none" stroke="var(--endocrine)" stroke-width="1.5" stroke-dasharray="2 2"/>`:''}
        <path d="${path}" fill="none" stroke="var(--digestive)" stroke-width="2.2"/>
        ${lim}<line id="ph" x1="${px(tH)}" x2="${px(tH)}" y1="${py(100)}" y2="${py(0)}" stroke="var(--bone)" stroke-width="1"/>
      </svg>`;
    }
    return {
      id:'stomach',title:'Gastric emptying',fig:'Four-hour scintigraphy',
      enter(panel){
        resetRig();if(!meal)buildMeal();meal.visible=true;tH=0;playing=false;
        A.mode.layers={skin:.12,skeleton:.1,organs:.12,vessels:0};A.mode.focus=A.resolve(['Stomach','Esophagus','Duodenum']);A.mode.focusColor='#DDB741';A.mode.dim=.15;A.refresh();
        A.MESH['Stomach'].base=.55;A.MESH['Stomach'].tgt.op=.55;
        panel.innerHTML=`<div class="readouts">
            <div class="ro"><span>Meal still in the stomach</span><b id="ret">100%</b><span class="bar"><i id="retBar"></i></span></div>
            <div class="ro"><span>At 4 hours, this curve</span><b id="r4"></b><span class="note">over 10% is delayed</span></div>
            <div class="ro"><span>Healthy median at this time</span><b id="nm">100%</b></div>
            ${'<div class="ro" id="medro" hidden><span>Tablet that has left the stomach</span><b id="mdv">0%</b><span class="note">and can now be absorbed: a rough proxy for when it starts working</span></div>'}
          </div>
          <div id="chartBox"></div>
          <p class="legend"><i class="sw sw-d"></i>This curve <i class="sw sw-n"></i>Healthy median (Tougas 2000) <i class="sw sw-c"></i>Upper limit of normal</p>
          ${slider('g-t','Time since the meal',0,240,1,0,'')}
          <div class="btns"><button class="btn primary" id="gplay" type="button">Play four hours</button></div>
          <div class="seg" role="radiogroup" aria-label="Severity">${Object.entries(GR).map(([k,g])=>`<button role="radio" data-g="${k}" aria-checked="${k===grade}">${g.label}</button>`).join('')}</div>
          <div class="tgs">${toggle('g-med','Swallow a pill with the meal','it is absorbed only after it leaves the stomach')}</div>
          <p class="fine">The chart doesn't give the patient's grade, so choose one. Grades follow the consensus 4-hour cut-offs (Abell 2008); curves between the measured points are smooth fits for illustration. Here the pill is assumed to leave with the food; a dissolved tablet can leave sooner with the liquid, and a large tablet that doesn't break up can wait longer. The stomach, esophagus and duodenum are real anatomy.</p>`;
        ui=panel;
        const fmtT=m=>`${Math.floor(m/60)} h ${String(Math.round(m%60)).padStart(2,'0')} min`;
        const draw=()=>{panel.querySelector('#chartBox').innerHTML=chart();panel.querySelector('#r4').textContent=fmt(f(4)*100,1)+'%';};
        const ts=bindSlider(panel,'g-t',x=>{tH=x/60;playing=false;},fmtT);
        panel.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{grade=b.dataset.g;panel.querySelectorAll('[data-g]').forEach(x=>x.setAttribute('aria-checked',x===b));draw();});
        bindToggle(panel,'g-med',on=>{med=on;panel.querySelector('#medro').hidden=!on;draw();});
        panel.querySelector('#gplay').onclick=()=>{if(tH>=3.99)tH=0;playing=true;};
        draw();
        const st=MESH['Stomach'];st.geo.computeBoundingBox();const c=st.geo.boundingBox.getCenter(V3());
        A.flyTo({target:[c.x-0.02,c.y-0.03,c.z],dist:0.86,azim:28,elev:8});
        const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),one=V3(1,1,1),p=V3();
        tickOff=A.onTick(dt=>{
          if(playing){tH+=dt/22*4;if(tH>=4){tH=4;playing=false;}ts.value=Math.round(tH*60);panel.querySelector('#g-t-v').textContent=fmtT(tH*60);}
          const r=f(tH);
          for(let i=0;i<pts.length;i++){const P=pts[i];const leaveAt=1-P.rank; // fraction retained when this particle leaves
            let k=clamp((leaveAt-r)/0.035,0,1);
            if(k<=0)p.copy(P.home);else if(k<.5)p.copy(P.home).lerp(pyl,k*2);else p.copy(pyl).lerp(duoC,(k-.5)*2);
            const s=k>=1?0.0001:1;one.setScalar(s);m4.compose(p,q,one);meal.setMatrixAt(i,m4);}
          meal.instanceMatrix.needsUpdate=true;
          ui.querySelector('#ret').textContent=fmt(r*100,0)+'%';ui.querySelector('#retBar').style.width=r*100+'%';ui.querySelector('#retBar').classList.toggle('over',tH>3.9&&r>.1);
          ui.querySelector('#nm').textContent=fmt(fNormal(tH)*100,0)+'%';
          if(med)ui.querySelector('#mdv').textContent=fmt((1-f(Math.max(tH-.25,0)))*100,0)+'%';
          const ph=ui.querySelector('#ph');if(ph){const x=28+tH/4*(300-40);ph.setAttribute('x1',x);ph.setAttribute('x2',x);}
        });
      },
      exit(){tickOff?.();if(meal)meal.visible=false;A.MESH['Stomach'].base=1;}
    };
  })();all.push(stomach);

  /* ==================================================================== THYROID LOOP (Hashimoto's) */
  const thyroid=(()=>{
    let tickOff,ui,parts=null,curve,lym=null;const v={rem:35,dose:75,iron:false,cal:false,weeks:8};
    // Iron cuts absorption more than calcium (Campbell 1992: TSH 1.6→5.4; Singh 2000: 1.6→2.7).
    // The remaining gland throttles back when TSH is suppressed (a few damped fixed-point steps).
    function model(){
      const E=v.rem/100;const fabs=0.75*(v.iron?0.6:1)*(v.cal?0.85:1);const Dss=v.dose*fabs/75;
      let tsh=1.8,ft4=0;
      for(let k=0;k<10;k++){const Ee=E*Math.pow(clamp(tsh/1.8,.1,1),.3);
        const lvl=w=>Ee+Dss*(1-Math.pow(.5,Math.max(w,0)));
        ft4=1.25*lvl(v.weeks);const n=clamp(1.8*Math.pow(10,(1.25-1.25*lvl(v.weeks-1.2))/0.5),0.01,100);tsh=Math.sqrt(tsh*n);}
      return {ft4,tsh,E};
    }
    function build(){
      const pit=MESH['Pituitary gland'];pit.geo.computeBoundingBox();const pc=pit.geo.boundingBox.getCenter(V3());
      const tl=A.tagged('thyroid');const tb=new THREE.Box3();tl.forEach(r=>{r.geo.computeBoundingBox();tb.union(r.geo.boundingBox);});const tc=tb.getCenter(V3());
      curve=new THREE.CatmullRomCurve3([pc,V3(pc.x+0.03,pc.y-0.05,pc.z-0.01),V3(0.032,1.45,0.0),V3(0.03,tc.y+0.03,tc.z),V3(tc.x+0.012,tc.y,tc.z+0.006)]);
      const mk=(col,n)=>{const m=new THREE.InstancedMesh(new THREE.SphereGeometry(.0024,8,6),A.tm(THREE.MeshBasicMaterial,{color:col}),n);m.renderOrder=8;A.root.add(m);return m;};
      parts={tsh:mk('#78A0F4',60),t4:mk('#40C7AA',60),pT:Array.from({length:60},()=>Math.random()),pF:Array.from({length:60},()=>Math.random()),tc,pc};
      lym=new THREE.InstancedMesh(new THREE.SphereGeometry(.0026,10,8),A.tm(THREE.MeshStandardMaterial,{color:'#EDE7F7',emissive:'#B193E3',emissiveIntensity:.4}),40);lym.renderOrder=8;A.root.add(lym);
      parts.L=Array.from({length:40},()=>({a:Math.random()*Math.PI*2,y:(Math.random()-.5)*0.04,r:0.026+Math.random()*0.01,s:.4+Math.random()}));
    }
    return {
      id:'thyroid',title:'Thyroid loop',fig:'Hypothalamus, pituitary, thyroid',
      enter(panel){
        resetRig();if(!parts)build();[parts.tsh,parts.t4,lym].forEach(m=>m.visible=true);
        A.mode.layers={skin:.12,skeleton:.12,organs:.1,vessels:.12};A.mode.focus=A.resolve(['#thyroid','Pituitary gland','hypothalamus, nsn']);A.mode.focusColor='#40C7AA';A.mode.dim=.2;A.refresh();
        panel.innerHTML=`<div class="readouts">
            <div class="ro"><span>TSH</span><b id="tsh">0</b><span class="note">reference about 0.4–4.0 mIU/L</span><span class="bar log"><i id="tshBar"></i><em style="left:${(Math.log10(0.4)+2)/4*100}%"></em><em style="left:${(Math.log10(4)+2)/4*100}%"></em></span></div>
            <div class="ro"><span>Free T4</span><b id="ft4">0</b><span class="note">reference about 0.8–1.8 ng/dL</span></div>
            <div class="ro"><span>Status</span><b id="stat">—</b></div>
          </div>
          ${slider('y-rem','Thyroid tissue still working',5,100,5,35,'%')}
          ${slider('y-dose','Levothyroxine per day (example dose, not the patient\'s)',0,150,12.5,75,' mcg')}
          ${slider('y-weeks','Weeks since starting this dose (from none)',0,10,.5,8,' wk')}
          <div class="tgs">${toggle('y-iron','Taken with iron','binds it strongly in the gut')}${toggle('y-cal','Taken with calcium','binds it less, but still lowers it')}</div>
          <p class="fine">The hypothalamus and pituitary are real anatomy; the thyroid gland is modelled at its true position below the real thyroid cartilage. Blue particles are TSH travelling to the thyroid; green are T4 leaving it. The loop is real physiology; the numbers are an illustrative model: T4's half-life is about a week, so any change takes about five weeks to level out, and TSH needs six to eight weeks to settle. Reference ranges vary by lab.</p>`;
        ui=panel;
        bindSlider(panel,'y-rem',x=>v.rem=x,x=>x+'%');bindSlider(panel,'y-dose',x=>v.dose=x,x=>x+' mcg');bindSlider(panel,'y-weeks',x=>v.weeks=x,x=>x+' wk');bindToggle(panel,'y-iron',on=>v.iron=on);bindToggle(panel,'y-cal',on=>v.cal=on);
        A.flyTo({target:[0,1.45,0.02],dist:0.62,azim:38,elev:6});
        const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),sc=V3(1,1,1),p=V3();
        tickOff=A.onTick(dt=>{
          const M=model();
          const nT=Math.round(clamp(Math.log10(M.tsh)+2,0,4)/4*60),nF=Math.round(clamp(M.ft4/2.2,0,1)*60);
          for(let i=0;i<60;i++){parts.pT[i]=(parts.pT[i]+dt*.25)%1;curve.getPointAt(parts.pT[i],p);sc.setScalar(i<nT?1:0.0001);m4.compose(p,q,sc);parts.tsh.setMatrixAt(i,m4);
            parts.pF[i]=(parts.pF[i]+dt*.2)%1;const u=parts.pF[i];p.copy(parts.tc).add(V3(Math.sin(i*2.1)*0.01,-u*0.12+Math.cos(i)*0.004*u,0.01+u*0.02));sc.setScalar(i<nF?1:0.0001);m4.compose(p,q,sc);parts.t4.setMatrixAt(i,m4);}
          parts.tsh.instanceMatrix.needsUpdate=true;parts.t4.instanceMatrix.needsUpdate=true;
          const nL=Math.round((1-M.E)*40);const t=performance.now()/1000;
          for(let i=0;i<40;i++){const L=parts.L[i];const a=L.a+t*.25*L.s;p.set(parts.tc.x+Math.cos(a)*L.r,parts.tc.y+L.y,parts.tc.z+Math.sin(a)*L.r*.5+0.004);sc.setScalar(i<nL?1:0.0001);m4.compose(p,q,sc);lym.setMatrixAt(i,m4);}
          lym.instanceMatrix.needsUpdate=true;
          for(const r of A.tagged('thyroid')){const k=v.rem/100;r.col.set('#4FC9AE').lerp(new THREE.Color('#8F8A86'),1-k);}
          ui.querySelector('#tsh').textContent='about '+(M.tsh<10?fmt(M.tsh,1):fmt(M.tsh,0));ui.querySelector('#ft4').textContent='about '+fmt(M.ft4,1);
          const tb=ui.querySelector('#tshBar');tb.style.width=clamp((Math.log10(M.tsh)+2)/4*100,0,100)+'%';tb.classList.toggle('over',M.tsh>4||M.tsh<0.4);
          ui.querySelector('#stat').textContent='Model: '+(M.tsh>10?'clearly underactive':M.tsh>4?'underactive (TSH high)':M.tsh<0.4?'overtreated (TSH suppressed)':'in range');
        });
      },
      exit(){tickOff?.();[parts?.tsh,parts?.t4,lym].forEach(m=>m&&(m.visible=false));for(const r of A.tagged('thyroid'))r.col.set('#4FC9AE');}
    };
  })();all.push(thyroid);

  return Object.fromEntries(all.map(s=>[s.id,s]));
}
export { slider, toggle, bindSlider, bindToggle };
