import { Vector3 } from 'three';
import { shadowOf, cel, furEdge, inkLines, zigzag, KEY_LIGHT, INK } from '../../../../kits/toon';
import { Paint } from '../../../../src/paint';
const colors=['#ffb036','#27dccb','#ffffff','#000000','#808080'];
for(const c of colors) console.log(c,shadowOf(c));
const c=cel('#ff0000'); console.log('cel lit/shadow',c.at(new Vector3(0,0,0),new Vector3(...KEY_LIGHT)),c.at(new Vector3(0,0,0),new Vector3(0,-1,0)));
const f=furEdge('#a','#b',{teeth:0.2,period:0.1}); console.log('fur',f.at(new Vector3(0,0,0),new Vector3(0,1,0)),f.at(new Vector3(0,0,0.03),new Vector3(0,1,0)));
for (const x of [-2,-1,-.5,0,.5,1,2]) console.log('zig',x,zigzag(x));
const i=inkLines('#base',{levels:[0],axis:[0,0,1]}); for(const z of [0,.02,.029,.031,.05]) console.log('ink',z,i.at(new Vector3(),new Vector3(0,0,z)));
try { furEdge('a','b',{teeth:1,period:0}).at(new Vector3(),new Vector3(0,1,0)); console.log('period0 accepted'); } catch(e) { console.log('period0 throws',String(e)); }
