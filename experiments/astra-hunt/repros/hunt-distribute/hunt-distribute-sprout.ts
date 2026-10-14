import { createBuilder } from '../../../../src/builder';
import { polyline } from '../../../../src/path';
import type { Chain } from '../../../../src/skeleton';
import type { Sweep } from '../../../../src/sweep';
import { Vector3 } from 'three';
function v(x: Vector3) { return [Number(x.x.toFixed(5)), Number(x.y.toFixed(5)), Number(x.z.toFixed(5))]; }
type Result = {chain: Chain|null; sweep: Sweep};
function summary(label:string, result: Result) {
  const c=result.chain;
  console.log(label, 'chain?', c===null?'null':{joints:c.joints.map((j)=>j.name),tip:c.tip?.name ?? null,ts:c.ts,pathKnots:c.path.knots,pathStart:v(c.path.at(0)),pathEnd:v(c.path.at(1))}, 'sweep',{from:result.sweep.from,to:result.sweep.to,frame:v(result.sweep.frame.at),at0:v(result.sweep.at(0).at),at1:v(result.sweep.at(1).at)});
}
const b=createBuilder({name:'sprout'}); const root=b.joint('root',{at:[0,1,0],dir:[0,1,0]});
summary('default-tip',b.sprout('horn',root,[0,1,1],0.1,{color:'#f00'}));
summary('two-count',b.sprout('tail',root,polyline([[0,1,0.3],[0,1,1],[0,1,2]]),[.1,.05],{count:2,color:'#f00'}));
summary('zero-count',b.sprout('hair',root,[0,1,1],.1,{count:0,color:'#f00'}));
summary('three-count',b.sprout('fin',root,[0,1,1],.1,{count:3,color:'#f00',names:['a','b','c']}));
const b2=createBuilder({name:'off'}); const r2=b2.joint('root',{at:[0,0,0],dir:[0,1,0]});
summary('path-off',b2.sprout('off',r2,polyline([[0,0,1],[0,0,2],[0,0,3]]),.1,{color:'#f00'}));
const b3=createBuilder({name:'pose'}); const r3=b3.joint('root',{at:[0,0,0],dir:[0,1,0]}); const s=b3.sprout('pose',r3,[0,1,1],.1,{color:'#f00'}); if (!s.chain) throw new Error('expected chain'); const item=s.chain.at(.5); console.log('before pose', {joint:v(s.chain.joints[0].at),point:v(item.at),sweep:v(s.sweep.at(.5).at)}); b3.pose(r3,{axis:[0,0,1],deg:90}); console.log('after pose', {joint:v(s.chain.joints[0].at),point:v(s.chain.at(.5).at),sweep:v(s.sweep.at(.5).at),frame:v(s.sweep.frame.at)});
