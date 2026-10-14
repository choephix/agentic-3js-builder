import { createBuilder } from '../../../../src/builder';
import { polyline } from '../../../../src/path';
const b = createBuilder({name:'types'});
const root = b.joint('root',{at:[0,0,0]});
const result = b.sprout('stem',root,polyline([[0,0,0],[0,1,0]]),.1,{count:2,color:'#f00'});
result.chain.at(0);
