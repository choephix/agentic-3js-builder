import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { Chain } from "../../../../src/skeleton";
const b=createBuilder({name:"sym",detail:1});const root=b.joint("root",{at:[0,1,0]});
const arms: Chain[]=[];for(const s of [1,-1] as const){const side=s>0?"L":"R";const c=b.chain(`arm${side}`,[[s*.1,1,.2],[s*.4,1.2,.1],[s*.7,1,-.1]],{parent:root,names:[`a${side}1`,`a${side}2`,`a${side}3`]});b.sweep(c,.04,{name:`arm${side}`,color:"#888"});arms.push(c);}
const rootObj=b.root;rootObj.updateMatrixWorld(true);const ms: THREE.Mesh[]=[];rootObj.traverse(o=>{if((o as THREE.Mesh).isMesh)ms.push(o as THREE.Mesh)});
const pos=(m:THREE.Mesh)=>{const a:number[]=[];const p=m.geometry.getAttribute("position");const v=new THREE.Vector3();for(let i=0;i<p.count;i++)a.push(...v.fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld).toArray());return a};
const l=pos(ms.find(m=>m.name==="armL")!),r=pos(ms.find(m=>m.name==="armR")!);let max=0,nearest=0;for(let i=0;i<l.length;i+=3){let best=Infinity;for(let j=0;j<r.length;j+=3)best=Math.min(best,Math.hypot(l[i]+r[j],l[i+1]-r[j+1],l[i+2]-r[j+2]));nearest=Math.max(nearest,best);max=Math.max(max,Math.abs(l[i]+r[i]),Math.abs(l[i+1]-r[i+1]),Math.abs(l[i+2]-r[i+2]));}console.log({l:l.length/3,r:r.length/3,max,nearest});
