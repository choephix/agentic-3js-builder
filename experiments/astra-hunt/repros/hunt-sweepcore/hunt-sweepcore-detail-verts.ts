import { createBuilder } from '../../../../src/builder';
const b=createBuilder({name:'d',detail:.2});b.joint('r',{at:[0,0,0]});const sw=b.sweep([[0,0,0],[0,0,1],[1,0,1]],.1,{color:'#fff'});for(const m of sw.meshes){const p=m.geometry.getAttribute('position');for(let i=0;i<p.count;i++)console.log(i,[p.getX(i),p.getY(i),p.getZ(i)]);}
