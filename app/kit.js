// Shared helpers for the stage-two instruments.
import * as THREE from 'three';
export { slider, toggle, bindSlider, bindToggle } from './stations.js';

export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const fmt=(x,d=0)=>Number(x).toFixed(d);
export const lerp=(a,b,t)=>a+(b-a)*t;
export const D2R=Math.PI/180;

export function kit(A){
  const {MESH,V3}=A;
  const resetRig=()=>{A.root.traverse(o=>{if(o.isObject3D&&!o.isMesh&&o!==A.root)o.quaternion.identity();});};
  const box=n=>{const r=MESH[n];r.geo.computeBoundingBox();return r.geo.boundingBox.clone();};
  const centre=n=>box(n).getCenter(V3());
  const viewAlong=(t,dir,dist)=>{dir=dir.clone().normalize();A.flyTo({target:[t.x,t.y,t.z],dist,azim:Math.atan2(dir.x,dir.z)/D2R,elev:Math.asin(clamp(dir.y,-1,1))/D2R});};
  // random surface points (vertices of the decimated meshes are close to uniform)
  function samplePts(names,n){
    const arrs=names.map(nm=>MESH[nm]?.geo.attributes.position.array).filter(Boolean);
    const tot=arrs.reduce((s,a)=>s+a.length/3,0);const out=[];
    for(const a of arrs){const k=Math.max(1,Math.round(n*(a.length/3)/tot));for(let i=0;i<k;i++){const j=Math.floor(Math.random()*a.length/3)*3;out.push(V3(a[j],a[j+1],a[j+2]));}}
    return out;
  }
  function dots(n,geo,mat,parent=A.root,order=9){const m=new THREE.InstancedMesh(geo,mat,n);m.renderOrder=order;m.frustumCulled=false;parent.add(m);m.visible=false;
    const z=new THREE.Matrix4().makeScale(1e-4,1e-4,1e-4);for(let i=0;i<n;i++)m.setMatrixAt(i,z);return m;}
  const _m=new THREE.Matrix4(),_q=new THREE.Quaternion(),_s=V3();
  const put=(im,i,p,s,q)=>{_s.setScalar(Math.max(s,1e-4));_m.compose(p,q||_q,_s);im.setMatrixAt(i,_m);};
  const putS=(im,i,p,sv,q)=>{_m.compose(p,q||_q,sv);im.setMatrixAt(i,_m);};
  function tube(pts,r,col,seg=60){const c=new THREE.CatmullRomCurve3(pts.map(p=>p.isVector3?p:V3(...p)));
    const m=new THREE.Mesh(new THREE.TubeGeometry(c,seg,r,10,false),new THREE.MeshStandardMaterial({color:col,roughness:.45,emissive:col,emissiveIntensity:.15}));m.renderOrder=8;A.root.add(m);return {mesh:m,curve:c};}
  // remember and restore record colours
  const keepCol=r=>{if(!r.col0)r.col0=r.col.clone();return r;};
  const restoreCols=list=>{for(const r of list)if(r?.col0)r.col.copy(r.col0);};
  const setMode=(o)=>{Object.assign(A.mode,{layers:null,focus:null,focusColor:'#ffffff',dim:.2,forceShow:null},o);A.refresh();};
  const recs=list=>[...A.resolve(list)];
  return {resetRig,box,centre,viewAlong,samplePts,dots,put,putS,tube,keepCol,restoreCols,setMode,recs};
}

// small SVG line-chart helper: series [{pts:[[x,y]],stroke,dash,width}]
export function lineChart({W=300,H=150,x0,x1,y0,y1,xticks=[],yticks=[],xfmt=v=>v,yfmt=v=>v,series=[],extra='',after='',label='chart',left=30}){
  const px=x=>left+(x-x0)/(x1-x0)*(W-left-10),py=y=>10+(1-(y-y0)/(y1-y0))*(H-34);
  let s=`<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="${label}">`;
  for(const y of yticks)s+=`<line x1="${left}" x2="${W-10}" y1="${py(y)}" y2="${py(y)}" stroke="var(--line)"/><text x="${left-6}" y="${py(y)+3}" text-anchor="end">${yfmt(y)}</text>`;
  for(const x of xticks)s+=`<text x="${px(x)}" y="${H-8}" text-anchor="middle">${xfmt(x)}</text>`;
  s+=typeof extra==='function'?extra(px,py):extra;
  for(const se of series){const d=se.pts.map((p,i)=>(i?'L':'M')+px(p[0]).toFixed(1)+' '+py(p[1]).toFixed(1)).join('');
    s+=`<path d="${d}" fill="none" stroke="${se.stroke}" stroke-width="${se.width||2}" ${se.dash?`stroke-dasharray="${se.dash}"`:''}/>`;}
  s+=typeof after==='function'?after(px,py):after;
  return {svg:s+'</svg>',px,py};
}
