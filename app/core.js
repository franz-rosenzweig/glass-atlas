// Glass Atlas core: real anatomy (BodyParts3D), a joint rig derived from the bones themselves,
// layers, highlighting, picking and the camera.
import * as THREE from 'three';
import { raw, toLight } from './theme.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LAYER_OF } from './data.js';

const V3 = (x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const damp=(c,t,k,dt)=>c+(t-c)*(1-Math.exp(-k*dt));
export const easeIO=t=>t<.5?8*t*t*t*t:1-Math.pow(-2*t+2,4)/2;

/* ------------------------------------------------------------------ colours */
function colourFor(name,group){
  const n=name.toLowerCase();
  if(group==='disc')return '#86C9DA';
  if(LAYER_OF[group]==='skeleton')return '#E6DFCC';
  if(group==='artery')return '#C23447';
  if(group==='vein')return '#3F5DA8';
  if(group==='brain')return /callosum|thalamus|caudate|putamen|stria/.test(n)?'#C9B39D':/cerebellum|pons|medulla|midbrain/.test(n)?'#C99C92':'#D9AFA5';
  if(n==='pituitary gland'||n.startsWith('hypothalamus'))return '#3FBFA2';
  if(n==='wall of heart')return '#B3404F';
  if(n.includes('lung'))return '#D79F9A';
  if(n==='liver')return '#7F3A31';
  if(n==='gallbladder')return '#5E8A4D';
  if(n==='stomach')return '#D49470';
  if(n==='esophagus')return '#C27966';
  if(/duodenum|jejunum|ileum/.test(n))return '#D6A07C';
  if(/colon|rectum/.test(n))return '#BF8E6B';
  if(n.startsWith('pancreas'))return '#D8B46A';
  if(n==='spleen')return '#7A2E3D';
  if(n.includes('kidney'))return '#8F3D3A';
  if(n.includes('bladder'))return '#D3B88E';
  if(n==='trachea'||n==='thyroid cartilage')return '#CFC6B4';
  return '#C9A08C';
}
const OPACITY_BASE = n => /lung/i.test(n)?0.22 : n==='Liver'?0.85 : 1;

/* ------------------------------------------------------------------ glass skin */
const glassVert=`varying vec3 vN;varying vec3 vV;varying vec3 vP;
void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=-mv.xyz;vP=position;gl_Position=projectionMatrix*mv;}`;
const glassFrag=`uniform float uAlpha,uScaffold,uTime,uBody;uniform vec3 uRim,uFill,uScafCol;varying vec3 vN;varying vec3 vV;varying vec3 vP;
void main(){vec3 n=normalize(vN),v=normalize(vV);float fr=1.-abs(dot(n,v));float rim=pow(fr,2.2);
float key=max(dot(n,normalize(vec3(-.4,.7,.6))),0.);
vec3 c=uFill*(.28+.5*key)+uRim*rim*1.2;float a=(uBody*(.05+.06*key)+rim*.72);
float x=vP.y*60.;float g=abs(fract(x-.5)-.5)/fwidth(x);float line=1.-min(g,1.);
float sc=uScaffold*line;c=mix(c,uScafCol*1.3,clamp(sc,0.,1.)*.85);a+=sc*.5;
gl_FragColor=vec4(c,clamp(a,0.,1.)*uAlpha);}`;

/* ------------------------------------------------------------------ geometry analysis */
function stats(pos){
  const n=pos.length/3;const c=V3();
  for(let i=0;i<n;i++){c.x+=pos[i*3];c.y+=pos[i*3+1];c.z+=pos[i*3+2];}c.multiplyScalar(1/n);
  let xx=0,xy=0,xz=0,yy=0,yz=0,zz=0;
  for(let i=0;i<n;i++){const x=pos[i*3]-c.x,y=pos[i*3+1]-c.y,z=pos[i*3+2]-c.z;xx+=x*x;xy+=x*y;xz+=x*z;yy+=y*y;yz+=y*z;zz+=z*z;}
  let a=V3(.3,1,.2).normalize();
  for(let k=0;k<40;k++){a=V3(xx*a.x+xy*a.y+xz*a.z,xy*a.x+yy*a.y+yz*a.z,xz*a.x+yz*a.y+zz*a.z).normalize();}
  let tmin=1e9,tmax=-1e9;const t=new Float32Array(n);
  for(let i=0;i<n;i++){t[i]=(pos[i*3]-c.x)*a.x+(pos[i*3+1]-c.y)*a.y+(pos[i*3+2]-c.z)*a.z;tmin=Math.min(tmin,t[i]);tmax=Math.max(tmax,t[i]);}
  const L=tmax-tmin,e0=V3(),e1=V3();let n0=0,n1=0;
  for(let i=0;i<n;i++){if(t[i]<tmin+L*.07){e0.x+=pos[i*3];e0.y+=pos[i*3+1];e0.z+=pos[i*3+2];n0++;}
    if(t[i]>tmax-L*.07){e1.x+=pos[i*3];e1.y+=pos[i*3+1];e1.z+=pos[i*3+2];n1++;}}
  e0.multiplyScalar(1/n0);e1.multiplyScalar(1/n1);
  return {c,axis:a,L,ends:[e0,e1]};
}
function nearestEnd(s,target){return s.ends[0].distanceTo(target)<s.ends[1].distanceTo(target)?s.ends[0]:s.ends[1];}
function farEnd(s,target){return s.ends[0].distanceTo(target)<s.ends[1].distanceTo(target)?s.ends[1]:s.ends[0];}

/* ------------------------------------------------------------------ main */
export async function createAtlas(canvas,{binUrl='anatomy.bin',onProgress}={}){
  const A={THREE,V3};
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(30,1,0.02,40);
  const controls=new OrbitControls(camera,canvas);
  controls.enableDamping=true;controls.dampingFactor=.08;controls.minDistance=.18;controls.maxDistance=7;
  controls.maxPolarAngle=Math.PI*.66;controls.enablePan=false;controls.rotateSpeed=.7;
  Object.assign(A,{renderer,scene,camera,controls});

  const hemi=new THREE.HemisphereLight(0xe3efe9,0x0b1113,1.15);scene.add(hemi);
  const key=new THREE.DirectionalLight(0xfff0e0,2.0);key.position.set(-1.5,3,2.5);scene.add(key);
  const rim=new THREE.DirectionalLight(0xa6dcff,1.1);rim.position.set(2,1.5,-2.5);scene.add(rim);
  const fill=new THREE.DirectionalLight(0xffffff,.45);fill.position.set(0,-1,2);scene.add(fill);

  /* ---------- load ---------- */
  const res=await fetch(binUrl);if(!res.ok)throw new Error('Could not load the anatomy data ('+res.status+')');
  let buf;
  if(/\.txt$/.test(binUrl)){ // gzip + base64 text, so the artifact host serves it as a plain data file
    const b64=(await res.text()).trim();onProgress?.(.3);
    const bin=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
    buf=await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  }else buf=await res.arrayBuffer();
  onProgress?.(.5);
  const dv=new DataView(buf);const hl=dv.getUint32(4,true),pn=dv.getUint32(8,true),inn=dv.getUint32(12,true);
  const H=JSON.parse(new TextDecoder().decode(new Uint8Array(buf,16,hl)));
  let off=16+hl;const P=new Int16Array(buf,off,pn);off+=pn*2;off+=(4-off%4)%4;const I=new Uint16Array(buf,off,inn);

  const MESH={};A.MESH=MESH;const recs=[];A.recs=recs;
  const skinUniforms={uAlpha:{value:1},uScaffold:{value:0},uTime:{value:0},uBody:{value:1},uRim:{value:new THREE.Color('#D3F1EC')},uFill:{value:new THREE.Color('#6F9E9A')},uScafCol:{value:new THREE.Color('#B193E3')}};
  A.skinUniforms=skinUniforms;
  for(const m of H.meshes){
    const pos=new Float32Array(m.vn*3);
    for(let i=0;i<m.vn*3;i++){const a=i%3;pos[i]=(P[m.v0*3+i]+32767)*H.scale[a]+H.lo[a];}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
    g.setIndex(new THREE.BufferAttribute(I.slice(m.i0,m.i0+m.in),1));g.computeVertexNormals();g.computeBoundingSphere();
    addRec(m.name,m.g,g,{fma:m.id});
  }
  onProgress?.(.8);

  function addRec(name,group,geo,opt={}){
    const layer=LAYER_OF[group]||'organs';let mat,mesh;
    if(group==='skin'){
      const front=new THREE.ShaderMaterial({uniforms:skinUniforms,vertexShader:glassVert,fragmentShader:glassFrag,transparent:true,depthWrite:false,side:THREE.FrontSide});
      mat=front;mesh=new THREE.Mesh(geo,front);mesh.renderOrder=20;
    }else{
      const col=opt.color||colourFor(name,group);
      mat=new THREE.MeshStandardMaterial({color:col,roughness:layer==='skeleton'?.72:.55,metalness:0,transparent:true,opacity:1,emissive:0x000000,side:THREE.DoubleSide});
      mesh=new THREE.Mesh(geo,mat);mesh.renderOrder=layer==='vessels'?3:2;
    }
    const base=opt.base??OPACITY_BASE(name);
    const r={name,group,layer,geo,mesh,mat,fma:opt.fma,modelled:!!opt.modelled,base,col:new THREE.Color(opt.color||colourFor(name,group)),
             cur:{op:base,em:0},tgt:{op:base,em:0},hi:new THREE.Color('#ffffff'),tags:opt.tags||[]};
    mesh.userData.rec=r;MESH[name]=r;recs.push(r);return r;
  }
  A.addRec=addRec;

  /* ---------- modelled structures (not in BodyParts3D 3.0) ---------- */
  const lm=n=>{const r=MESH[n];r.geo.computeBoundingBox();return r.geo.boundingBox;};
  function blob(c,r,{taper=0,rot=[0,0,0],seg=28}={}){
    const g=new THREE.SphereGeometry(1,seg,Math.round(seg*.7));const p=g.attributes.position;const v=V3();
    for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const s=1+taper*v.y;v.x*=s;v.z*=s;p.setXYZ(i,v.x*r[0],v.y*r[1],v.z*r[2]);}
    g.rotateX(rot[0]);g.rotateY(rot[1]);g.rotateZ(rot[2]);g.translate(...c);g.computeVertexNormals();return g;
  }
  function tube(pts,r,seg=80){const c=new THREE.CatmullRomCurve3(pts.map(p=>V3(...p)));return {geo:new THREE.TubeGeometry(c,seg,r,8,false),curve:c};}
  {
    const tc=lm('Thyroid cartilage');const tr=lm('Trachea');
    const y=tc.min.y-0.03, zf=tr.max.z;
    const gl=blob([-0.0195,y,zf-0.012],[0.0095,0.022,0.0105],{taper:-.18,rot:[0,0,-.12]});
    const gr=blob([0.0195,y,zf-0.012],[0.0095,0.022,0.0105],{taper:-.18,rot:[0,0,.12]});
    const gi=blob([0,y-0.012,zf-0.002],[0.014,0.0055,0.0045]);
    for(const [g,n] of [[gl,'Right lobe of thyroid gland'],[gr,'Left lobe of thyroid gland'],[gi,'Isthmus of thyroid gland']])
      addRec(n,'model',g,{modelled:true,color:'#4FC9AE',tags:['thyroid']});
    // female pelvic organs, placed between the real bladder and rectum
    const bl=lm('Urinary bladder'),re=lm('Rectum');
    const zMid=(bl.min.z+re.max.z)/2;
    addRec('Uterus','model',blob([0,bl.max.y+0.012,zMid+0.012],[0.024,0.034,0.017],{taper:.22,rot:[0.65,0,0]}),{modelled:true,color:'#C98A97',tags:['uterus']});
    addRec('Cervix','model',new THREE.CylinderGeometry(0.0105,0.012,0.026,20).rotateX(0.65+Math.PI).translate(0,bl.max.y-0.022,zMid-0.008),{modelled:true,color:'#D9A0AC',tags:['cervix','uterus']});
    for(const s of [-1,1]){
      addRec(s<0?'Right ovary':'Left ovary','model',blob([s*0.052,bl.max.y+0.02,zMid-0.012],[0.015,0.009,0.008]),{modelled:true,color:'#D7B0A0',tags:['ovaries']});
      const t=tube([[s*0.02,bl.max.y+0.042,zMid+0.03],[s*0.04,bl.max.y+0.045,zMid+0.012],[s*0.058,bl.max.y+0.034,zMid-0.004],[s*0.06,bl.max.y+0.024,zMid-0.014]],0.0026,40);
      addRec(s<0?'Right uterine tube':'Left uterine tube','model',t.geo,{modelled:true,color:'#C98A97',tags:['ovaries','uterus']});
    }
    // C7 nerve root, right side, schematic course to the middle finger
    const d67=MESH['Intervertebral disk of sixth cervical vertebra'].geo;d67.computeBoundingBox();const dc=d67.boundingBox.getCenter(V3());
    const mdp=lm('Distal phalanx of right middle finger');
    const n7=tube([[dc.x-0.02,dc.y,dc.z-0.012],[dc.x-0.045,dc.y-0.017,dc.z-0.004],[-0.08,1.345,-0.012],[-0.13,1.29,-0.022],[-0.168,1.21,-0.05],[-0.205,1.11,-0.045],[-0.238,1.035,-0.01],[-0.252,0.93,-0.036],[-0.259,0.825,-0.012],[-0.265,0.77,0.02],[-0.27,0.72,0.045],[(mdp.min.x+mdp.max.x)/2,mdp.min.y+0.004,(mdp.min.z+mdp.max.z)/2-0.002]],0.0022,160);
    A.c7curve=n7.curve;
    addRec('C7 nerve root and its course (schematic)','nerve',n7.geo,{modelled:true,color:'#F2C14E',base:1,tags:['c7nerve']});
    // leg veins, schematic, for the tilt table
    A.legVeinCurves=[];
    for(const s of [-1,1]){
      const thigh=tube([[s*0.035,0.83,0.03],[s*0.055,0.78,0.045],[s*0.07,0.70,0.03],[s*0.08,0.58,0.005],[s*0.085,0.47,-0.025],[s*0.08,0.41,-0.045]],0.0052,60);
      const calf=tube([[s*0.08,0.41,-0.045],[s*0.078,0.32,-0.055],[s*0.072,0.2,-0.05],[s*0.066,0.09,-0.035],[s*0.06,0.05,-0.02]],0.0045,50);
      const side=s<0?'right':'left';
      addRec(`Femoral vein, ${side} (schematic)`,'modelvessel',thigh.geo,{modelled:true,color:'#3F5DA8',tags:['legveins','vessels','thigh-'+side]});
      addRec(`Popliteal and tibial veins, ${side} (schematic)`,'modelvessel',calf.geo,{modelled:true,color:'#3F5DA8',tags:['legveins','vessels','calf-'+side]});
      A.legVeinCurves.push(thigh.curve,calf.curve);
    }
  }

  /* ---------- tag sets ---------- */
  A.tagged=tag=>{
    if(tag==='skeleton')return recs.filter(r=>r.layer==='skeleton');
    if(tag==='vessels')return recs.filter(r=>r.layer==='vessels');
    if(tag==='brain')return recs.filter(r=>r.group==='brain');
    if(tag==='righthand'||tag==='lefthand'){const s=tag==='righthand'?'right':'left';return recs.filter(r=>r.group==='finger'&&r.name.toLowerCase().includes(s)||r.group==='arm'&&r.name.toLowerCase().startsWith(s)&&/(scaphoid|lunate|triquetral|pisiform|trapezi|capitate|hamate|metacarpal)/i.test(r.name));}
    return recs.filter(r=>r.tags.includes(tag));
  };
  A.resolve=list=>{const out=new Set();for(const it of list){if(it.startsWith('#'))A.tagged(it.slice(1)).forEach(r=>out.add(r));else if(MESH[it])out.add(MESH[it]);}return out;};

  /* ---------- rig ---------- */
  const ST={};const S=n=>ST[n]??=stats(MESH[n].geo.attributes.position.array);A.stats=S;
  const tableGroup=new THREE.Group();scene.add(tableGroup);
  const bodyHolder=new THREE.Group();tableGroup.add(bodyHolder);
  const root=new THREE.Object3D();root.userData.pivot=V3();bodyHolder.add(root);
  Object.assign(A,{tableGroup,bodyHolder,root});
  function node(parent,pivot,name){const n=new THREE.Object3D();n.name=name||'';n.userData.pivot=pivot.clone();n.position.copy(pivot).sub(parent.userData.pivot);parent.add(n);return n;}
  function attach(nd,r){if(!r)return;nd.add(r.mesh);r.mesh.position.copy(nd.userData.pivot).negate();r.node=nd;}
  A.node=node;A.attach=attach;
  const lower=s=>s.toLowerCase();
  const N={};A.N=N;
  // femoral heads
  function femoralHead(side){const pos=MESH[`${side} femur`].geo.attributes.position.array;let maxY=-9;for(let i=1;i<pos.length;i+=3)maxY=Math.max(maxY,pos[i]);
    const top=[];for(let i=0;i<pos.length;i+=3)if(pos[i+1]>maxY-0.06)top.push([pos[i],pos[i+1],pos[i+2]]);
    let minAx=9;for(const p of top)minAx=Math.min(minAx,Math.abs(p[0]));const c=V3();let k=0;for(const p of top)if(Math.abs(p[0])<minAx+0.025){c.x+=p[0];c.y+=p[1];c.z+=p[2];k++;}return c.multiplyScalar(1/k);}
  const hipR=femoralHead('Right'),hipL=femoralHead('Left');const hipMid=hipR.clone().add(hipL).multiplyScalar(.5);
  N.trunk=node(root,hipMid,'trunk');
  for(const [side,hip] of [['Right',hipR],['Left',hipL]]){
    const s=lower(side);const fem=S(`${side} femur`),tib=S(`${side} tibia`);
    const knee=nearestEnd(fem,tib.c).clone().add(nearestEnd(tib,fem.c)).multiplyScalar(.5);
    const talus=S(`${side} talus`);const ankle=nearestEnd(tib,talus.c).clone().add(talus.c).multiplyScalar(.5);
    N['hip'+s]=node(root,hip,'hip-'+s);N['knee'+s]=node(N['hip'+s],knee,'knee-'+s);N['ankle'+s]=node(N['knee'+s],ankle,'ankle-'+s);
    attach(N['hip'+s],MESH[`${side} femur`]);attach(N['hip'+s],MESH[`${side} patella`]);
    attach(N['knee'+s],MESH[`${side} tibia`]);attach(N['knee'+s],MESH[`${side} fibula`]);
    for(const r of recs)if(r.group==='leg'&&!/femur|patella|tibia|fibula/i.test(r.name)&&(lower(r.name).startsWith(s)||lower(r.name).includes(' '+s+' ')||lower(r.name).endsWith(s+' foot')))attach(N['ankle'+s],r);
    for(const r of recs)if(r.tags.includes('thigh-'+s))attach(N['hip'+s],r);else if(r.tags.includes('calf-'+s))attach(N['knee'+s],r);
    Object.assign(N,{[`kneeP${s}`]:knee,[`ankleP${s}`]:ankle});
  }
  // neck chain: pivots at disc centres
  const discC=n=>{const g=MESH[n].geo;g.computeBoundingBox();return g.boundingBox.getCenter(V3());};
  const NECK=[['c7','Intervertebral disk of seventh cervical vertebra','Seventh cervical vertebra'],['c6','Intervertebral disk of sixth cervical vertebra','Sixth cervical vertebra'],
              ['c5','Intervertebral disk of fifth cervical vertebra','Fifth cervical vertebra'],['c4','Intervertebral disk of fourth cervical vertebra','Fourth cervical vertebra'],
              ['c3','Intervertebral disk of third cervical vertebra','Third cervical vertebra'],['head','Intervertebral disk of axis',null]];
  let parent=N.trunk;A.neckOrder=[];
  for(const [k,disc,vert] of NECK){N[k]=node(parent,discC(disc),k);if(vert)attach(N[k],MESH[vert]);A.neckOrder.push(N[k]);parent=N[k];}
  // discs ride the vertebra below them
  attach(N.trunk,MESH['Intervertebral disk of seventh cervical vertebra']);
  attach(N.c7,MESH['Intervertebral disk of sixth cervical vertebra']);attach(N.c6,MESH['Intervertebral disk of fifth cervical vertebra']);
  attach(N.c5,MESH['Intervertebral disk of fourth cervical vertebra']);attach(N.c4,MESH['Intervertebral disk of third cervical vertebra']);attach(N.c3,MESH['Intervertebral disk of axis']);
  for(const r of recs)if(r.group==='skull'||r.group==='brain'||r.name==='Pituitary gland'||r.name.startsWith('hypothalamus')||r.name==='Atlas'||r.name==='Axis')attach(N.head,r);
  // arms and hands
  A.hand={};
  for(const side of ['Right','Left']){
    const s=lower(side);const hum=S(`${side} humerus`),uln=S(`${side} ulna`),rad=S(`${side} radius`);
    const pos=MESH[`${side} humerus`].geo.attributes.position.array;let maxY=-9;for(let i=1;i<pos.length;i+=3)maxY=Math.max(maxY,pos[i]);
    const hd=V3();let k=0;let ax=[];for(let i=0;i<pos.length;i+=3)if(pos[i+1]>maxY-0.045)ax.push(Math.abs(pos[i]));ax.sort((a,b)=>a-b);const med=ax[ax.length>>1];
    for(let i=0;i<pos.length;i+=3)if(pos[i+1]>maxY-0.045&&Math.abs(pos[i])<=med){hd.x+=pos[i];hd.y+=pos[i+1];hd.z+=pos[i+2];k++;}hd.multiplyScalar(1/k);
    const elbow=nearestEnd(hum,uln.c).clone().add(nearestEnd(uln,hum.c)).multiplyScalar(.5);
    const lun=S(`${side} lunate`);const wrist=nearestEnd(rad,lun.c).clone().add(lun.c).multiplyScalar(.5);
    N['shoulder'+s]=node(N.trunk,hd,'shoulder-'+s);N['elbow'+s]=node(N['shoulder'+s],elbow,'elbow-'+s);N['wrist'+s]=node(N['elbow'+s],wrist,'wrist-'+s);
    attach(N['shoulder'+s],MESH[`${side} humerus`]);attach(N['elbow'+s],MESH[`${side} radius`]);attach(N['elbow'+s],MESH[`${side} ulna`]);
    for(const c of ['scaphoid','lunate','triquetral','pisiform','trapezium','trapezoid','capitate','hamate'])attach(N['wrist'+s],MESH[`${side} ${c}`]);
    const ORD=['first','second','third','fourth','fifth'],FN=['thumb','index finger','middle finger','ring finger','little finger'];
    const m2=S(`${side} second metacarpal bone`),m5=S(`${side} fifth metacarpal bone`),m3=S(`${side} third metacarpal bone`);
    const d=farEnd(m3,lun.c).clone().sub(nearestEnd(m3,lun.c)).normalize();
    const r=m2.c.clone().sub(m5.c).normalize();
    const volar=side==='Right'?r.clone().cross(d).normalize():d.clone().cross(r).normalize();
    const fingers=[];
    for(let f=0;f<5;f++){
      const meta=`${side} ${ORD[f]} metacarpal bone`;const bones=[meta,`Proximal phalanx of ${s} ${FN[f]}`];if(f>0)bones.push(`Middle phalanx of ${s} ${FN[f]}`);bones.push(`Distal phalanx of ${s} ${FN[f]}`);
      const chain=[];let par=N['wrist'+s];
      for(let b=0;b<bones.length;b++){
        const st=S(bones[b]);
        let piv;
        if(b===0){piv=nearestEnd(st,lun.c).clone();if(f===0){const tz=S(`${side} trapezium`);piv=nearestEnd(st,tz.c).clone().add(tz.c).multiplyScalar(.5);}}
        else{const ps=S(bones[b-1]);piv=farEnd(ps,lun.c).clone().add(nearestEnd(st,lun.c)).multiplyScalar(.5);}
        const nd=node(par,piv,`${s}-${f}-${b}`);attach(nd,MESH[bones[b]]);
        const dir=farEnd(st,lun.c).clone().sub(nearestEnd(st,lun.c)).normalize();
        let axis=dir.clone().cross(volar).normalize();
        chain.push({node:nd,pivot:piv,dir,axis,bone:bones[b],tipLocal:farEnd(st,lun.c).clone().sub(piv)});
        par=nd;
      }
      fingers.push(chain);
    }
    A.hand[s]={volar,dir:d,radial:r,fingers,wrist,elbow,shoulder:hd,lunate:lun.c};
  }
  // everything else rides the trunk
  for(const r of recs)if(!r.node&&r.group!=='skin')attach(N.trunk,r);
  attach(root,MESH['Skin']);
  A.pivots={hipR,hipL,hipMid};

  /* ---------- floor ---------- */
  {const cv=document.createElement('canvas');cv.width=cv.height=256;const x=cv.getContext('2d');raw(()=>{const gr=x.createRadialGradient(128,128,0,128,128,128);gr.addColorStop(0,'rgba(0,0,0,.5)');gr.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gr;x.fillRect(0,0,256,256);});
   const sh=new THREE.Mesh(new THREE.PlaneGeometry(.7,.7),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.position.y=0.001;scene.add(sh);A.shadow=sh;
   const ring=new THREE.Mesh(new THREE.RingGeometry(.4,.402,128),new THREE.MeshBasicMaterial({color:0x33474c,transparent:true,opacity:.8,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=0.002;scene.add(ring);A.floorRing=ring;}

  /* ---------- light / dark: the same vitrine by daylight ---------- */
  // Instruments register the overlay materials whose colour has to flip with the theme (a white
  // pointer would vanish on paper); the anatomy keeps its own colours in both.
  const themed=new Set();
  const paint=m=>{const L=A.light,u=m.userData;m.color.set(L?toLight(u.hex):u.hex);if(u.em)m.emissive.set(L?toLight(u.em):u.em);
    const b=L&&u.blend===THREE.AdditiveBlending?THREE.NormalBlending:u.blend;if(m.blending!==b){m.blending=b;m.needsUpdate=true;}};
  A.themed=(mat,hex)=>{const u=mat.userData;u.hex=hex;u.blend??=mat.blending;themed.add(mat);mat.addEventListener('dispose',()=>themed.delete(mat));paint(mat);return mat;};
  A.tm=(Cls,opt)=>{const m=new Cls(opt);if(typeof opt.emissive==='string')m.userData.em=opt.emissive;return A.themed(m,opt.color);};
  A.skinBase={fill:new THREE.Color('#6F9E9A'),rim:new THREE.Color('#D3F1EC')};
  A.light=false;
  A.setTheme=t=>{const L=A.light=t==='light';
    hemi.color.set(L?0xffffff:0xe3efe9);hemi.groundColor.set(L?0x9a9284:0x0b1113);hemi.intensity=L?1.3:1.15;
    rim.intensity=L?.6:1.1;renderer.toneMappingExposure=L?1:1.05;
    A.skinBase.rim.set(L?'#3A8A82':'#D3F1EC');A.skinBase.fill.set(L?'#A9D3CD':'#6F9E9A');skinUniforms.uRim.value.copy(A.skinBase.rim);skinUniforms.uFill.value.copy(A.skinBase.fill);skinUniforms.uBody.value=L?.5:1;A.shadow.material.opacity=L?.5:1;skinUniforms.uScafCol.value.set(L?'#7652C2':'#B193E3');
    A.floorRing.material.color.set(L?0xCBC3B3:0x33474c);
    for(const m of themed)paint(m);
    A.refresh?.();
  };

  /* ---------- opacity / emphasis ---------- */
  A.layerOn={skin:true,skeleton:true,organs:true,vessels:true,nerves:false};
  A.mode={layers:null,focus:null,focusColor:'#ffffff',dim:.2,forceShow:null};
  A.refresh=()=>{
    const F=A.mode.focus;const L=A.mode.layers||{};const show=A.mode.forceShow;
    for(const r of recs){
      let op=r.base*(A.layerOn[r.layer]?1:0);
      if(L[r.layer]!==undefined)op*=L[r.layer];
      if(r.layer==='nerves'&&!(show&&show.has(r)))op=A.layerOn.nerves?op:0;
      let em=0;
      if(F&&F.size){
        if(F.has(r)){op=r.layer==='skin'?Math.max(op,.6):Math.max(op,r.base,0.95);em=.42;}
        else op*=r.layer==='skin'?.55:A.mode.dim*(A.light?.5:1);
      }
      if(show&&show.has(r))op=Math.max(op,r.base,0.95);
      r.tgt.op=op;r.tgt.em=em;r.hi.set(A.mode.focusColor);
    }
  };

  /* ---------- camera ---------- */
  let tween=null;
  A.sph=(t,dist,az,el)=>{const a=az*Math.PI/180,e=el*Math.PI/180;return V3(t[0]+dist*Math.cos(e)*Math.sin(a),t[1]+dist*Math.sin(e),t[2]+dist*Math.cos(e)*Math.cos(a));};
  A.flyTo=(t,{instant=false,dur=1300}={})=>{const target=t.target||[0,0.85,0];const to=A.sph(target,t.dist,t.azim,t.elev);
    if(instant||matchMedia('(prefers-reduced-motion: reduce)').matches){camera.position.copy(to);controls.target.set(...target);controls.update();return;}
    tween={t0:performance.now(),dur,fromP:camera.position.clone(),fromT:controls.target.clone(),toP:to,toT:V3(...target)};};
  A.stopTween=()=>{tween=null;};
  function stepCam(now){if(!tween)return;const k=clamp((now-tween.t0)/tween.dur,0,1),e=easeIO(k);
    const a=tween.fromP.clone().sub(tween.fromT),b=tween.toP.clone().sub(tween.toT);const la=a.length(),lb=b.length();
    const dir=a.normalize().lerp(b.normalize(),e).normalize();const tg=tween.fromT.clone().lerp(tween.toT,e);
    camera.position.copy(tg).add(dir.multiplyScalar(la+(lb-la)*e));controls.target.copy(tg);if(k>=1)tween=null;}
  A.isTweening=()=>!!tween;
  A.viewOff={x:0,y:0};A.viewOffT={x:0,y:0};

  /* ---------- picking ---------- */
  const ray=new THREE.Raycaster();
  A.pick=(clientX,clientY,{includeSkin=false}={})=>{
    const r=canvas.getBoundingClientRect();const m=new THREE.Vector2(((clientX-r.left)/r.width)*2-1,-((clientY-r.top)/r.height)*2+1);
    ray.setFromCamera(m,camera);
    const objs=recs.filter(x=>x.mesh.visible&&x.cur.op>.3&&(includeSkin||x.group!=='skin')).map(x=>x.mesh);
    const hit=ray.intersectObjects(objs,false)[0];
    if(hit)return {rec:hit.object.userData.rec,point:hit.point};
    if(!includeSkin)return A.pick(clientX,clientY,{includeSkin:true});
    return null;
  };

  /* ---------- loop ---------- */
  const ticks=new Set();A.onTick=f=>{ticks.add(f);return()=>ticks.delete(f);};
  let last=performance.now();
  A.size=()=>{const W=canvas.clientWidth,H=canvas.clientHeight;renderer.setSize(W,H,false);camera.aspect=W/H;camera.updateProjectionMatrix();};
  const pulse={t:0};
  function frame(now){
    if(A.paused){last=now;requestAnimationFrame(frame);return;}
    const dt=Math.min((now-last)/1000,.05);last=now;pulse.t+=dt;
    stepCam(now);controls.update();
    A.viewOff.x=damp(A.viewOff.x,A.viewOffT.x,6,dt);A.viewOff.y=damp(A.viewOff.y,A.viewOffT.y,6,dt);
    const W=canvas.clientWidth,Hh=canvas.clientHeight;camera.setViewOffset(W,Hh,-A.viewOff.x,A.viewOff.y,W,Hh);
    const p=.78+.22*Math.sin(pulse.t*3);
    for(const r of recs){r.cur.op=damp(r.cur.op,r.tgt.op,6,dt);r.cur.em=damp(r.cur.em,r.tgt.em,6,dt);
      if(r.group==='skin'){skinUniforms.uAlpha.value=Math.min(1,r.cur.op);r.mesh.visible=r.cur.op>.01;continue;}
      r.mat.opacity=Math.min(1,r.cur.op);r.mat.depthWrite=r.cur.op>.96;r.mesh.visible=r.cur.op>.012;
      r.mat.emissive.copy(r.hi).multiplyScalar(r.cur.em*p);r.mat.color.copy(r.col);}
    skinUniforms.uTime.value=pulse.t;
    for(const f of ticks)f(dt,now);
    renderer.render(scene,camera);
    A.afterRender?.();
    requestAnimationFrame(frame);
  }
  A.start=()=>{A.size();requestAnimationFrame(t=>{last=t;frame(t);});};
  A.refresh();
  onProgress?.(1);
  return A;
}
