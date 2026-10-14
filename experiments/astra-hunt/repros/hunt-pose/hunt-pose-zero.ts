import { createBuilder } from '../../../../src/builder';
import type { PoseRotation } from '../../../../src/skeleton';
const cases: Array<[string, PoseRotation]> = [['dir',{dir:[0,0,0]}],['aim',{aim:[0,0,0]}]];
for (const [label,rot] of cases) {
 const b=createBuilder({name:label}); const j=b.joint('root',{at:[0,0,0],dir:[0,1,0]});
 try { b.pose(j,rot); console.log(label,'returned',j.at.toArray(),j.quat.toArray(),j.axis.toArray(),j.object.matrixWorld.elements.every(Number.isFinite)); }
 catch(e){console.log(label,'threw',e instanceof Error?e.message:e)}
}
