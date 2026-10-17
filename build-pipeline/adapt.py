import numpy as np, trimesh
out=list(np.load('build/meshes.npy',allow_pickle=True))
idx=[i for i,o in enumerate(out) if o['group']=='skin'][0]
sk=out[idx]
raw=sk['v'].astype(np.float64)
v=np.stack([raw[:,0],raw[:,2],-raw[:,1]],1)/1000   # x left, y up, z front
f=sk['f'].copy()
# 1) select the external genital region
sel=(np.abs(v[:,0])<0.055)&(v[:,1]>0.695)&(v[:,1]<0.835)&(v[:,2]>0.118)
keepF=~sel[f].any(1)
f2=f[keepF]
m=trimesh.Trimesh(v,f2,process=False)
# 2) cap boundary loops created by the cut (only loops near the region)
from collections import defaultdict
edges=np.sort(np.vstack([f2[:,[0,1]],f2[:,[1,2]],f2[:,[2,0]]]),1)
u,c=np.unique(edges,axis=0,return_counts=True)
bnd=u[c==1]
# directed boundary edges to get orientation
de=np.vstack([f2[:,[0,1]],f2[:,[1,2]],f2[:,[2,0]]])
bset=set(map(tuple,bnd))
nxt={}
for a,b in de:
    if (min(a,b),max(a,b)) in bset: nxt[b]=a   # reverse so cap faces have outward orientation
loops=[];seen=set()
for s in list(nxt):
    if s in seen: continue
    L=[s];seen.add(s);cur=nxt[s]
    while cur!=s and cur not in seen and cur in nxt:
        L.append(cur);seen.add(cur);cur=nxt[cur]
    loops.append(L)
V=list(v);F=list(f2)
capped=[]
for L in loops:
    P=v[L];cen=P.mean(0)
    if not (abs(cen[0])<0.08 and 0.66<cen[1]<0.87): continue
    ci=len(V);V.append(cen.copy())
    for i in range(len(L)):F.append([L[i],L[(i+1)%len(L)],ci])
    capped.append((L,ci))
V=np.array(V);F=np.array(F)
print('loops',len(loops),'capped',[len(L) for L,_ in capped])
# 3) relax a patch around the cap: Laplacian smoothing, region falls off with distance
mm=trimesh.Trimesh(V,F,process=False)
nbr=defaultdict(set)
for a,b,c2 in F:
    nbr[a]|={b,c2};nbr[b]|={a,c2};nbr[c2]|={a,b}
center=np.array([0,0.765,0.12])
d=np.linalg.norm((V-center)*[1,0.8,1],axis=1)
w=np.clip(1-(d-0.03)/0.05,0,1)  # full relax inside 3cm, fade to 0 at 8cm
active=np.where(w>0)[0]
for it in range(60):
    Vn=V.copy()
    for i in active:
        nb=list(nbr[i])
        if nb: Vn[i]=V[i]+w[i]*0.6*(V[nb].mean(0)-V[i])
    V=Vn
# gentle flattening of the mons: pull very protruding points back
prot=(np.abs(V[:,0])<0.06)&(V[:,1]>0.70)&(V[:,1]<0.86)
zlim=0.155+ (V[:,1]-0.70)*0.12
V[prot,2]=np.minimum(V[prot,2],zlim[prot])
# 4a) smooth away the reference body's nipple cone first
for sx in (-1,1):
    win=(V[:,0]*sx>0.06)&(V[:,0]*sx<0.14)&(V[:,1]>1.17)&(V[:,1]<1.29)&(V[:,2]>0.1)
    ii=np.where(win)[0];tip=V[ii[np.argmax(V[ii,2])]]
    dd=np.linalg.norm((V-tip)[:,:2],axis=1)
    act=np.where((dd<0.03)&(V[:,2]>0.1))[0]
    for it in range(40):
        Vn=V.copy()
        for i in act:
            nb=list(nbr[i])
            if nb: Vn[i]=V[i]+0.7*(V[nb].mean(0)-V[i])
        V=Vn
# 4) breast volume: soft union of the chest surface with a rounded ellipsoid on each side
def smax(a,b,k):
    h=np.clip(0.5+0.5*(a-b)/k,0,1); return a*h+b*(1-h)+k*h*(1-h)
for sx in (-1,1):
    cx,cy=sx*0.097,1.212
    near=(np.abs(V[:,0]-cx)<0.012)&(np.abs(V[:,1]-cy)<0.012)&(V[:,2]>0.1)
    z0=V[near,2].max()-0.028
    rx,ry,rz=0.072,0.068,0.058
    dx=(V[:,0]-cx)/rx; dy=(V[:,1]-cy)/ry
    r2=dx**2+dy**2
    Nn=trimesh.Trimesh(V,F,process=False).vertex_normals
    front=(V[:,2]>0.09)&(Nn[:,2]>0.35)&(np.abs(V[:,0])<0.158)
    inside=(r2<1.0)&front
    ze=z0+rz*np.sqrt(np.clip(1-r2,0,1))
    ze=np.where(r2<1,ze,-1)
    V[inside,2]=smax(V[inside,2],ze[inside],0.014)
    # relax the patch lightly so coarse triangles follow the new curvature
    act=np.where((r2<1.25)&front)[0]
    for it in range(4):
        Vn=V.copy()
        for i in act:
            nb=list(nbr[i])
            if nb: Vn[i,2]=V[i,2]+0.3*(V[nb,2].mean()-V[i,2])
        V=Vn
nv=np.stack([V[:,0],-V[:,2],V[:,1]],1)*1000
t=trimesh.Trimesh(nv,F,process=True)
out[idx]={'id':sk['id'],'name':'Skin','group':'skin','v':np.asarray(t.vertices,np.float32),'f':np.asarray(t.faces,np.int32)}
np.save('build/meshes_f.npy',np.array(out,dtype=object),allow_pickle=True)
print('skin verts',len(t.vertices),'faces',len(t.faces),'watertight',t.is_watertight)
