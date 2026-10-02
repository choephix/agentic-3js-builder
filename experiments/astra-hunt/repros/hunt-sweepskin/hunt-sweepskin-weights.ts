import {createBuilder} from '../../../../src/builder';
const b=createBuilder({name:'weights'}); const root=b.joint('root',{at:[0,0,0]}); const c=b.chain('c',[[0,0,0],[0,1,0],[0,2,0]],{parent:root,names:['c1','c2']});
const vals=[.0,.3,.4,.5,.6,.7,1].map(t=>({t,w:c.weightsAt(t).map(([j,w])=>[j.name,w]),sum:c.weightsAt(t).reduce((a,[,w])=>a+w,0)}));
const rigid=b.sweep(c,.1,{skin:'rigid',color:'#fff'}); console.log(JSON.stringify({vals,rigidMeshes:rigid.meshes.length,rigidBones:rigid.meshes.map(m=>m.userData.skinBones),hasSkin:rigid.meshes.some(m=>Boolean(m.geometry.getAttribute('skinWeight')))}));
