import * as THREE from 'three';
import { createBuilder } from '../../../../src/builder';
import { blob, sphere, capsule } from '../../../../src/experimental/blob';
import { contour } from '../../../../src/experimental/contour';
import { sculpt } from '../../../../src/experimental/sculpt';
import { polyline } from '../../../../src/path';

function metrics(mesh: THREE.Mesh) {
  const g=mesh.geometry; const p=g.getAttribute('position'); const n=g.getAttribute('normal'); const idx=g.index;
  const edges=new Map<string,number>();
  for(let i=0;i<(idx?idx.count:p.count);i+=3){ const a=idx?idx.getX(i):i,b=idx?idx.getX(i+1):i+1,c=idx?idx.getX(i+2):i+2; for(const [u,v] of [[a,b],[b,c],[c,a]] as const){const k=u<v?`${u},${v}`:`${v},${u}`;edges.set(k,(edges.get(k)||0)+1)}}
  let non=0,max=0; for(const x of edges.values()){if(x!==2)non++;max=Math.max(max,x)}
  let bad=0,zero=0; for(let i=0;i<p.count;i++){for(const a of [p.getX(i),p.getY(i),p.getZ(i),n?.getX(i),n?.getY(i),n?.getZ(i)] as number[]){if(!Number.isFinite(a))bad++} if(n && n.getX(i)**2+n.getY(i)**2+n.getZ(i)**2<0.9)zero++}
  return {v:p.count,tri:(idx?idx.count:p.count)/3,edges:edges.size,non,max,bad,zero,skin:!!mesh.userData.skinBones,attr:Object.keys(g.attributes)};
}
function builder(){const b=createBuilder({name:'probe'}); const root=b.joint('root',{at:[0,1,0]}); return {b,root};}
function oneBlob(cell:number, ingredients: Parameters<typeof blob>[1]=[sphere([0,1,0],.2)]){const {b}=builder(); const part=blob(b,ingredients,{color:'#fff',cell,name:'x'}); console.log('blob',cell,metrics(part.mesh)); return {b,part};}
for (const c of [.5,.2,.1,.05,.02,.01]) oneBlob(c);
for (const sep of [0,.01,.05,.1,.3]) oneBlob(.02,[sphere([-sep/2,1,0],.12),sphere([sep/2,1,0],.12)]);
for (const r of [.001,.003,.005,.01]) {try {oneBlob(.01,[capsule([0,1,0],[0,.1,0],r)]);} catch(e){console.log('thin err',r,String(e))}}
{const {b,root}=builder(); const child=b.joint('child',{parent:root,at:[0,1.2,0],dir:[0,1,0]}); const part=blob(b,[sphere([0,1.15,0],.18,{bone:root}),sphere([0,1.28,0],.18,{bone:child})],{color:'#fff',cell:.03,spread:.04,name:'pose'}); console.log('pose before',metrics(part.mesh),part.mesh.position.toArray()); b.pose(child,{axis:[0,0,1],deg:90}); console.log('pose after',metrics(part.mesh),part.mesh.position.toArray()); }
{const {b}=builder(); const ch=b.chain('ch',polyline([[0,1,0],[0,1,1]])); const s=b.sweep(ch,contour({front:.1,back:.05,left:.02,right:.03,sides:8}),{color:'#fff'}); console.log('contour',s.meshes.map(metrics));}
for (const pairs of [ [[0,.1],[0,.2]], [[.2,.1],[.2,.3]], [[0,.1],[.5,.2],[.5,.4],[1,.1]] ] as ReadonlyArray<ReadonlyArray<readonly [number,number]>>[]) {
  try { const {b}=builder(); const ch=b.chain('x',polyline([[0,1,0],[0,1,.3]])); const s=b.sweep(ch,contour({front:pairs,back:.05,side:.05}),{color:'#fff'}); const p=s.meshes[0].geometry.getAttribute('position'); let bad=0; for(let i=0;i<p.count*3;i++)if(!Number.isFinite(p.array[i]))bad++; console.log('dup contour',JSON.stringify(pairs),metrics(s.meshes[0]),'badpos',bad); } catch(e) {console.log('dup contour err',JSON.stringify(pairs),String(e))}
}
for (const round of [.2,.5,1,2,4,-1]) {try{const {b}=builder();const s=b.sweep(polyline([[0,1,0],[0,1,.3]]),contour({front:.1,back:.05,side:.06,round,sides:8}),{color:'#fff'}); const p=s.meshes[0].geometry.getAttribute('position');let minx=1e9,maxx=-1e9,miny=1e9,maxy=-1e9;for(let i=0;i<p.count;i++){minx=Math.min(minx,p.getX(i));maxx=Math.max(maxx,p.getX(i));miny=Math.min(miny,p.getY(i));maxy=Math.max(maxy,p.getY(i))}console.log('round',round,{minx,maxx,miny,maxy});}catch(e){console.log('round err',round,String(e))}}
{const {b,root}=builder(); const p=b.part(new THREE.SphereGeometry(.2,8,6),'#fff',{bone:root,at:[0,1,0]}); const sc=sculpt(b,{mirror:false}); sc.push(p,{at:[0,1,0],dir:[0,1,0],amount:.1,radius:.12,edge:.02}); console.log('sculpt indexed',metrics(p.mesh));}
