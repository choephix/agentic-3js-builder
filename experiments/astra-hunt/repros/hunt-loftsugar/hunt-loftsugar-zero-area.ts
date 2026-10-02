import { createBuilder } from '../../../../src/builder';
import type { Station } from '../../../../src/sugar';
const b=createBuilder({name:'zero-mid',detail:1}); b.joint('root',{at:[0,0,0]}); const s=b.loft([{at:[0,0,0],w:1,h:1},{at:[0,0,1],w:0,h:0},{at:[0,0,2],w:1,h:1}] satisfies Station[],{color:'#fff'});
let deg=0,tri=0; for(const m of s.meshes){const p=m.geometry.getAttribute('position').array;const ix=m.geometry.index?.array;if(!ix)continue;for(let i=0;i<ix.length;i+=3){tri++;const a=Number(ix[i])*3,b=Number(ix[i+1])*3,c=Number(ix[i+2])*3;const ab=[Number(p[b])-Number(p[a]),Number(p[b+1])-Number(p[a+1]),Number(p[b+2])-Number(p[a+2])],ac=[Number(p[c])-Number(p[a]),Number(p[c+1])-Number(p[a+1]),Number(p[c+2])-Number(p[a+2])];const area=Math.hypot(ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]);if(area<1e-9)deg++;}}
console.log({tri,deg});
