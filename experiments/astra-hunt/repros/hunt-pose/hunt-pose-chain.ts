import { Vector3 } from 'three';
import { createBuilder } from '../../../../src/builder';
const b=createBuilder({name:'chain',detail:.5});const r=b.joint('r',{at:[0,0,0],dir:[0,1,0]});const ch=b.chain('ch',[[0,0,0],[0,1,0],[0,2,1]],{parent:r});const s=b.sweep(ch,.15,{color:'#fff',detail:.5});
const rest=ch.path.at(.3); const restCurve=s.curve(); const restp=restCurve.at(.3);
b.pose(r,{axis:[1,0,0],deg:33}); const p=ch.at(.3).at; const q=s.curve().at(.3); const m=r.object.matrixWorld; console.log('rest',rest.toArray(),restp.toArray(),'posedchain',p.toArray(),'delta',new Vector3().copy(rest).applyMatrix4(m).toArray(),'sweep',q.toArray());
for(const t of [0,.2,.5,.8,1]) console.log(t,'chain',ch.at(t).at.toArray(),'exp',new Vector3().copy(ch.path.at(t)).applyMatrix4(m).toArray());
