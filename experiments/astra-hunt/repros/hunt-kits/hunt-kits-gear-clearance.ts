import { Vector3 } from 'three';
import { createBuilder } from '../../../../src/builder';
import { gearTrain } from '../../../../kits/clockwork';
const pairs:[[number,number],...Array<[number,number]>]=[[8,8],[8,9],[8,60],[9,60],[12,13],[20,10],[30,17],[60,8]];
for(const [a,b] of pairs){for(const angle of [0,15,45,90,180]){const bb=createBuilder({name:`g${a}_${b}_${angle}`});const root=bb.joint('root',{at:[0,1,0]});try{const t=gearTrain(bb,{at:[0,1,0],axis:[0,1,0],module:.01,bone:root,arbor:false,gears:[{teeth:a},{teeth:b,angle}]}); const d=t.gears[0].at.distanceTo(t.gears[1].at); const need=t.gears[0].size.pitch+t.gears[1].size.pitch; console.log(a,b,angle,'distance',d,'pitchSum',need,'outerSum',t.gears[0].size.outer+t.gears[1].size.outer,'phase',t.gears[1].phase);}catch(e){console.log('ERR',a,b,angle,String(e));}}}
