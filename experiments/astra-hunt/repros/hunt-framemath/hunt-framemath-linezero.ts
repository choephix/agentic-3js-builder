import {line} from '../../../../src/frame';
try { const f=line([1,2,3],[1,2,3]); console.log('line',f.at.toArray(),f.end.toArray(),f.length); } catch (e) { console.log('line coincident error:',String(e)); }
