import json, numpy as np, struct, sys
out=list(np.load(sys.argv[1] if len(sys.argv)>1 else 'build/meshes.npy',allow_pickle=True))
dst=sys.argv[2] if len(sys.argv)>2 else 'build/anatomy.bin'
# three.js frame: X = body left, Y = up, Z = front ; metres
def conv(v): return np.stack([v[:,0], v[:,2], -v[:,1]],1)/1000.0
allv=np.concatenate([conv(o['v']) for o in out])
lo=allv.min(0);hi=allv.max(0);
ctr=np.array([0.0,0.0,(lo[2]+hi[2])/2]); 
lo2=lo-ctr;hi2=hi-ctr;scale=(hi2-lo2)/65534.0
meta=[];P=[];I=[];vo=0;io=0
for o in out:
    v=conv(o['v'])-ctr;q=np.round((v-lo2)/scale-32767).astype(np.int16)
    f=o['f'].astype(np.uint16) if len(v)<65535 else None
    assert f is not None
    meta.append({'id':o['id'],'name':o['name'],'g':o['group'],'v0':vo,'vn':len(v),'i0':io,'in':int(f.size),
                 'c':[round(float(x),4) for x in v.mean(0)],'lo':[round(float(x),4) for x in v.min(0)],'hi':[round(float(x),4) for x in v.max(0)]})
    P.append(q.reshape(-1));I.append(f.reshape(-1));vo+=len(v);io+=f.size
head=json.dumps({'lo':[float(x) for x in lo2],'scale':[float(x) for x in scale],'meshes':meta},separators=(',',':')).encode()
head+=b' '*((4-len(head)%4)%4)
P=np.concatenate(P);I=np.concatenate(I)
with open(dst,'wb') as fh:
    fh.write(b'ANAT');fh.write(struct.pack('<III',len(head),P.size,I.size));fh.write(head);fh.write(P.tobytes())
    if P.nbytes%4: fh.write(b'\0'*(4-P.nbytes%4))
    fh.write(I.tobytes())
import os;print(dst,os.path.getsize(dst)/1e6,'MB', 'verts',vo,'idx',io,'bbox',lo2.round(3),hi2.round(3))
