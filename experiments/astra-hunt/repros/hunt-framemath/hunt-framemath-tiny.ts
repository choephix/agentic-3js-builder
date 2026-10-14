import {aim} from '../../../../src/math';
for(const d of [[1e-160,0,0],[1e-200,0,0],[Number.MIN_VALUE,0,0],[Infinity,0,0],[NaN,0,0]]) {try {const q=aim(d); console.log('aim',d,'q',q.toArray());}catch(e){console.log('aim',d,'ERR',String(e));}}
