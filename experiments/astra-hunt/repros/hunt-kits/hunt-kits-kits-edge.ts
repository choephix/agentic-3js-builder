import { Vector3 } from 'three';
import { metal, panelled, gearSize, gearTrain } from '../../../../kits/clockwork';
import { furEdge, cel, inkLines } from '../../../../kits/toon';
import { tileBox, pixelArt, skinLayout } from '../../../../kits/pixel';
import { createBuilder } from '../../../../src/builder';
const n=new Vector3(0,-1,0), p=new Vector3(.013,.022,.031);
for(const o of [{polish:2},{polish:-1},{tarnish:2},{tarnish:-1},{verdigris:2},{verdigris:-1},{size:0}]) { try {const c=metal('brass',o).at(p,n); console.log('metal',o,c, c.some(v=>!Number.isFinite(v)||v<0||v>1));} catch(e){console.log('metal err',o,String(e));}}
for(const o of [{size:0},{size:-.1},{aspect:0},{rivets:-.1}]) {try {const c=panelled('#fff',o).at(p,n); console.log('panel',o,c,c.some(v=>!Number.isFinite(v)||v<0||v>1));}catch(e){console.log('panel err',o,String(e));}}
for(const o of [{teeth:8.4,module:.01},{teeth:7.9,module:.01},{teeth:8,module:-.01},{teeth:8,module:.01,thickness:-.1},{teeth:8,module:.01,bore:-.1}]) {try {console.log('gear',o,gearSize(o));}catch(e){console.log('gear err',o,String(e));}}
for(const o of [{teeth:8,module:.01},{teeth:8,module:.01,angle:NaN},{teeth:8,module:.01,angle:0}] as const) {try {const b=createBuilder({name:'x'});const root=b.joint('root',{at:[0,1,0]}); const t=gearTrain(b,{at:[0,1,0],axis:[0,1,0],module:.01,bone:root,gears:[o]});console.log('train',o,t.gears[0].at.toArray());}catch(e){console.log('train err',o,String(e));}}
for(const o of [{teeth:1,period:.1},{teeth:-1,period:.1},{teeth:.1,period:0},{teeth:.1,period:-.1}]) {try {const q=furEdge('#fff','#000',o); console.log('fur',o,q.at(p,new Vector3(0,1,0)));}catch(e){console.log('fur err',o,String(e));}}
for(const o of [{threshold:2},{threshold:-1},{light:[0,0,0] as [number,number,number]}]) {try {const q=cel('#fff','#000',o); console.log('cel',o,q.at(p,new Vector3(0,1,0)));}catch(e){console.log('cel err',o,String(e));}}
for(const o of [{levels:[2]},{levels:[-2]},{width:0},{width:-1}]) {try {const q=inkLines('#fff',o); console.log('ink',o,q.at(p,new Vector3(0,1,0)));}catch(e){console.log('ink err',o,String(e));}}
for(const [name,fn] of [['tile step zero',()=>tileBox([1,1,1],pixelArt(['a'],{a:'#fff'}),.1,{rand:()=>.5,step:0})],['skin bad',()=>skinLayout({x:[0,1,1]})]] as const) {try {console.log(name,fn());}catch(e){console.log(name,'err',String(e));}}
