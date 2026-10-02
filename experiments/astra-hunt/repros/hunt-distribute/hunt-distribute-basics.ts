import { createBuilder } from '../../../../src/builder';
import { frame } from '../../../../src/frame';
import { polyline, Path } from '../../../../src/path';
import type { FrameInput } from '../../../../src/math';
import type { RingOptions, PathPoint } from '../../../../src/distribute';
import type { Chain, ChainPoint } from '../../../../src/skeleton';
import type { Sweep, SweepPoint } from '../../../../src/sweep';
import { Vector3 } from 'three';

type AlongOptions = { from?: number; to?: number };
type Desc = { t:number; at:number[]; axis:number[]; normal?:number[]; tangent?:number[] };
function v(x: Vector3) { return [Number(x.x.toFixed(6)), Number(x.y.toFixed(6)), Number(x.z.toFixed(6))]; }
function printRing(label: string, on: FrameInput, options: RingOptions) {
  const b = createBuilder({ name: label });
  const result = b.ring(on, options);
  console.log(label, 'items', result.items.map((x) => ({i:x.i,t:x.t,at:v(x.at),axis:v(x.axis),bone:x.bone?.name ?? null})));
}
printRing('horizontal', frame([0,0,0], [0,0,1]), {count:4,radius:1});
printRing('vertical', frame([0,0,0], [0,1,0]), {count:4,radius:1});
printRing('single-full', frame([0,0,0], [0,1,0]), {count:1,radius:1});
printRing('single-partial', frame([0,0,0], [0,1,0]), {count:1,radius:1,fromDeg:10,toDeg:110});
printRing('zero', frame([0,0,0], [0,1,0]), {count:0,radius:1});
for (const count of [-1, 1.5, 2.5]) {
  try { printRing('count-'+count, frame([0,0,0], [0,1,0]), {count,radius:1}); }
  catch (e) { console.log('ring count',count,'THREW',String(e)); }
}
const b = createBuilder({name:'groups'}); const root=b.joint('root',{at:[0,0,0]});
for (const opts of [{count:4,radius:1,joints:2,name:'g'},{count:4,radius:1,joints:1.5,name:'h'},{count:0,joints:1,name:'z'}]) {
  try {
    const result = b.ring(root, opts);
    console.log('group',opts,'joints',result.joints.map((joint)=>({name:joint.name,at:v(joint.at),axis:v(joint.axis)})),'items',result.items.map((item)=>item.bone?.name));
  }
  catch(e) { console.log('group',opts,'THREW',String(e)); }
}
function describe(at: { t:number; at:Vector3; axis:Vector3; normal?:Vector3; tangent?:Vector3 }): Desc {
  const result: Desc = {t:at.t,at:v(at.at),axis:v(at.axis)};
  if (at.normal) result.normal = v(at.normal);
  if (at.tangent) result.tangent = v(at.tangent);
  return result;
}
function printPathAlong(source: Path, count:number, options: AlongOptions = {}) {
  const b = createBuilder({name:'path'}); const out: Desc[]=[];
  const ret = b.along(source, count, (at: PathPoint) => out.push(describe(at)), options);
  console.log('along path',count,options,'ret',ret.length,'cb',out);
}
function printChainAlong(source: Chain, count:number, options: AlongOptions = {}) {
  const b = createBuilder({name:'chain'}); const out: Desc[]=[];
  const ret = b.along(source, count, (at: ChainPoint) => out.push(describe(at)), options);
  console.log('along chain',count,options,'ret',ret.length,'cb',out);
}
function printSweepAlong(source: Sweep, count:number, options: AlongOptions = {}) {
  const b = createBuilder({name:'sweep'}); const out: Desc[]=[];
  const ret = b.along(source, count, (at: SweepPoint) => out.push(describe(at)), options);
  console.log('along sweep',count,options,'ret',ret.length,'cb',out);
}
const p=polyline([[0,0,0],[0,0,2]]);
for (const n of [1,4,0,-1,1.5,2.5]) { try { printPathAlong(p,n); } catch (e) { console.log('along path',n,'THREW',String(e)); } }
const bc=createBuilder({name:'chain'}); const jr=bc.joint('r',{at:[0,0,0]}); const c=bc.chain('c',polyline([[0,0,0],[0,0,1],[0,0,3]]),{parent:jr});
const bs=createBuilder({name:'sweep'}); const sr=bs.joint('r',{at:[0,0,0]}); const sw=bs.sweep(polyline([[0,0,0],[0,0,1],[0,0,3]]),.1,{bone:sr,color:'#f00',from:.25,to:.75});
printSweepAlong(sw,4); printSweepAlong(sw,2,{from:.3,to:.7});
