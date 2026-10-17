import json, numpy as np, trimesh, fast_simplification as fs, struct, sys
m=json.load(open('manifest.json'))
root='bp3d/assets/BodyParts3D_data/stl/'
BUDGET={'skin':52000,'skull':14000,'vert':26000,'disc':6000,'thorax':20000,'arm':16000,'finger':11000,'pelvis':7000,'leg':22000,
        'heart':9000,'artery':7000,'vein':4000,'brain':26000,'endo':3000,'gut':16000,'other':14000}
HIGH={'Sixth cervical vertebra':2.5,'Seventh cervical vertebra':2.5,'Fifth cervical vertebra':1.6,'Third lumbar vertebra':1.6,'Fourth lumbar vertebra':2,'Fifth lumbar vertebra':2,
      'Intervertebral disk of sixth cervical vertebra':3,'Pituitary gland':2,'hypothalamus, nsn':2,'Stomach':2.5,'Thyroid cartilage':1.5}
out=[]
for g,parts in m.items():
    meshes=[(a,b,trimesh.load(root+a+'.stl',force='mesh')) for a,b in parts]
    w=[max(len(t.faces),1)**0.6*HIGH.get(b,1) for a,b,t in meshes]   # sublinear share so small parts keep shape
    for (a,b,t),wi in zip(meshes,w):
        target=max(120,int(BUDGET[g]*wi/sum(w)))
        t.merge_vertices()
        v=np.asarray(t.vertices,dtype=np.float64);f=np.asarray(t.faces,dtype=np.int64)
        if len(f)>target:
            v,f=fs.simplify(v.astype(np.float32),f.astype(np.int32),target_reduction=1-target/len(f))
        tm=trimesh.Trimesh(v,f,process=True)
        out.append({'id':a,'name':b,'group':g,'v':np.asarray(tm.vertices,np.float32),'f':np.asarray(tm.faces,np.int32)})
    print(g,sum(len(o['f']) for o in out if o['group']==g),'tris',flush=True)
np.save('build/meshes.npy',np.array(out,dtype=object),allow_pickle=True)
print('total',sum(len(o['f']) for o in out))
