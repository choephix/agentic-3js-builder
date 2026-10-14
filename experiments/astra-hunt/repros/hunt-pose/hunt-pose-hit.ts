import { Vector3 } from 'three';
import { createBuilder } from '../../../../src/builder';
const b=createBuilder({name:'hit',detail:.5});const r=b.joint('r',{at:[0,0,0],dir:[0,1,0]});const ch=b.chain('ch',[[0,0,0],[0,1,0],[0,2,1]],{parent:r});const sw=b.sweep(ch,.2,{color:'#fff',detail:.5});const hit=b.surface(sw).nearest([0,1,0]); const p0=hit.at.clone();b.pose(r,{axis:[1,0,0],deg:45});const p1=hit.at.clone();b.pose(r,{axis:[1,0,0],deg:-45});const p2=hit.at.clone();console.log('hit',p0.toArray(),p1.toArray(),p2.toArray(),'expected',p0.toArray());
