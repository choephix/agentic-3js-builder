import { stepped } from '../../../../kits/pixel';
const spans:[[number,number],[number,number],[number,number],[number,number]]=[[0,3],[0,3],[1,3],[1,2]];
console.log('rows',stepped(spans,1,{rows:true}));
console.log('columns',stepped(spans,1));
