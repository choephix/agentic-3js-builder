import {offset} from '../../../../src/math';
try { console.log('offset zero:', offset([1,2,3], [0,0,0], 2).toArray()); } catch (e) { console.log('offset zero error:', String(e)); }
