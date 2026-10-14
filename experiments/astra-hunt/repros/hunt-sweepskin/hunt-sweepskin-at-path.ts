import {createBuilder} from '../../../../src/builder';
const b=createBuilder(); const hips=b.joint('hips',{at:[0,0,0]}); const c=b.chain('leg',[[0,0,0],[0,1,0],[0,2,0]],{parent:hips,names:['leg1','leg2']}); const s=b.sweep(c,.2,{color:'#fff'});
console.log('path',c.path.at(.75).toArray(), 's',s.at(.75).at.toArray()); b.pose('leg2',{axis:[0,0,1],deg:60}); console.log('path2',c.path.at(.75).toArray(), 's2',s.at(.75).at.toArray());
