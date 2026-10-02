import { createBuilder } from '../../../../src/builder';
for(const kind of ['dir','aim'] as const){const b=createBuilder({name:kind});const j=b.joint('j',{at:[0,0,0],dir:[0,1,0]});for(let i=0;i<1000;i++)b.pose(j,kind==='dir'?{dir:[0,0,1]}:{aim:[0,0,1]});console.log(kind,j.axis.toArray(),j.quat.toArray());}
