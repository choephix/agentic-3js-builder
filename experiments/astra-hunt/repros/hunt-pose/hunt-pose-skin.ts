import { Vector3 } from 'three';
import { createBuilder } from '../../../../src/builder';

function build(poseFirst:boolean) {
 const b=createBuilder({name:poseFirst?'fresh':'late',detail:0.5});
 const r=b.joint('root',{at:[0,0,0],dir:[0,1,0]});
 const c=b.joint('child',{parent:r,at:[0,1,0],dir:[0,1,1]});
 const chain=b.chain('body',[[0,0,0],[0,1,0],[0,2,1]],{parent:r});
 const s=b.sweep(chain,0.18,{detail:0.5,color:'#fff'});
 if (poseFirst) b.pose(r,{axis:[1,0,0],deg:33});
 if (!poseFirst) b.pose(r,{axis:[1,0,0],deg:33});
 return {b,s,mesh:s.meshes[0]};
}
const a=build(false), f=build(true);
const pa=a.mesh.geometry.getAttribute('position'), pf=f.mesh.geometry.getAttribute('position');
let max=0, bad=0;
for(let i=0;i<pa.count;i++){const va=new Vector3().fromBufferAttribute(pa,i).applyMatrix4(a.mesh.matrixWorld); const vf=new Vector3().fromBufferAttribute(pf,i).applyMatrix4(f.mesh.matrixWorld); const d=va.distanceTo(vf); max=Math.max(max,d);if(d>1e-5) bad++;}
console.log('mesh',pa.count,'maxWorldDiff',max,'bad',bad);
