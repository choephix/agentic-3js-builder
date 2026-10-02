import { createBuilder } from '../../../../src/builder';
const b=createBuilder({name:'box'});b.joint('r',{at:[0,0,0]});const sw=b.sweep([[0,0,0],[0,0,1],[1,0,1]],.2,{color:'#fff',section:'box',skin:'rigid'});const p=sw.meshes[0].geometry.getAttribute('position');for(let i=0;i<p.count;i++){const q=[p.getX(i),p.getY(i),p.getZ(i)];if(Math.abs(q[2]-1)<.21 || Math.abs(q[0])<.21)console.log(i,q);}
