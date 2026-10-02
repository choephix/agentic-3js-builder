import { createBuilder } from '../../../../src/builder';
function alternate(n:number){const b=createBuilder({name:'d',detail:.5});const r=b.joint('r',{at:[0,0,0],dir:[0,1,0]});const c=b.chain('c',[[0,0,0],[0,1,0],[0,2,1]],{parent:r});const s=b.sweep(c,.1,{color:'#fff',detail:.5});for(let i=0;i<n;i++)b.pose(r,{axis:[1,0,0],deg:(i%2?-.1:.1)});return {r,c,s};}
function same(n:number){const b=createBuilder({name:'same'});const r=b.joint('r',{at:[0,0,0],dir:[0,1,0]});for(let i=0;i<n;i++)b.pose(r,{axis:[1,0,0],deg:.1});return r.axis;}
for(const n of [10,100,1000,10000]){const {r,c,s}=alternate(n);console.log('alt',n,r.axis.toArray(),c.at(1).at.toArray(),s.meshes[0].geometry.getAttribute('position').array.slice(0,3));}
for(const n of [10,100,1000,10000]) console.log('same',n,same(n).toArray());
