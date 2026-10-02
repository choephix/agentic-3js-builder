import { createBuilder } from '../../../../src/builder';
import type { Station } from '../../../../src/sugar';

function inspect(label: string, stations: Station[]) {
 const b=createBuilder({name:label, detail:1}); b.joint('root',{at:[0,0,0]});
 try {const s=b.loft(stations,{color:'#fff'}); const path=s.curve(); console.log(label,'knots',path.knots); for (const t of [0,.1,.25,.5,.75,.9,1]) {const p=s.at(t,0); console.log(t,'curve',path.at(t).toArray().map(v=>+v.toFixed(4)),'r',p.radius,'pos',p.at.toArray().map(v=>+v.toFixed(4)));}} catch(e){console.log(label,'THREW',String(e));}
}
inspect('normal3',[{at:[0,0,0],w:1,h:1},{at:[0,0,1],w:2,h:2},{at:[0,0,2],w:1,h:1}]);
inspect('dup-first',[{at:[0,0,0],w:1,h:1},{at:[0,0,0],w:2,h:2},{at:[0,0,2],w:1,h:1}]);
inspect('dup-last',[{at:[0,0,0],w:1,h:1},{at:[0,0,2],w:2,h:2},{at:[0,0,2],w:1,h:1}]);
